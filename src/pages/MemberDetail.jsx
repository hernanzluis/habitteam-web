import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function calculateStreak(logs, habitId) {
  const days = new Set(
    logs
      .filter((l) => l.habit_id === habitId)
      .map((l) => new Date(l.created_at).toDateString())
  );
  let streak = 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (days.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function getCalendarDays(year, month, logs, habitId) {
  const habitLogs = new Set(
    logs
      .filter((l) => l.habit_id === habitId)
      .map((l) => {
        const d = new Date(l.created_at);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
  );
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  // Padding: start from Monday (0=Mon offset)
  let startDow = firstDay.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ day: d, hasLog: habitLogs.has(`${year}-${month}-${d}`) });
  }
  return days;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAY_LABELS = ['L','M','X','J','V','S','D'];

function HabitCalendar({ logs, habitId }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const days = getCalendarDays(year, month, logs, habitId);

  const prev = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const next = () => {
    const n = new Date();
    if (year > n.getFullYear() || (year === n.getFullYear() && month >= n.getMonth())) return;
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-2">
        <button onClick={prev} className="text-gray-400 hover:text-black px-1 text-lg leading-none">‹</button>
        <span className="text-xs font-semibold text-gray-600">{MONTH_NAMES[month]} {year}</span>
        <button onClick={next} className="text-gray-400 hover:text-black px-1 text-lg leading-none">›</button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[10px] text-gray-400 font-medium pb-1">{d}</div>
        ))}
        {days.map((cell, i) =>
          cell === null ? (
            <div key={`empty-${i}`} />
          ) : (
            <div
              key={cell.day}
              className={`aspect-square rounded-full flex items-center justify-center text-[11px] font-medium mx-auto w-6 h-6 ${
                cell.hasLog ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
              }`}
            >
              {cell.day}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function MemberDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [member, setMember] = useState(null);
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [validations, setValidations] = useState([]);
  const [validatorNames, setValidatorNames] = useState({});
  const [lightboxUrl, setLightboxUrl] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { navigate('/acceder'); return; }
      const { data: prof } = await supabase
        .from('profiles')
        .select('role, company_id')
        .eq('id', authUser.id)
        .single();
      if (!prof || prof.role !== 'admin') { navigate('/acceder'); return; }
      setChecking(false);
    };
    checkAuth();
  }, [navigate]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [
        { data: profileData, error: pErr },
        { data: assignmentsData, error: aErr },
      ] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email, avatar_url, created_at').eq('id', userId).single(),
        supabase.from('habit_assignments').select('habit_id').eq('user_id', userId),
      ]);
      if (pErr) throw pErr;
      if (aErr) throw aErr;

      const habitIds = (assignmentsData || []).map((a) => a.habit_id);

      const [
        { data: habitsData, error: hErr },
        { data: categoriesData, error: cErr },
        { data: logsData, error: lErr },
      ] = await Promise.all([
        habitIds.length > 0
          ? supabase.from('habits').select('id, title, recurrence, weekly_target, category_id').in('id', habitIds)
          : Promise.resolve({ data: [], error: null }),
        supabase.from('categories').select('id, name, icon, color'),
        supabase.from('habit_logs').select('id, habit_id, photo_url, status, created_at').eq('user_id', userId).order('created_at', { ascending: false }),
      ]);
      if (hErr) throw hErr;
      if (cErr) throw cErr;
      if (lErr) throw lErr;

      const categoryMap = {};
      (categoriesData || []).forEach((c) => { categoryMap[c.id] = c; });

      const enrichedHabits = (habitsData || []).map((h) => ({
        ...h,
        category: categoryMap[h.category_id] || null,
      }));

      const logIds = (logsData || []).map((l) => l.id);
      let validationsData = [];
      let validatorIds = [];

      if (logIds.length > 0) {
        const { data: vd, error: vErr } = await supabase
          .from('habit_validations')
          .select('id, habit_log_id, validator_id, status, reaction, comment, created_at')
          .in('habit_log_id', logIds)
          .order('created_at', { ascending: false })
          .limit(50);
        if (vErr) throw vErr;
        validationsData = vd || [];
        validatorIds = [...new Set(validationsData.map((v) => v.validator_id))];
      }

      let namesMap = {};
      if (validatorIds.length > 0) {
        const { data: validators } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', validatorIds);
        (validators || []).forEach((v) => { namesMap[v.id] = v.full_name; });
      }

      const logHabitMap = {};
      (logsData || []).forEach((l) => { logHabitMap[l.id] = l.habit_id; });

      const enrichedValidations = validationsData.map((v) => ({
        ...v,
        habitTitle: enrichedHabits.find((h) => h.id === logHabitMap[v.habit_log_id])?.title || '—',
        validatorName: namesMap[v.validator_id] || 'Desconocido',
      }));

      setMember(profileData);
      setHabits(enrichedHabits);
      setLogs(logsData || []);
      setValidations(enrichedValidations);
      setValidatorNames(namesMap);
    } catch (e) {
      setError(e.message || 'Error cargando datos del miembro');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { if (!checking) loadData(); }, [checking, loadData]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Verificando acceso...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/admin')}
          className="text-sm text-gray-500 hover:text-black transition-colors flex items-center gap-1"
        >
          ← Volver
        </button>
        <span className="text-gray-200">|</span>
        <span className="text-lg font-black text-black tracking-tight">HabitTeam</span>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-12">Cargando...</p>
        ) : error ? (
          <p className="text-sm text-red-600 text-center py-12">{error}</p>
        ) : !member ? null : (
          <>
            {/* Perfil */}
            <div className="bg-white border border-gray-200 p-6 flex items-center gap-5">
              {member.avatar_url ? (
                <img
                  src={`${member.avatar_url}?t=${Date.now()}`}
                  alt={member.full_name}
                  className="w-16 h-16 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <span className="text-2xl font-black text-[#0A66C2]">
                    {(member.full_name || '?')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="text-lg font-bold text-black">{member.full_name}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Miembro desde {formatDate(member.created_at)} · 🔥{' '}
                  {(() => {
                    const days = new Set(logs.map((l) => new Date(l.created_at).toDateString()));
                    let streak = 0;
                    const d = new Date(); d.setHours(0,0,0,0);
                    while (days.has(d.toDateString())) { streak++; d.setDate(d.getDate() - 1); }
                    return streak;
                  })()} días de racha
                </p>
              </div>
            </div>

            {/* Hábitos */}
            <section>
              <h2 className="text-base font-bold text-black mb-4">Hábitos asignados</h2>
              {habits.length === 0 ? (
                <p className="text-sm text-gray-400">Sin hábitos asignados</p>
              ) : (
                <div className="space-y-4">
                  {habits.map((habit) => {
                    const habitLogs = logs.filter((l) => l.habit_id === habit.id);
                    const streak = calculateStreak(logs, habit.id);
                    const photos = habitLogs
                      .filter((l) => l.photo_url)
                      .slice(0, 3);
                    const completionRate = habitLogs.length > 0
                      ? Math.round((habitLogs.length / Math.max(1, Math.ceil((Date.now() - new Date(member.created_at).getTime()) / 86400000))) * 100)
                      : 0;

                    return (
                      <div key={habit.id} className="bg-white border border-gray-200 p-5">
                        {/* Habit header */}
                        <div className="flex items-center gap-3 mb-3">
                          {habit.category && (
                            <span
                              className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
                              style={{ backgroundColor: habit.category.color + '22' }}
                            >
                              {habit.category.icon}
                            </span>
                          )}
                          <div>
                            <p className="text-sm font-bold text-black">{habit.title}</p>
                            <p className="text-xs text-gray-400">
                              {habit.category?.name || 'Sin categoría'} · 🔥 {streak} días de racha · {habitLogs.length} completados ({completionRate}%)
                            </p>
                          </div>
                        </div>

                        {/* Calendario */}
                        <HabitCalendar logs={logs} habitId={habit.id} />

                        {/* Fotos */}
                        {photos.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Últimas fotos</p>
                            <div className="flex gap-2">
                              {photos.map((log) => (
                                <button
                                  key={log.id}
                                  onClick={() => setLightboxUrl(log.photo_url)}
                                  className="flex flex-col items-center gap-1"
                                >
                                  <img
                                    src={log.photo_url}
                                    alt="foto"
                                    className="w-16 h-16 object-cover rounded border border-gray-200 hover:opacity-80 transition-opacity"
                                  />
                                  <span className="text-[10px] text-gray-400">{formatDate(log.created_at)}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Validaciones */}
            <section>
              <h2 className="text-base font-bold text-black mb-4">Últimas validaciones recibidas</h2>
              {validations.length === 0 ? (
                <p className="text-sm text-gray-400">Sin validaciones todavía</p>
              ) : (
                <div className="bg-white border border-gray-200 divide-y divide-gray-100">
                  {validations.slice(0, 10).map((v) => (
                    <div key={v.id} className="px-5 py-3 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black truncate">{v.habitTitle}</p>
                        <p className="text-xs text-gray-500">
                          {v.validatorName}{v.reaction ? ` ${v.reaction}` : ''}
                          {v.comment ? <span className="italic text-gray-400"> · "{v.comment}"</span> : null}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{timeAgo(v.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            alt="foto completa"
            className="max-w-full max-h-full object-contain rounded"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
