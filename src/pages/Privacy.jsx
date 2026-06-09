import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav';

const CONTENT = {
  es: {
    title: 'Política de Privacidad',
    breadcrumb: 'Política de Privacidad',
    sections: [
      {
        heading: '1. Responsable del tratamiento',
        body: 'Nombre: Luis Hernanz\nEmail de contacto: hernanz.luis@gmail.com\nSitio web: habitteam.app',
      },
      {
        heading: '2. Datos que recopilamos',
        body: 'Nombre completo y dirección de email al registrarse.\nFotografías subidas como prueba de hábitos completados.\nDatos de uso del servicio (hábitos creados, completados, validaciones).',
      },
      {
        heading: '3. Finalidad del tratamiento',
        body: 'Prestación del servicio HabitTeam.\nComunicaciones relacionadas con el servicio.\nNo vendemos ni compartimos datos con terceros con fines comerciales.',
      },
      {
        heading: '4. Dónde se almacenan los datos',
        body: 'Los datos se almacenan en Supabase (Supabase Inc., EEUU).\nSupabase cumple con el marco de transferencia de datos UE-EEUU.\nLas fotografías se almacenan en servidores de Supabase Storage.',
      },
      {
        heading: '5. Conservación de datos',
        body: 'Los datos se conservan mientras la cuenta esté activa.\nAl eliminar la cuenta, los datos se borran en un plazo máximo de 30 días.',
      },
      {
        heading: '6. Derechos del usuario (RGPD y CCPA)',
        body: 'Acceso a sus datos.\nRectificación de datos incorrectos.\nSupresión ("derecho al olvido").\nPortabilidad de datos.\nOposición al tratamiento.\nPara ejercer estos derechos: hernanz.luis@gmail.com',
      },
      {
        heading: '7. Edad mínima',
        body: 'Europa: 16 años.\nEEUU: 13 años (cumplimiento COPPA).\nNo recopilamos conscientemente datos de menores.',
      },
      {
        heading: '8. Cookies',
        body: 'Ver nuestra Política de Cookies.',
      },
      {
        heading: '9. Cambios en esta política',
        body: 'Notificaremos cambios significativos por email.',
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    breadcrumb: 'Privacy Policy',
    sections: [
      {
        heading: '1. Data Controller',
        body: 'Name: Luis Hernanz\nContact email: hernanz.luis@gmail.com\nWebsite: habitteam.app',
      },
      {
        heading: '2. Data We Collect',
        body: 'Full name and email address upon registration.\nPhotographs uploaded as proof of completed habits.\nService usage data (habits created, completed, validations).',
      },
      {
        heading: '3. Purpose of Processing',
        body: 'Provision of the HabitTeam service.\nService-related communications.\nWe do not sell or share data with third parties for commercial purposes.',
      },
      {
        heading: '4. Where Data Is Stored',
        body: 'Data is stored on Supabase (Supabase Inc., USA).\nSupabase complies with the EU-US data transfer framework.\nPhotographs are stored on Supabase Storage servers.',
      },
      {
        heading: '5. Data Retention',
        body: 'Data is retained while the account is active.\nUpon account deletion, data is erased within a maximum of 30 days.',
      },
      {
        heading: '6. User Rights (GDPR and CCPA)',
        body: 'Access to your data.\nRectification of incorrect data.\nErasure ("right to be forgotten").\nData portability.\nRight to object to processing.\nTo exercise these rights: hernanz.luis@gmail.com',
      },
      {
        heading: '7. Minimum Age',
        body: 'Europe: 16 years old.\nUSA: 13 years old (COPPA compliance).\nWe do not knowingly collect data from minors.',
      },
      {
        heading: '8. Cookies',
        body: 'See our Cookies Policy.',
      },
      {
        heading: '9. Changes to This Policy',
        body: 'We will notify you of significant changes by email.',
      },
    ],
  },
};

export default function Privacy() {
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

      {/* Footer mínimo */}
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
