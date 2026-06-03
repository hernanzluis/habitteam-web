import { Link } from 'react-router-dom';

export default function Acceder() {
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

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="tu@empresa.com"
                className="w-full border border-gray-200 px-4 py-3 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-200 px-4 py-3 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#1a1a1a] text-white py-4 text-sm font-medium rounded-[2px] hover:bg-black transition-colors mt-2"
            >
              Entrar
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
