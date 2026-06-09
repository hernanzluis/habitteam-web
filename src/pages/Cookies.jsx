import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav';

const CONTENT = {
  es: {
    title: 'Política de Cookies',
    breadcrumb: 'Política de Cookies',
    sections: [
      {
        heading: '1. ¿Qué son las cookies?',
        body: 'Pequeños archivos que se almacenan en tu dispositivo para mejorar tu experiencia.',
      },
      {
        heading: '2. Cookies que usamos',
        body: 'Cookies de sesión de Supabase Auth: necesarias para mantener tu sesión iniciada (estrictamente necesarias, no requieren consentimiento).\nCookie de preferencia de idioma (habitteam_lang): guarda tu idioma preferido (funcional).\nNo usamos cookies de publicidad ni de seguimiento de terceros.',
      },
      {
        heading: '3. Gestión de cookies',
        body: 'Puedes eliminar las cookies desde la configuración de tu navegador. Ten en cuenta que esto cerrará tu sesión en HabitTeam.',
      },
      {
        heading: '4. Cambios en esta política',
        body: 'Notificaremos cambios significativos en esta política.',
      },
    ],
  },
  en: {
    title: 'Cookies Policy',
    breadcrumb: 'Cookies Policy',
    sections: [
      {
        heading: '1. What are cookies?',
        body: 'Small files stored on your device to improve your experience.',
      },
      {
        heading: '2. Cookies we use',
        body: 'Supabase Auth session cookies: necessary to keep you logged in (strictly necessary, no consent required).\nLanguage preference cookie (habitteam_lang): stores your preferred language (functional).\nWe do not use advertising or third-party tracking cookies.',
      },
      {
        heading: '3. Managing cookies',
        body: 'You can delete cookies from your browser settings. Note that doing so will log you out of HabitTeam.',
      },
      {
        heading: '4. Changes to this policy',
        body: 'We will notify you of significant changes to this policy.',
      },
    ],
  },
};

export default function Cookies() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('es') ? 'es' : 'en';
  const c = CONTENT[lang];

  return (
    <div className="bg-white min-h-screen">
      <Nav />
      <div className="max-w-3xl mx-auto px-6 pt-48 pb-24">
        {/* Breadcrumb */}
        <p className="text-xs text-gray-400 mb-6">
          <Link to="/" className="hover:text-black transition-colors">HabitTeam</Link>
          <span className="mx-2">›</span>
          <span>{c.breadcrumb}</span>
        </p>

        {/* Aviso */}
        <div className="bg-amber-50 border border-amber-200 rounded px-4 py-3 mb-8 text-xs text-amber-700 leading-relaxed">
          {lang === 'es'
            ? 'Este documento ha sido redactado con carácter informativo. Consulte con un profesional legal antes del lanzamiento comercial.'
            : 'This document has been drafted for informational purposes. Please consult a legal professional before commercial launch.'}
        </div>

        <h1 className="text-3xl font-black text-black mb-2">{c.title}</h1>
        <p className="text-sm text-gray-400 mb-12">
          {lang === 'es' ? 'Última actualización: junio 2026' : 'Last updated: June 2026'}
        </p>

        <div className="space-y-8">
          {c.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-base font-bold text-black mb-2">{s.heading}</h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-1">
                {s.body.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <footer className="border-t border-gray-100 px-6 py-8 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} HabitTeam ·{' '}
        <Link to="/privacidad" className="hover:text-black transition-colors">
          {lang === 'es' ? 'Privacidad' : 'Privacy'}
        </Link>{' '}·{' '}
        <Link to="/terminos" className="hover:text-black transition-colors">
          {lang === 'es' ? 'Términos' : 'Terms'}
        </Link>{' '}·{' '}
        <Link to="/cookies" className="hover:text-black transition-colors">
          Cookies
        </Link>
      </footer>
    </div>
  );
}
