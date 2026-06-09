import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

function getWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getTodayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function calculateStreak(logs, userId) {
  const days = new Set(
    logs
      .filter((l) => l.user_id === userId)
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

function getWeekDots(logs, userId) {
  const weekStart = getWeekStart();
  const dots = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    const dayStr = day.toDateString();
    const hasLog = logs.some(
      (l) => l.user_id === userId && new Date(l.created_at).toDateString() === dayStr
    );
    dots.push(hasLog);
  }
  return dots;
}

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function Activity({ companyId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [members, setMembers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [
        { data: membersData, error: mErr },
        { error: hErr },
        { data: assignmentsData, error: aErr },
      ] = await Promise.all([
        supabase.from('profiles').select('id, full_name, avatar_url').eq('company_id', companyId),
        supabase.from('habits').select('id').eq('company_id', companyId).eq('is_active', true),
        supabase.from('habit_assignments').select('habit_id, user_id').eq('company_id', companyId),
      ]);

      if (mErr) throw mErr;
      if (hErr) throw hErr;
      if (aErr) throw aErr;

      const memberIds = (membersData || []).map((m) => m.id);

      let logsData = [];
      let pendingValidationsCount = 0;

      if (memberIds.length > 0) {
        const { data: ld, error: lErr } = await supabase
          .from('habit_logs')
          .select('id, habit_id, user_id, photo_url, status, created_at')
          .in('user_id', memberIds)
          .gte('created_at', thirtyDaysAgo.toISOString());
        if (lErr) throw lErr;
        logsData = ld || [];

        const logIds = logsData.map((l) => l.id);
        if (logIds.length > 0) {
          const { data: vd, error: vErr } = await supabase
            .from('habit_validations')
            .select('id')
            .in('habit_log_id', logIds)
            .eq('status', 'pending');
          if (vErr) throw vErr;
          pendingValidationsCount = (vd || []).length;
        }
      }

      setMembers(membersData || []);
      setAssignments(assignmentsData || []);
      setLogs(logsData);
      setPendingCount(pendingValidationsCount);
    } catch (e) {
      setError(e.message || 'Error cargando actividad');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return <p className="text-sm text-gray-400 py-8 text-center">Cargando actividad...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600 py-8 text-center">{error}</p>;
  }

  const todayStart = getTodayStart();
  const weekStart = getWeekStart();

  const todayLogs = logs.filter((l) => new Date(l.created_at) >= todayStart);
  const completedToday = todayLogs.length;

  const weekLogs = logs.filter((l) => new Date(l.created_at) >= weekStart);
  const daysSoFarThisWeek = Math.min(
    7,
    Math.floor((Date.now() - weekStart.getTime()) / 86400000) + 1
  );
  const totalAssignments = assignments.length;
  const weeklyCompliance =
    totalAssignments > 0 && daysSoFarThisWeek > 0
      ? Math.round(
          (new Set(weekLogs.map((l) => `${l.user_id}_${new Date(l.created_at).toDateString()}`)).size /
            (totalAssignments * daysSoFarThisWeek)) *
            100
        )
      : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-base font-bold text-black">Actividad del grupo</h2>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Completados hoy</p>
          <p className="text-3xl font-black text-black">{completedToday}</p>
          <p className="text-xs text-gray-400 mt-1">hábitos en total</p>
        </div>
        <div className="bg-white border border-gray-200 px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Cumplimiento semanal</p>
          <p className="text-3xl font-black text-black">{weeklyCompliance}%</p>
          <p className="text-xs text-gray-400 mt-1">esta semana</p>
        </div>
        <div className="bg-white border border-gray-200 px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Validaciones pendientes</p>
          <p className="text-3xl font-black text-black">{pendingCount}</p>
          <p className="text-xs text-gray-400 mt-1">por revisar</p>
        </div>
      </div>

      {/* Tarjetas de miembros */}
      {members.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No hay miembros en el grupo</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => {
            const memberAssignments = assignments.filter((a) => a.user_id === member.id);
            const memberLogs = logs.filter((l) => l.user_id === member.id);
            const todayMemberLogs = memberLogs.filter((l) => new Date(l.created_at) >= todayStart);
            const streak = calculateStreak(logs, member.id);
            const dots = getWeekDots(logs, member.id);
            const lastLog = memberLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
            const lastActivity = lastLog ? timeAgo(lastLog.created_at) : null;
            const lastPhoto = memberLogs
              .filter((l) => l.photo_url)
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

            const daysSinceActivity = lastLog
              ? (Date.now() - new Date(lastLog.created_at).getTime()) / 86400000
              : Infinity;
            const inactive = daysSinceActivity > 3;

            const avatarLetter = (member.full_name || '?')[0].toUpperCase();

            return (
              <div
                key={member.id}
                className={`bg-white border p-4 space-y-3 ${inactive ? 'border-orange-400' : 'border-gray-200'}`}
              >
                {/* Header */}
                <div className="flex items-center gap-3">
                  {member.avatar_url ? (
                    <img
                      src={`${member.avatar_url}?t=${Date.now()}`}
                      alt={member.full_name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-[#0A66C2]">{avatarLetter}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-black truncate">{member.full_name}</p>
                      {inactive && (
                        <span className="text-xs font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full shrink-0">
                          Sin actividad
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      🔥 {streak} {streak === 1 ? 'día' : 'días'} de racha
                    </p>
                  </div>
                  {lastPhoto && (
                    <img
                      src={lastPhoto.photo_url}
                      alt="última foto"
                      className="w-12 h-12 object-cover rounded shrink-0"
                    />
                  )}
                </div>

                {/* Hábitos hoy */}
                {memberAssignments.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Sin hábitos asignados</p>
                ) : (
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold text-black">{todayMemberLogs.length}</span>
                    {' de '}
                    <span className="font-semibold text-black">{memberAssignments.length}</span>
                    {' completados hoy'}
                  </p>
                )}

                {/* Dots semana */}
                <div className="flex items-center gap-1.5">
                  {dots.map((active, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <div
                        className={`w-5 h-5 rounded-full ${active ? 'bg-green-500' : 'bg-gray-100'}`}
                      />
                      <span className="text-[10px] text-gray-400">{DAY_LABELS[i]}</span>
                    </div>
                  ))}
                </div>

                {/* Última actividad */}
                {lastActivity && (
                  <p className="text-xs text-gray-400">Última actividad: {lastActivity}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
