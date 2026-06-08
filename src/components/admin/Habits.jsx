import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

function recurrenceLabel(habit) {
  if (habit.recurrence === 'weekly_x') return `${habit.weekly_target || 1} veces/sem`;
  if (habit.recurrence === 'daily') return 'Diario';
  if (habit.recurrence === 'once') return 'Una vez';
  return habit.recurrence;
}

function toDateInput(isoStr) {
  if (!isoStr) return '';
  return isoStr.slice(0, 10);
}

function toTimeInput(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const RECURRENCE_OPTIONS = [
  { value: 'daily',    label: 'Diario' },
  { value: 'weekly_x', label: 'X veces/semana' },
  { value: 'once',     label: 'Una vez' },
];

function ToggleSwitch({ value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${value ? 'bg-[#0A66C2]' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${value ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

function WeeklyTargetStepper({ value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-8 h-8 border border-gray-200 text-black font-bold hover:border-black transition-colors flex items-center justify-center"
      >−</button>
      <span className="w-6 text-center text-base font-bold text-black">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(7, value + 1))}
        className="w-8 h-8 border border-gray-200 text-black font-bold hover:border-black transition-colors flex items-center justify-center"
      >+</button>
      <span className="text-sm text-gray-500">veces por semana</span>
    </div>
  );
}

// Shared form fields used by both create and edit modals
function HabitForm({ title, setTitle, description, setDescription, recurrence, setRecurrence,
  weeklyTarget, setWeeklyTarget, dueTime, setDueTime, expiresDate, setExpiresDate,
  expiresTime, setExpiresTime, categoryId, setCategoryId, photoRequired, setPhotoRequired,
  assignedIds, toggleAssigned, validatorIds, toggleValidator, members, categories,
  onSubmit, onCancel, saving, modalError, submitLabel }) {
  return (
    <form onSubmit={onSubmit} className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
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
        <div className="flex flex-wrap gap-2">
          {RECURRENCE_OPTIONS.map((opt) => (
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

      {/* X veces/semana — stepper */}
      {recurrence === 'weekly_x' ? (
        <div>
          <label className="block text-sm font-medium text-black mb-2">Objetivo semanal</label>
          <WeeklyTargetStepper value={weeklyTarget} onChange={setWeeklyTarget} />
        </div>
      ) : null}

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
        <ToggleSwitch value={photoRequired} onChange={setPhotoRequired} />
      </div>

      {/* Asignar miembros */}
      {assignedIds !== null ? (
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
      ) : null}

      {/* Validadores */}
      {validatorIds !== null ? (
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
      ) : null}

      {modalError ? <p className="text-sm text-red-600">{modalError}</p> : null}

      <div className="flex gap-3 pt-2 pb-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-200 text-sm font-medium py-2.5 hover:border-black transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-[#0A66C2] text-white text-sm font-medium py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

function AvatarStack({ userIds, membersById }) {
  const visible = userIds.slice(0, 4);
  const overflow = userIds.length - visible.length;
  return (
    <div className="flex items-center">
      {visible.map((uid, idx) => {
        const m = membersById[uid];
        const initial = m?.full_name?.charAt(0).toUpperCase() || '?';
        return (
          <div
            key={uid}
            title={m?.full_name || uid}
            style={{ marginLeft: idx > 0 ? '-6px' : '0', zIndex: 4 - idx }}
            className="relative w-7 h-7 rounded-full border-2 border-white overflow-hidden shrink-0"
          >
            {m?.avatar_url ? (
              <img src={m.avatar_url} alt={m.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#0A66C2] flex items-center justify-center">
                <span className="text-white text-xs font-bold leading-none">{initial}</span>
              </div>
            )}
          </div>
        );
      })}
      {overflow > 0 ? (
        <div
          style={{ marginLeft: '-6px', zIndex: 0 }}
          className="relative w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center shrink-0"
        >
          <span className="text-gray-600 text-xs font-bold leading-none">+{overflow}</span>
        </div>
      ) : null}
    </div>
  );
}

export default function Habits({ companyId, adminId }) {
  const [habits, setHabits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [members, setMembers] = useState([]);
  const [habitAssignmentsMap, setHabitAssignmentsMap] = useState({});
  const [habitValidatorsMap, setHabitValidatorsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Create modal
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  // Edit modal
  const [editingHabit, setEditingHabit] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [editLoadingAssignments, setEditLoadingAssignments] = useState(false);

  // Shared form state (used by both create and edit)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recurrence, setRecurrence] = useState('daily');
  const [weeklyTarget, setWeeklyTarget] = useState(3);
  const [categoryId, setCategoryId] = useState('');
  const [photoRequired, setPhotoRequired] = useState(true);
  const [dueTime, setDueTime] = useState('');
  const [expiresDate, setExpiresDate] = useState('');
  const [expiresTime, setExpiresTime] = useState('');
  const [assignedIds, setAssignedIds] = useState([]);
  const [validatorIds, setValidatorIds] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [
        { data: habitsData, error: hErr },
        { data: catsData, error: cErr },
        { data: membersData, error: mErr },
        { data: assignData },
        { data: validatorsData },
      ] = await Promise.all([
        supabase.from('habits')
          .select('id, title, description, recurrence, weekly_target, is_active, created_at, category_id, photo_required, due_time, expires_at')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('id, name, icon, color').or(`company_id.is.null,company_id.eq.${companyId}`),
        supabase.from('profiles').select('id, full_name, avatar_url').eq('company_id', companyId).order('full_name'),
        supabase.from('habit_assignments').select('habit_id, user_id').in('habit_id',
          (await supabase.from('habits').select('id').eq('company_id', companyId)).data?.map(h => h.id) || []
        ),
        supabase.from('habit_validators').select('habit_id, user_id').in('habit_id',
          (await supabase.from('habits').select('id').eq('company_id', companyId)).data?.map(h => h.id) || []
        ),
      ]);
      if (hErr) throw hErr;
      if (cErr) throw cErr;
      if (mErr) throw mErr;

      const assignMap = {};
      (assignData || []).forEach(({ habit_id, user_id }) => {
        if (!assignMap[habit_id]) assignMap[habit_id] = [];
        assignMap[habit_id].push(user_id);
      });

      const validatorsMap = {};
      (validatorsData || []).forEach(({ habit_id, user_id }) => {
        if (!validatorsMap[habit_id]) validatorsMap[habit_id] = [];
        validatorsMap[habit_id].push(user_id);
      });

      setHabits(habitsData || []);
      setCategories(catsData || []);
      setMembers(membersData || []);
      setHabitAssignmentsMap(assignMap);
      setHabitValidatorsMap(validatorsMap);
    } catch (e) {
      setError(e.message || 'Error cargando hábitos');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { loadData(); }, [loadData]);

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

  // ── Create modal ──────────────────────────────────────────────────
  const openCreateModal = () => {
    setTitle(''); setDescription(''); setRecurrence('daily'); setWeeklyTarget(3);
    setCategoryId(''); setPhotoRequired(true); setDueTime('');
    setExpiresDate(''); setExpiresTime('');
    setAssignedIds([]); setValidatorIds([]);
    setModalError('');
    setModalOpen(true);
  };

  const toggleAssigned = (id) => {
    setAssignedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    setValidatorIds((prev) => prev.filter((x) => x !== id));
  };

  const toggleValidator = (id) => {
    if (assignedIds.includes(id)) return;
    setValidatorIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setModalError('El título es obligatorio'); return; }
    if (assignedIds.length === 0) { setModalError('Asigna el hábito al menos a un miembro'); return; }
    setSaving(true); setModalError('');
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
          weekly_target: recurrence === 'weekly_x' ? weeklyTarget : null,
          company_id: companyId,
          created_by: adminId,
          is_active: true,
          category_id: categoryId || null,
          photo_required: photoRequired,
          due_time: recurrence === 'daily' && dueTime ? dueTime : null,
          expires_at: expiresAt,
        })
        .select('id').single();
      if (habitError) throw habitError;

      const habitId = habitData.id;
      const ops = [];
      if (assignedIds.length > 0) {
        ops.push(supabase.from('habit_assignments').insert(assignedIds.map((user_id) => ({ habit_id: habitId, user_id }))));
      }
      if (validatorIds.length > 0) {
        ops.push(supabase.from('habit_validators').insert(validatorIds.map((user_id) => ({ habit_id: habitId, user_id }))));
      }
      const results = await Promise.all(ops);
      for (const { error } of results) { if (error) throw error; }
      setModalOpen(false);
      loadData();
    } catch (e) {
      setModalError(e.message || 'No se pudo crear el hábito');
    } finally {
      setSaving(false);
    }
  };

  // ── Edit modal ────────────────────────────────────────────────────
  const toggleEditAssigned = (id) => {
    setAssignedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleEditValidator = (id) => {
    setValidatorIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const openEditModal = async (habit) => {
    setTitle(habit.title || '');
    setDescription(habit.description || '');
    setRecurrence(habit.recurrence || 'daily');
    setWeeklyTarget(habit.weekly_target || 3);
    setCategoryId(habit.category_id || '');
    setPhotoRequired(habit.photo_required !== false);
    setDueTime(habit.due_time ? habit.due_time.slice(0, 5) : '');
    setExpiresDate(toDateInput(habit.expires_at));
    setExpiresTime(toTimeInput(habit.expires_at));
    setAssignedIds([]);
    setValidatorIds([]);
    setEditError('');
    setEditLoadingAssignments(true);
    setEditingHabit(habit);

    try {
      const [{ data: aData }, { data: vData }] = await Promise.all([
        supabase.from('habit_assignments').select('user_id').eq('habit_id', habit.id),
        supabase.from('habit_validators').select('user_id').eq('habit_id', habit.id),
      ]);
      setAssignedIds((aData || []).map((r) => r.user_id));
      setValidatorIds((vData || []).map((r) => r.user_id));
    } catch {
      // Non-critical: checkboxes start unchecked if fetch fails
    } finally {
      setEditLoadingAssignments(false);
    }
  };

  const handleEditHabit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setEditError('El título es obligatorio'); return; }
    if (assignedIds.length === 0) { setEditError('Asigna el hábito al menos a un miembro'); return; }
    setEditSaving(true); setEditError('');
    try {
      let expiresAt = null;
      if (recurrence === 'once' && expiresDate) {
        expiresAt = new Date(`${expiresDate}T${expiresTime || '23:59'}`).toISOString();
      }

      const [updateResult, delAssign, delValidators] = await Promise.all([
        supabase.from('habits').update({
          title: title.trim(),
          description: description.trim() || null,
          recurrence,
          weekly_target: recurrence === 'weekly_x' ? weeklyTarget : null,
          category_id: categoryId || null,
          photo_required: photoRequired,
          due_time: recurrence === 'daily' && dueTime ? dueTime : null,
          expires_at: expiresAt,
        }).eq('id', editingHabit.id),
        supabase.from('habit_assignments').delete().eq('habit_id', editingHabit.id),
        supabase.from('habit_validators').delete().eq('habit_id', editingHabit.id),
      ]);
      if (updateResult.error) throw updateResult.error;
      if (delAssign.error) throw delAssign.error;
      if (delValidators.error) throw delValidators.error;

      const insertOps = [];
      if (assignedIds.length > 0) {
        insertOps.push(supabase.from('habit_assignments').insert(assignedIds.map((user_id) => ({ habit_id: editingHabit.id, user_id }))));
      }
      if (validatorIds.length > 0) {
        insertOps.push(supabase.from('habit_validators').insert(validatorIds.map((user_id) => ({ habit_id: editingHabit.id, user_id }))));
      }
      const results = await Promise.all(insertOps);
      for (const { error } of results) { if (error) throw error; }

      setEditingHabit(null);
      loadData();
    } catch (e) {
      setEditError(e.message || 'No se pudo actualizar el hábito');
    } finally {
      setEditSaving(false);
    }
  };

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const membersById = Object.fromEntries(members.map((m) => [m.id, m]));

  if (loading) {
    return <p className="text-sm text-gray-400 py-8 text-center">Cargando hábitos...</p>;
  }

  return (
    <div>
      {error ? <p className="text-sm text-red-600 font-medium mb-4">{error}</p> : null}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-black">Hábitos del grupo</h2>
        <button
          onClick={openCreateModal}
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Validadores</th>
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
                      <button
                        type="button"
                        onClick={() => openEditModal(h)}
                        className="font-medium text-black hover:text-[#0A66C2] transition-colors text-left cursor-pointer"
                      >
                        {h.title}
                      </button>
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
                      {recurrenceLabel(h)}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {(habitAssignmentsMap[h.id] || []).length > 0 ? (
                        <AvatarStack userIds={habitAssignmentsMap[h.id]} membersById={membersById} />
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {(habitValidatorsMap[h.id] || []).length > 0 ? (
                        <AvatarStack userIds={habitValidatorsMap[h.id]} membersById={membersById} />
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(h)}
                        disabled={togglingId === h.id}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-40 ${h.is_active ? 'bg-[#0A66C2]' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${h.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
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

      {/* Modal crear hábito */}
      {modalOpen ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white w-full max-w-lg my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-black">Nuevo hábito</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-black text-xl leading-none">×</button>
            </div>
            <HabitForm
              title={title} setTitle={setTitle}
              description={description} setDescription={setDescription}
              recurrence={recurrence} setRecurrence={setRecurrence}
              weeklyTarget={weeklyTarget} setWeeklyTarget={setWeeklyTarget}
              dueTime={dueTime} setDueTime={setDueTime}
              expiresDate={expiresDate} setExpiresDate={setExpiresDate}
              expiresTime={expiresTime} setExpiresTime={setExpiresTime}
              categoryId={categoryId} setCategoryId={setCategoryId}
              photoRequired={photoRequired} setPhotoRequired={setPhotoRequired}
              assignedIds={assignedIds} toggleAssigned={toggleAssigned}
              validatorIds={validatorIds} toggleValidator={toggleValidator}
              members={members} categories={categories}
              onSubmit={handleCreateHabit} onCancel={() => setModalOpen(false)}
              saving={saving} modalError={modalError} submitLabel="Crear hábito"
            />
          </div>
        </div>
      ) : null}

      {/* Modal editar hábito */}
      {editingHabit ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white w-full max-w-lg my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-black">Editar hábito</h3>
              <button onClick={() => setEditingHabit(null)} className="text-gray-400 hover:text-black text-xl leading-none">×</button>
            </div>
            {editLoadingAssignments ? (
              <p className="text-sm text-gray-400 px-6 py-8 text-center">Cargando asignaciones...</p>
            ) : (
              <HabitForm
                title={title} setTitle={setTitle}
                description={description} setDescription={setDescription}
                recurrence={recurrence} setRecurrence={setRecurrence}
                weeklyTarget={weeklyTarget} setWeeklyTarget={setWeeklyTarget}
                dueTime={dueTime} setDueTime={setDueTime}
                expiresDate={expiresDate} setExpiresDate={setExpiresDate}
                expiresTime={expiresTime} setExpiresTime={setExpiresTime}
                categoryId={categoryId} setCategoryId={setCategoryId}
                photoRequired={photoRequired} setPhotoRequired={setPhotoRequired}
                assignedIds={assignedIds} toggleAssigned={toggleEditAssigned}
                validatorIds={validatorIds} toggleValidator={toggleEditValidator}
                members={members} categories={categories}
                onSubmit={handleEditHabit} onCancel={() => setEditingHabit(null)}
                saving={editSaving} modalError={editError} submitLabel="Guardar cambios"
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
