import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Members from '../components/admin/Members';
import Habits from '../components/admin/Habits';
import Categories from '../components/admin/Categories';

export default function Admin() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [profile, setProfile] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [activeSection, setActiveSection] = useState('members');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { navigate('/acceder'); return; }

      const { data: prof } = await supabase
        .from('profiles')
        .select('id, full_name, role, company_id')
        .eq('id', authUser.id)
        .single();

      if (!prof || prof.role !== 'admin') { navigate('/acceder'); return; }

      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('id', prof.company_id)
        .single();

      setProfile(prof);
      setCompanyName(company?.name || '');
      setChecking(false);
    };

    checkAuth();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/acceder');
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Verificando acceso...</p>
      </div>
    );
  }

  const navItems = [
    { key: 'members',    label: 'Miembros'    },
    { key: 'habits',     label: 'Hábitos'     },
    { key: 'categories', label: 'Categorías'  },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-black text-black tracking-tight">HabitTeam</span>
          <span className="text-gray-300">·</span>
          <span className="text-sm text-gray-500 font-medium">{companyName}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-sm text-gray-500">{profile?.full_name}</span>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-black transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop */}
        <aside className="hidden md:flex flex-col w-52 bg-white border-r border-gray-200 py-6 px-3 shrink-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-3">
            Panel
          </p>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${
                  activeSection === item.key
                    ? 'bg-blue-50 text-[#0A66C2]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">
          {/* Tabs — mobile */}
          <div className="md:hidden flex border-b border-gray-200 bg-white">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeSection === item.key
                    ? 'text-[#0A66C2] border-b-2 border-[#0A66C2]'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeSection === 'members' && (
              <Members companyId={profile.company_id} adminId={profile.id} />
            )}
            {activeSection === 'habits' && (
              <Habits companyId={profile.company_id} adminId={profile.id} />
            )}
            {activeSection === 'categories' && (
              <Categories companyId={profile.company_id} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
