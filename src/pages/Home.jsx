import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import Nav from '../components/Nav';

export default function Home() {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location.hash]);

  const steps    = t('howItWorks.steps', { returnObjects: true });
  const features = t('features.list',   { returnObjects: true });
  const plans    = t('pricing.plans',   { returnObjects: true });

  return (
    <div className="bg-white text-black min-h-screen">
      {/* Banner desarrollo */}
      <div className="fixed top-0 left-0 right-0 z-[60] w-full py-2 text-center text-sm text-white" style={{ backgroundColor: '#0A66C2' }}>
        ✨ {t('banner.dev_text')}
        <a
          href={`mailto:hernanz.luis@gmail.com?subject=${encodeURIComponent('Lista de espera HabitTeam')}&body=${encodeURIComponent('Hola, me interesa HabitTeam y quiero estar en la lista de espera.')}`}
          className="underline text-white hover:opacity-80 transition-opacity"
        >
          {t('banner.waitlist')}
        </a>
      </div>
      <Nav />

      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center px-8 pt-40 pb-16 max-w-7xl mx-auto">
        <h1
          className="font-black text-black leading-[0.88] tracking-tight"
          style={{ fontSize: 'clamp(3.5rem, 11vw, 11rem)' }}
        >
          {t('hero.line1')}
          <br />
          {t('hero.line2')}
          <br />
          <span className="text-[#0A66C2]">{t('hero.line3')}</span>
        </h1>
        <p className="mt-10 text-lg text-gray-500 pl-1 leading-relaxed">
          {t('hero.subtitle')}
        </p>
        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <a
            href="/acceder"
            className="inline-block bg-[#1a1a1a] text-white px-12 py-5 text-sm font-medium rounded-[2px] hover:bg-black transition-colors"
          >
            {t('hero.cta')}
          </a>
          <a
            href="#como-funciona"
            onClick={(e) => {
              e.preventDefault();
              const el = document.querySelector('#como-funciona');
              if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 88, behavior: 'smooth' });
            }}
            className="inline-block text-sm font-medium text-gray-500 px-10 py-4 hover:text-black transition-colors"
          >
            {t('hero.ctaSecondary')}
          </a>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="py-32 px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h2
            className="font-black text-black leading-tight tracking-tight mb-24"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 7rem)' }}
          >
            {t('howItWorks.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-16">
            {steps.map((step, i) => (
              <div key={i}>
                <span
                  className="font-black text-gray-100 leading-none select-none"
                  style={{ fontSize: 'clamp(5rem, 10vw, 8rem)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-2xl font-bold text-black mt-2 mb-4">
                  {step.title}
                </h3>
                <p className="text-base text-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Características */}
      <section id="caracteristicas" className="py-32 pb-48 px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-24 items-start">
            <h2
              className="font-black text-black leading-tight tracking-tight sticky top-32"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 6rem)' }}
            >
              {t('features.title')}
              <br />
              <span className="text-[#0A66C2]">{t('features.titleAccent')}</span>
            </h2>
            <ul className="divide-y divide-gray-100">
              {features.map((feature, i) => (
                <li key={i} className="py-5">
                  <span className="text-lg font-medium text-black leading-snug">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Precios */}
      <section id="precios" className="py-32 px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h2
            className="font-black text-black leading-tight tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 7rem)' }}
          >
            {t('pricing.title')}
          </h2>
          <p className="text-lg text-gray-500 mb-10 max-w-xl">
            {t('pricing.subtitle')}
          </p>
          <div className="grid md:grid-cols-3 gap-0 border border-gray-200 md:items-stretch">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`p-10 flex flex-col justify-between ${i < plans.length - 1 ? 'border-b md:border-b-0 md:border-r border-gray-200' : ''} ${plan.featured ? 'bg-black text-white' : ''}`}
              >
                <div>
                  <p className={`text-sm font-medium mb-6 ${plan.featured ? 'text-gray-400' : 'text-gray-500'}`}>
                    {plan.name}
                  </p>
                  <div className="min-h-24 mb-2 flex flex-col justify-start">
                    <div className="flex items-baseline gap-1">
                      <span
                        className="font-black leading-none"
                        style={{ fontSize: /^\d|\$|€/.test(plan.price) ? 'clamp(2.5rem, 5vw, 4rem)' : 'clamp(1.25rem, 2.5vw, 1.75rem)' }}
                      >
                        {plan.price}
                      </span>
                      {plan.period?.startsWith('/') ? (
                        <span className={`text-sm font-medium ${plan.featured ? 'text-gray-400' : 'text-gray-500'}`}>
                          {plan.period}
                        </span>
                      ) : null}
                    </div>
                    {!plan.period?.startsWith('/') ? (
                      <p className={`text-sm mt-2 ${plan.featured ? 'text-gray-400' : 'text-gray-500'}`}>
                        {plan.period}
                      </p>
                    ) : null}
                  </div>
                  <ul className="space-y-3 mb-10">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-3">
                      <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${plan.featured ? 'bg-[#0A66C2]' : 'bg-gray-300'}`} />
                      <span className={`text-sm leading-snug ${plan.featured ? 'text-gray-300' : 'text-gray-700'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                </div>
                <a
                  href="/acceder"
                  className={`inline-block w-full text-center text-sm font-medium py-3 transition-colors ${
                    plan.featured
                      ? 'bg-[#0A66C2] text-white hover:bg-blue-700'
                      : 'border border-black text-black hover:bg-black hover:text-white'
                  }`}
                >
                  {plan.featured ? t('pricing.ctaPro') : t('pricing.ctaFree')}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-40 px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h2
            className="font-black text-black leading-[0.88] tracking-tight mb-12"
            style={{ fontSize: 'clamp(3rem, 9vw, 9rem)' }}
          >
            {t('cta.line1')}
            <br />
            {t('cta.line2')}
            <br />
            <span className="text-[#0A66C2]">{t('cta.line3')}</span>
          </h2>
          <a
            href="/acceder"
            className="inline-block border border-black text-black px-12 py-5 text-base font-medium hover:bg-black hover:text-white transition-colors"
          >
            {t('cta.button')}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-8 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1">
            <p className="text-xl font-bold text-black mb-4">HabitTeam</p>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
              {t('footer.colProduct')}
            </p>
            <ul className="space-y-3">
              {t('footer.product', { returnObjects: true }).map((item) => (
                <li key={item}>
                  <button className="text-sm text-gray-600 hover:text-black transition-colors text-left">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
              {t('footer.colCompany')}
            </p>
            <ul className="space-y-3">
              {t('footer.company', { returnObjects: true }).map((item) => (
                <li key={item}>
                  <button className="text-sm text-gray-600 hover:text-black transition-colors text-left">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
              {t('footer.colLegal')}
            </p>
            <ul className="space-y-3">
              <li>
                <Link to="/privacidad" className="text-sm text-gray-600 hover:text-black transition-colors">
                  {t('footer.legalPrivacy')}
                </Link>
              </li>
              <li>
                <Link to="/terminos" className="text-sm text-gray-600 hover:text-black transition-colors">
                  {t('footer.legalTerms')}
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm text-gray-600 hover:text-black transition-colors">
                  {t('footer.legalCookies')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} HabitTeam. {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-4">
            {/* Instagram */}
            <a href="https://www.instagram.com/habitteam.app" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>
            {/* TikTok */}
            <a href="https://www.tiktok.com/@habitteam.app" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-gray-400 hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
              </svg>
            </a>
            {/* Facebook */}
            <a href="https://www.facebook.com/Habitteam.app" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-400 hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
