import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Acceder() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError('Email o contraseña incorrectos');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        setError('No se pudo verificar tu perfil. Inténtalo de nuevo.');
        return;
      }

      if (profile.role !== 'admin') {
        setError('Solo los administradores pueden acceder desde la web');
        return;
      }

      window.location.href = '/admin';
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="px-8 py-6 max-w-7xl mx-auto w-full">
        <Link to="/" className="text-xl font-bold text-black tracking-tight">
          HabitTeam
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <h1 className="text-4xl font-black text-black tracking-tight mb-10">
            Acceder
          </h1>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full border border-gray-200 px-4 py-3 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-gray-200 px-4 py-3 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
              />
            </div>

            {error ? (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a1a1a] text-white py-4 text-sm font-medium rounded-[2px] hover:bg-black transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-8 text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <Link to="/" className="text-[#0A66C2] hover:underline">
              Empieza gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
