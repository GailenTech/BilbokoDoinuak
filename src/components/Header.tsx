import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Home, Map, Route, Gamepad2, Settings, Globe, Menu, X } from 'lucide-react';
import bilbaoLogo from '../assets/images/bilbao-ayto-logo.png';
import doinuakLogo from '../assets/images/bilboko-doinuak-logo.jpg';

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-[1001] bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
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

        {/* Language toggle + Hamburger menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'es' ? 'eu' : 'es')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors text-gray-900"
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-medium">
              {language === 'es' ? 'EUS' : 'CAS'}
            </span>
          </button>

          {/* Hamburger menu button - mobile only */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <nav className="md:hidden absolute left-0 right-0 top-16 z-[1001] bg-gray-50 border-b border-gray-200 shadow-lg">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-200 shadow-sm transition-all ${
                  isActive(path)
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
