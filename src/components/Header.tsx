import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Home, Map, Route, Gamepad2, Settings, Globe } from 'lucide-react';
import bilbaoLogo from '../assets/images/bilbao-ayto-logo.png';
import doinuakLogo from '../assets/images/bilboko-doinuak-logo.jpg';

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { path: '/', label: t('nav.home'), icon: Home },
    { path: '/map', label: t('nav.map'), icon: Map },
    { path: '/routes', label: t('nav.routes'), icon: Route },
    { path: '/games', label: t('nav.games'), icon: Gamepad2 },
    { path: '/admin', label: t('nav.admin'), icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logos */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src={bilbaoLogo}
            alt="Ayuntamiento de Bilbao"
            className="h-10"
          />
          <img
            src={doinuakLogo}
            alt="Bilboko doinuak San Inazio"
            className="h-10"
          />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`text-sm font-medium hover:text-red-600 transition-colors flex items-center gap-2 ${
                isActive(path)
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Language toggle */}
        <button
          onClick={() => setLanguage(language === 'es' ? 'eu' : 'es')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors text-gray-900"
        >
          <Globe className="w-4 h-4" />
          <span className="text-xs font-medium">
            {language === 'es' ? 'EUS' : 'CAS'}
          </span>
        </button>
      </div>
    </header>
  );
}
