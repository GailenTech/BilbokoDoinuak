import { Link } from 'react-router-dom';
import { Map, Route, Gamepad2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import sanInazioHistorico from '../assets/images/san-inazio-historico.jpg';

const menuItems = [
  {
    path: '/map',
    name_es: 'Mapa Interactivo',
    name_eu: 'Mapa Interaktiboa',
    icon: Map,
    iconBg: 'bg-red-500',
  },
  {
    path: '/routes',
    name_es: 'Rutas Tematicas',
    name_eu: 'Ibilbide Tematikoak',
    icon: Route,
    iconBg: 'bg-green-500',
  },
  {
    path: '/games',
    name_es: 'Juegos Sonoros',
    name_eu: 'Soinu Jokoak',
    icon: Gamepad2,
    iconBg: 'bg-orange-500',
  },
];

export function HomePage() {
  const { language } = useLanguage();

  return (
    <main className="min-h-[calc(100vh-64px)] relative overflow-hidden">
      {/* Full-page background image with vintage effect */}
      <div className="absolute inset-0">
        <img
          src={sanInazioHistorico}
          alt=""
          className="w-full h-full object-cover scale-150"
          style={{ filter: 'sepia(70%) brightness(1.05) contrast(0.95)' }}
        />
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/60 via-amber-800/40 to-amber-900/70" />
        {/* Vignette effect */}
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 150px rgba(0,0,0,0.6)' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">
            BILBOKO DOINUAK
          </h1>
          <p className="text-amber-100 mt-2 text-lg drop-shadow-md">
            {language === 'es'
              ? 'Bienvenido a la mesa de sonidos de San Inazio'
              : 'Ongi etorri San Inazioko soinu-mahaiara'}
          </p>
        </div>

        {/* Menu Cards - Semi-transparent */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="group bg-white/85 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl hover:bg-white/95 transition-all p-6 flex flex-col items-start"
              >
                <div className={`w-14 h-14 ${item.iconBg} rounded-2xl flex items-center justify-center mb-4 shadow-md`}>
                  <IconComponent className="w-7 h-7 text-white" />
                </div>
                <h2 className="font-bold text-xl text-gray-900 mb-1">
                  {language === 'es' ? item.name_es : item.name_eu}
                </h2>
                <p className="text-gray-600 text-sm">
                  {language === 'es' ? item.name_es : item.name_eu}
                </p>
                <div className="mt-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer text */}
        <div className="text-center">
          <p className="text-amber-200/80 text-sm font-medium drop-shadow">
            San Inazio · Bilbao
          </p>
        </div>
      </div>
    </main>
  );
}
