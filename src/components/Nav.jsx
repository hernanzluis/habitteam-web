import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NAV_HEIGHT = 88;

export default function Nav() {
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  const links = [
    { label: t('nav.howItWorks'), href: '#como-funciona' },
    { label: t('nav.features'),   href: '#caracteristicas' },
    { label: t('nav.pricing'),    href: '#precios' },
  ];

  function handleNavClick(e, href) {
    e.preventDefault();
    setMenuOpen(false);
    if (isHome) {
      const el = document.querySelector(href);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    } else {
      navigate('/' + href);
    }
  }

  function switchLang(lang) {
    i18n.changeLanguage(lang);
    localStorage.setItem('habitteam_lang', lang);
  }

  const currentLang = i18n.language?.split('-')[0] === 'es' ? 'es' : 'en';

  return (
    <nav className="fixed top-[40px] left-0 right-0 z-50 bg-white">
      <div className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-xl font-bold text-black tracking-tight">
          {t('nav.brand')}
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-10">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm text-black hover:text-[#0A66C2] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/acceder"
            className="text-sm font-medium text-[#0A66C2] hover:underline transition-colors"
          >
            {t('nav.login')}
          </Link>

          {/* Language switcher */}
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => switchLang('es')}
              className={`text-xs font-semibold px-2 py-1 transition-colors ${
                currentLang === 'es' ? 'text-black' : 'text-gray-400 hover:text-black'
              }`}
            >
              {t('nav.langEs')}
            </button>
            <span className="text-gray-200 text-xs">|</span>
            <button
              onClick={() => switchLang('en')}
              className={`text-xs font-semibold px-2 py-1 transition-colors ${
                currentLang === 'en' ? 'text-black' : 'text-gray-400 hover:text-black'
              }`}
            >
              {t('nav.langEn')}
            </button>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-black"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          <span className="text-2xl leading-none">{menuOpen ? '×' : '≡'}</span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white px-8 pb-8 flex flex-col gap-6">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-base text-black hover:text-[#0A66C2] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/acceder"
            onClick={() => setMenuOpen(false)}
            className="text-base font-medium text-[#0A66C2]"
          >
            {t('nav.login')}
          </Link>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => switchLang('es')}
              className={`text-sm font-semibold transition-colors ${
                currentLang === 'es' ? 'text-black' : 'text-gray-400'
              }`}
            >
              ES
            </button>
            <span className="text-gray-200">|</span>
            <button
              onClick={() => switchLang('en')}
              className={`text-sm font-semibold transition-colors ${
                currentLang === 'en' ? 'text-black' : 'text-gray-400'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
