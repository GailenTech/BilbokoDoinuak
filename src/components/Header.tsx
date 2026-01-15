import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Home, Map, Route, Gamepad2, Settings } from 'lucide-react';

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
    <header className="bg-[#1e3a5f] text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logos */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6936cdc7a410f6ff280751de/3a0c01149_logo.png"
              alt="Bilboko Doinuak"
              className="h-10"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive(path)
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
          </nav>

          {/* Language toggle */}
          <button
            onClick={() => setLanguage(language === 'es' ? 'eu' : 'es')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <span className="text-sm font-medium">
              {language === 'es' ? 'EUS' : 'CAS'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
