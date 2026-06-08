import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const PRESET_COLORS = [
  '#4CAF50', '#F44336', '#FF9800', '#2196F3',
  '#9C27B0', '#00BCD4', '#009688', '#9E9E9E',
];

const ICON_OPTIONS = [
  { value: 'fitness-outline',       label: 'Ejercicio'     },
  { value: 'medical-outline',       label: 'Salud'         },
  { value: 'restaurant-outline',    label: 'Alimentación'  },
  { value: 'book-outline',          label: 'Lectura'       },
  { value: 'moon-outline',          label: 'Descanso'      },
  { value: 'calendar-outline',      label: 'Planificación' },
  { value: 'water-outline',         label: 'Hidratación'   },
  { value: 'home-outline',          label: 'Hogar'         },
  { value: 'heart-outline',         label: 'Bienestar'     },
  { value: 'star-outline',          label: 'Meta'          },
  { value: 'bicycle-outline',       label: 'Ciclismo'      },
  { value: 'walk-outline',          label: 'Caminar'       },
  { value: 'barbell-outline',       label: 'Pesas'         },
  { value: 'school-outline',        label: 'Educación'     },
  { value: 'ellipsis-horizontal-outline', label: 'Otro'   },
];

export default function Categories({ companyId }) {
  const [preset, setPreset] = useState([]);
  const [custom, setCustom] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('ellipsis-horizontal-outline');
  const [color, setColor] = useState('#4CAF50');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [{ data: presetData, error: pErr }, { data: customData, error: cErr }] = await Promise.all([
        supabase.from('categories').select('id, name, icon, color').is('company_id', null).order('name'),
        supabase.from('categories').select('id, name, icon, color').eq('company_id', companyId).order('name'),
      ]);
      if (pErr) throw pErr;
      if (cErr) throw cErr;
      setPreset(presetData || []);
      setCustom(customData || []);
    } catch (e) {
      setError(e.message || 'Error cargando categorías');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { loadData(); }, [loadData]);

  const openModal = () => {
    setName('');
    setIcon('ellipsis-horizontal-outline');
    setColor('#4CAF50');
    setModalError('');
    setModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setModalError('El nombre es obligatorio'); return; }
    setSaving(true);
    setModalError('');
    try {
      const { error } = await supabase.from('categories').insert({
        name: name.trim(),
        icon,
        color,
        company_id: companyId,
      });
      if (error) throw error;
      setModalOpen(false);
      loadData();
    } catch (e) {
      setModalError(e.message || 'No se pudo crear la categoría');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`¿Eliminar la categoría "${cat.name}"?`)) return;
    setDeletingId(cat.id);
    try {
      const { error } = await supabase.from('categories').delete().eq('id', cat.id);
      if (error) throw error;
      setCustom((prev) => prev.filter((c) => c.id !== cat.id));
    } catch (e) {
      alert(e.message || 'No se pudo eliminar la categoría');
    } finally {
      setDeletingId(null);
    }
  };

  const selectedIconLabel = ICON_OPTIONS.find((o) => o.value === icon)?.label || icon;

  if (loading) {
    return <p className="text-sm text-gray-400 py-8 text-center">Cargando categorías...</p>;
  }

  return (
    <div className="space-y-8">
      {error ? <p className="text-sm text-red-600 font-medium">{error}</p> : null}

      {/* Categorías personalizadas */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-black">Categorías personalizadas</h2>
          <button
            onClick={openModal}
            className="text-sm font-medium bg-[#0A66C2] text-white px-4 py-2 hover:bg-blue-700 transition-colors"
          >
            + Nueva categoría
          </button>
        </div>
        <div className="bg-white border border-gray-200 overflow-hidden">
          {custom.length === 0 ? (
            <p className="text-sm text-gray-400 px-4 py-6 text-center">No hay categorías personalizadas todavía</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Color</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Icono</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {custom.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className="inline-block w-5 h-5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-black">{cat.name}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell text-xs">
                      {ICON_OPTIONS.find((o) => o.value === cat.icon)?.label || cat.icon}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(cat)}
                        disabled={deletingId === cat.id}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-40"
                      >
                        {deletingId === cat.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Categorías predefinidas */}
      <section>
        <h2 className="text-base font-bold text-black mb-4">Categorías predefinidas del sistema</h2>
        <div className="bg-white border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Color</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Icono</th>
                <th className="px-4 py-3 text-right">
                  <span className="text-xs text-gray-400 font-normal normal-case tracking-normal">Solo lectura</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {preset.map((cat) => (
                <tr key={cat.id} className="opacity-70">
                  <td className="px-4 py-3">
                    <span
                      className="inline-block w-5 h-5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-black">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell text-xs">
                    {ICON_OPTIONS.find((o) => o.value === cat.icon)?.label || cat.icon}
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal nueva categoría */}
      {modalOpen ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-black">Nueva categoría</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-black text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleCreate} className="px-6 py-4 space-y-5">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">Nombre <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Meditación"
                  className="w-full border border-gray-200 px-3 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-black scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Icono */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Icono</label>
                <div className="grid grid-cols-3 gap-1.5 max-h-44 overflow-y-auto border border-gray-200 p-2">
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setIcon(opt.value)}
                      className={`px-2 py-1.5 text-xs font-medium border transition-colors text-left ${
                        icon === opt.value
                          ? 'bg-[#0A66C2] text-white border-[#0A66C2]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-black'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-3">
                <span
                  className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: color }}
                >
                  {name.charAt(0).toUpperCase() || '?'}
                </span>
                <div>
                  <p className="text-sm font-medium text-black">{name || 'Nombre de la categoría'}</p>
                  <p className="text-xs text-gray-400">{selectedIconLabel}</p>
                </div>
              </div>

              {modalError ? <p className="text-sm text-red-600">{modalError}</p> : null}

              <div className="flex gap-3 pb-2">
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
                  {saving ? 'Guardando...' : 'Crear categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
