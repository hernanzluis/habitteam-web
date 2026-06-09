import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export default function Members({ companyId, adminId }) {
  const [members, setMembers] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [copied, setCopied] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [{ data: membersData, error: mErr }, { data: pendingData, error: pErr }] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email, role, created_at').eq('company_id', companyId).order('created_at'),
        supabase.from('activation_codes').select('id, full_name, email, code, created_at, expires_at').eq('company_id', companyId).eq('used', false).order('created_at', { ascending: false }),
      ]);
      if (mErr) throw mErr;
      if (pErr) throw pErr;
      setMembers(membersData || []);
      setPending(pendingData || []);
    } catch (e) {
      setError(e.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { loadData(); }, [loadData]);

  const openModal = () => {
    setNewName('');
    setNewEmail('');
    setModalError('');
    setGeneratedCode(null);
    setCopied(false);
    setModalOpen(true);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) { setModalError('Nombre y email son obligatorios'); return; }
    setSaving(true);
    setModalError('');
    try {
      const code = generateCode();
      const { error: insertError } = await supabase.from('activation_codes').insert({
        code,
        company_id: companyId,
        email: newEmail.trim().toLowerCase(),
        full_name: newName.trim(),
      });
      if (insertError) throw insertError;
      setGeneratedCode(code);
      loadData();
    } catch (e) {
      setModalError(e.message || 'No se pudo generar el código');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteMember = async (member) => {
    if (!window.confirm(`¿Eliminar a ${member.full_name}? Esta acción no se puede deshacer.`)) return;
    setDeletingId(member.id);
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', member.id);
      if (error) throw error;
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
    } catch (e) {
      alert(e.message || 'No se pudo eliminar el miembro');
    } finally {
      setDeletingId(null);
    }
  };

  const handleChangeRole = async (member, newRole) => {
    if (newRole === member.role) return;
    if (member.role === 'admin' && newRole !== 'admin') {
      const adminCount = members.filter((m) => m.role === 'admin').length;
      if (adminCount <= 1) {
        alert('Debe haber al menos un administrador en el grupo.');
        return;
      }
    }
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', member.id);
      if (error) throw error;
      setMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, role: newRole } : m));
    } catch (e) {
      alert(e.message || 'No se pudo cambiar el rol.');
    }
  };

  const handleCancelInvite = async (invite) => {
    if (!window.confirm(`¿Cancelar la invitación de ${invite.full_name}?`)) return;
    setCancellingId(invite.id);
    try {
      const { error } = await supabase.from('activation_codes').delete().eq('id', invite.id);
      if (error) throw error;
      setPending((prev) => prev.filter((p) => p.id !== invite.id));
    } catch (e) {
      alert(e.message || 'No se pudo cancelar la invitación');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-400 py-8 text-center">Cargando miembros...</p>;
  }

  return (
    <div className="space-y-8">
      {error ? <p className="text-sm text-red-600 font-medium">{error}</p> : null}

      {/* Miembros activos */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-black">Miembros activos</h2>
          <button
            onClick={openModal}
            className="text-sm font-medium bg-[#0A66C2] text-white px-4 py-2 hover:bg-blue-700 transition-colors"
          >
            + Añadir miembro
          </button>
        </div>
        <div className="bg-white border border-gray-200 overflow-hidden">
          {members.length === 0 ? (
            <p className="text-sm text-gray-400 px-4 py-6 text-center">No hay miembros todavía</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Rol</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Registro</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-black">{m.full_name}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{m.email}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {m.id === adminId ? (
                        <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                          m.role === 'admin' ? 'bg-blue-50 text-[#0A66C2]' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {m.role === 'admin' ? 'Admin' : 'Miembro'}
                        </span>
                      ) : (
                        <select
                          value={m.role}
                          onChange={(e) => handleChangeRole(m, e.target.value)}
                          className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-700 bg-white focus:outline-none focus:border-black transition-colors"
                        >
                          <option value="user">Miembro</option>
                          <option value="admin">Administrador</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">{formatDate(m.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      {m.id !== adminId ? (
                        <button
                          onClick={() => handleDeleteMember(m)}
                          disabled={deletingId === m.id}
                          className="text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-40"
                        >
                          {deletingId === m.id ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">Tú</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Invitaciones pendientes */}
      <section>
        <h2 className="text-base font-bold text-black mb-4">Invitaciones pendientes</h2>
        <div className="bg-white border border-gray-200 overflow-hidden">
          {pending.length === 0 ? (
            <p className="text-sm text-gray-400 px-4 py-6 text-center">No hay invitaciones pendientes</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Código</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Creado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Expira</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pending.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-black">{p.full_name}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{p.email}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-black tracking-widest">{p.code}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">{formatDate(p.expires_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleCancelInvite(p)}
                        disabled={cancellingId === p.id}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-40"
                      >
                        {cancellingId === p.id ? 'Cancelando...' : 'Cancelar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Modal añadir miembro */}
      {modalOpen ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-black">Añadir miembro</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-black text-xl leading-none">×</button>
            </div>

            {generatedCode ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Código de activación para <strong>{newName}</strong>. Compártelo con el miembro para que active su cuenta en la app.
                </p>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-3">
                  <span className="font-mono text-3xl font-black text-black tracking-[0.3em] flex-1 text-center">
                    {generatedCode}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-sm font-medium text-[#0A66C2] hover:underline shrink-0"
                  >
                    {copied ? '¡Copiado!' : 'Copiar'}
                  </button>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-full bg-black text-white py-3 text-sm font-medium hover:bg-gray-900 transition-colors"
                >
                  Listo
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Nombre completo</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ana García"
                    className="w-full border border-gray-200 px-3 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="ana@email.com"
                    className="w-full border border-gray-200 px-3 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                {modalError ? <p className="text-sm text-red-600">{modalError}</p> : null}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 border border-gray-200 text-sm font-medium py-2 hover:border-black transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-[#0A66C2] text-white text-sm font-medium py-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Generando...' : 'Generar código'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
