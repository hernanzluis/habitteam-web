import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const RECURRENCE_LABELS = { daily: 'Diario', once: 'Una vez', weekly_x: 'Semanal' };

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function Habits({ companyId, adminId }) {
  const [habits, setHabits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [members, setMembers] = useState([]);
  const [assignedCounts, setAssignedCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recurrence, setRecurrence] = useState('daily');
  const [categoryId, setCategoryId] = useState('');
  const [photoRequired, setPhotoRequired] = useState(true);
  const [dueTime, setDueTime] = useState('');
  const [expiresDate, setExpiresDate] = useState('');
  const [expiresTime, setExpiresTime] = useState('');
  const [assignedIds, setAssignedIds] = useState([]);
  const [validatorIds, setValidatorIds] = useState([]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [
        { data: habitsData, error: hErr },
        { data: catsData, error: cErr },
        { data: membersData, error: mErr },
        { data: assignData, error: aErr },
      ] = await Promise.all([
        supabase.from('habits').select('id, title, description, recurrence, is_active, created_at, category_id, photo_required').eq('company_id', companyId).order('created_at', { ascending: false }),
        supabase.from('categories').select('id, name, icon, color').or(`company_id.is.null,company_id.eq.${companyId}`),
        supabase.from('profiles').select('id, full_name').eq('company_id', companyId).order('full_name'),
        supabase.from('habit_assignments').select('habit_id').in('habit_id',
          (await supabase.from('habits').select('id').eq('company_id', companyId)).data?.map(h => h.id) || []
        ),
      ]);
      if (hErr) throw hErr;
      if (cErr) throw cErr;
      if (mErr) throw mErr;

      const counts = {};
      (assignData || []).forEach(({ habit_id }) => {
        counts[habit_id] = (counts[habit_id] || 0) + 1;
      });

      setHabits(habitsData || []);
      setCategories(catsData || []);
      setMembers(membersData || []);
      setAssignedCounts(counts);
    } catch (e) {
      setError(e.message || 'Error cargando hábitos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [companyId]);

  const handleToggle = async (habit) => {
    setTogglingId(habit.id);
    const newValue = !habit.is_active;
    setHabits((prev) => prev.map((h) => h.id === habit.id ? { ...h, is_active: newValue } : h));
    try {
      const { error } = await supabase.from('habits').update({ is_active: newValue }).eq('id', habit.id);
      if (error) throw error;
    } catch (e) {
      setHabits((prev) => prev.map((h) => h.id === habit.id ? { ...h, is_active: habit.is_active } : h));
      alert(e.message || 'No se pudo actualizar el hábito');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (habit) => {
    if (!window.confirm(`¿Eliminar "${habit.title}"? Se borrarán también todos los logs y validaciones asociados.`)) return;
    setDeletingId(habit.id);
    try {
      const { error } = await supabase.from('habits').delete().eq('id', habit.id);
      if (error) throw error;
      setHabits((prev) => prev.filter((h) => h.id !== habit.id));
    } catch (e) {
      alert(e.message || 'No se pudo eliminar el hábito');
    } finally {
      setDeletingId(null);
    }
  };

  const openModal = () => {
    setTitle('');
    setDescription('');
    setRecurrence('daily');
    setCategoryId('');
    setPhotoRequired(true);
    setDueTime('');
    setExpiresDate('');
    setExpiresTime('');
    setAssignedIds([]);
    setValidatorIds([]);
    setModalError('');
    setModalOpen(true);
  };

  const toggleAssigned = (id) => {
    setAssignedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    // If member was validator, remove from validators
    setValidatorIds((prev) => prev.filter((x) => x !== id));
  };

  const toggleValidator = (id) => {
    // Can't be both assigned and validator
    if (assignedIds.includes(id)) return;
    setValidatorIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setModalError('El título es obligatorio'); return; }
    if (assignedIds.length === 0) { setModalError('Asigna el hábito al menos a un miembro'); return; }

    setSaving(true);
    setModalError('');
    try {
      let expiresAt = null;
      if (recurrence === 'once' && expiresDate) {
        expiresAt = new Date(`${expiresDate}T${expiresTime || '23:59'}`).toISOString();
      }

      const { data: habitData, error: habitError } = await supabase
        .from('habits')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          recurrence,
          company_id: companyId,
          created_by: adminId,
          is_active: true,
          category_id: categoryId || null,
          photo_required: photoRequired,
          due_time: recurrence === 'daily' && dueTime ? dueTime : null,
          expires_at: expiresAt,
        })
        .select('id')
        .single();

      if (habitError) throw habitError;

      const habitId = habitData.id;

      const ops = [];
      if (assignedIds.length > 0) {
        ops.push(
          supabase.from('habit_assignments').insert(
            assignedIds.map((user_id) => ({ habit_id: habitId, user_id }))
          )
        );
      }
      if (validatorIds.length > 0) {
        ops.push(
          supabase.from('habit_validators').insert(
            validatorIds.map((user_id) => ({ habit_id: habitId, user_id }))
          )
        );
      }

      const results = await Promise.all(ops);
      for (const { error } of results) {
        if (error) throw error;
      }

      setModalOpen(false);
      loadData();
    } catch (e) {
      setModalError(e.message || 'No se pudo crear el hábito');
    } finally {
      setSaving(false);
    }
  };

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  if (loading) {
    return <p className="text-sm text-gray-400 py-8 text-center">Cargando hábitos...</p>;
  }

  return (
    <div>
      {error ? <p className="text-sm text-red-600 font-medium mb-4">{error}</p> : null}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-black">Hábitos del grupo</h2>
        <button
          onClick={openModal}
          className="text-sm font-medium bg-[#0A66C2] text-white px-4 py-2 hover:bg-blue-700 transition-colors"
        >
          + Nuevo hábito
        </button>
      </div>

      <div className="bg-white border border-gray-200 overflow-hidden">
        {habits.length === 0 ? (
          <p className="text-sm text-gray-400 px-4 py-6 text-center">No hay hábitos creados todavía</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Título</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Categoría</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Recurrencia</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Asignados</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {habits.map((h) => {
                const cat = h.category_id ? catMap[h.category_id] : null;
                return (
                  <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-black">{h.title}</p>
                      {h.description ? <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{h.description}</p> : null}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {cat ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                          <span className="text-gray-600">{cat.name}</span>
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {RECURRENCE_LABELS[h.recurrence] || h.recurrence}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                      {assignedCounts[h.id] || 0}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(h)}
                        disabled={togglingId === h.id}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-40 ${
                          h.is_active ? 'bg-[#0A66C2]' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                            h.is_active ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(h)}
                        disabled={deletingId === h.id}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-40"
                      >
                        {deletingId === h.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal nuevo hábito */}
      {modalOpen ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white w-full max-w-lg my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-black">Nuevo hábito</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-black text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleCreateHabit} className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">Título <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Salir a correr 30 min"
                  className="w-full border border-gray-200 px-3 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">Descripción <span className="text-gray-400 font-normal">(opcional)</span></label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Instrucciones o contexto adicional"
                  rows={2}
                  className="w-full border border-gray-200 px-3 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors resize-none"
                />
              </div>

              {/* Recurrencia */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Recurrencia</label>
                <div className="flex gap-2">
                  {[{ value: 'daily', label: 'Diario' }, { value: 'once', label: 'Una vez' }].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRecurrence(opt.value)}
                      className={`px-4 py-1.5 text-sm font-medium border transition-colors ${
                        recurrence === opt.value
                          ? 'bg-[#0A66C2] text-white border-[#0A66C2]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-black'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hora límite (daily) */}
              {recurrence === 'daily' ? (
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Hora límite <span className="text-gray-400 font-normal">(opcional)</span></label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="border border-gray-200 px-3 py-2 text-sm text-black focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              ) : null}

              {/* Fecha y hora límite (once) */}
              {recurrence === 'once' ? (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-black mb-1">Fecha límite <span className="text-gray-400 font-normal">(opcional)</span></label>
                    <input
                      type="date"
                      value={expiresDate}
                      onChange={(e) => setExpiresDate(e.target.value)}
                      className="w-full border border-gray-200 px-3 py-2 text-sm text-black focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Hora</label>
                    <input
                      type="time"
                      value={expiresTime}
                      onChange={(e) => setExpiresTime(e.target.value)}
                      className="border border-gray-200 px-3 py-2 text-sm text-black focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>
              ) : null}

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">Categoría <span className="text-gray-400 font-normal">(opcional)</span></label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border border-gray-200 px-3 py-2 text-sm text-black focus:outline-none focus:border-black transition-colors bg-white"
                >
                  <option value="">Sin categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Foto obligatoria */}
              <div className="flex items-center justify-between py-1">
                <label className="text-sm font-medium text-black">Foto obligatoria</label>
                <button
                  type="button"
                  onClick={() => setPhotoRequired((v) => !v)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    photoRequired ? 'bg-[#0A66C2]' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${photoRequired ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Asignar miembros */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Asignar a <span className="text-red-500">*</span>
                  <span className="text-xs font-normal text-gray-400 ml-1">(quiénes deben completar el hábito)</span>
                </label>
                <div className="border border-gray-200 divide-y divide-gray-100 max-h-36 overflow-y-auto">
                  {members.map((m) => (
                    <label key={m.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assignedIds.includes(m.id)}
                        onChange={() => toggleAssigned(m.id)}
                        className="accent-[#0A66C2]"
                      />
                      <span className="text-sm text-black">{m.full_name}</span>
                      {validatorIds.includes(m.id) ? (
                        <span className="text-xs text-gray-400 ml-auto">validador</span>
                      ) : null}
                    </label>
                  ))}
                </div>
              </div>

              {/* Validadores */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Validadores
                  <span className="text-xs font-normal text-gray-400 ml-1">(quiénes validan las fotos — no pueden ser asignados)</span>
                </label>
                <div className="border border-gray-200 divide-y divide-gray-100 max-h-36 overflow-y-auto">
                  {members.map((m) => {
                    const isAssigned = assignedIds.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className={`flex items-center gap-3 px-3 py-2 ${isAssigned ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}`}
                      >
                        <input
                          type="checkbox"
                          checked={validatorIds.includes(m.id)}
                          onChange={() => toggleValidator(m.id)}
                          disabled={isAssigned}
                          className="accent-[#0A66C2]"
                        />
                        <span className="text-sm text-black">{m.full_name}</span>
                        {isAssigned ? <span className="text-xs text-gray-400 ml-auto">asignado</span> : null}
                      </label>
                    );
                  })}
                </div>
              </div>

              {modalError ? <p className="text-sm text-red-600">{modalError}</p> : null}

              <div className="flex gap-3 pt-2 pb-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 border border-gray-200 text-sm font-medium py-2.5 hover:border-black transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#0A66C2] text-white text-sm font-medium py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Creando...' : 'Crear hábito'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
