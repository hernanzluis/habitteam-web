import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav';

const CONTENT = {
  es: {
    title: 'Términos de Uso',
    breadcrumb: 'Términos de Uso',
    sections: [
      {
        heading: '1. Aceptación',
        body: 'Al usar HabitTeam aceptas estos términos.',
      },
      {
        heading: '2. Descripción del servicio',
        body: 'HabitTeam es una plataforma de seguimiento de hábitos con validación social para grupos familiares y equipos.',
      },
      {
        heading: '3. Planes y precios',
        body: 'Plan Familiar: gratuito hasta 6 miembros y 10 hábitos activos.\nPlan Plus: 4€/mes (Europa) o $4/mes (EEUU) hasta 20 miembros y hábitos ilimitados.\nPlan Empresa: precio a consultar.\nLos cobros se realizan exclusivamente a través de la App Store (Apple) o Google Play (Google), sujetos a sus respectivas políticas de pago y reembolso.',
      },
      {
        heading: '4. Cancelación',
        body: 'Puedes cancelar tu suscripción en cualquier momento desde la App Store o Google Play.\nLos reembolsos se gestionan según las políticas de Apple y Google.',
      },
      {
        heading: '5. Contenido del usuario',
        body: 'Eres responsable de las fotografías y contenidos que subes.\nNo subas contenido ilegal, ofensivo o que viole derechos de terceros.\nHabitTeam puede eliminar contenido que viole estas normas.',
      },
      {
        heading: '6. Limitación de responsabilidad',
        body: 'El servicio se ofrece "tal cual" sin garantías de disponibilidad ininterrumpida.\nNo somos responsables de pérdidas de datos por fallos técnicos.\nHacemos copias de seguridad regulares pero no garantizamos recuperación total.',
      },
      {
        heading: '7. Indisponibilidades',
        body: 'Realizamos mantenimientos periódicos que pueden causar interrupciones breves.\nAvisaremos con antelación de mantenimientos programados cuando sea posible.\nNo garantizamos una disponibilidad del 100%.',
      },
      {
        heading: '8. Propiedad intelectual',
        body: 'HabitTeam y su contenido son propiedad de Luis Hernanz.\nLos usuarios conservan los derechos sobre el contenido que suben.',
      },
      {
        heading: '9. Ley aplicable',
        body: 'Para usuarios europeos: legislación española y normativa de la UE.\nPara usuarios de EEUU: leyes del estado de California aplicables.',
      },
    ],
  },
  en: {
    title: 'Terms of Use',
    breadcrumb: 'Terms of Use',
    sections: [
      {
        heading: '1. Acceptance',
        body: 'By using HabitTeam you accept these terms.',
      },
      {
        heading: '2. Service Description',
        body: 'HabitTeam is a habit-tracking platform with social validation for family groups and teams.',
      },
      {
        heading: '3. Plans and Pricing',
        body: 'Family Plan: free for up to 6 members and 10 active habits.\nPlus Plan: €4/month (Europe) or $4/month (USA) for up to 20 members and unlimited habits.\nEnterprise Plan: price on request.\nPayments are processed exclusively through the App Store (Apple) or Google Play (Google), subject to their respective payment and refund policies.',
      },
      {
        heading: '4. Cancellation',
        body: 'You may cancel your subscription at any time from the App Store or Google Play.\nRefunds are handled according to Apple and Google policies.',
      },
      {
        heading: '5. User Content',
        body: 'You are responsible for the photographs and content you upload.\nDo not upload illegal, offensive or third-party rights-infringing content.\nHabitTeam may remove content that violates these rules.',
      },
      {
        heading: '6. Limitation of Liability',
        body: 'The service is provided "as is" without guarantees of uninterrupted availability.\nWe are not responsible for data loss due to technical failures.\nWe perform regular backups but do not guarantee full recovery.',
      },
      {
        heading: '7. Downtime',
        body: 'We perform periodic maintenance that may cause brief interruptions.\nWe will provide advance notice of scheduled maintenance when possible.\nWe do not guarantee 100% availability.',
      },
      {
        heading: '8. Intellectual Property',
        body: 'HabitTeam and its content are the property of Luis Hernanz.\nUsers retain rights over the content they upload.',
      },
      {
        heading: '9. Applicable Law',
        body: 'For European users: Spanish law and EU regulations.\nFor US users: applicable California state laws.',
      },
    ],
  },
};

export default function Terms() {
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
