import { Link } from 'react-router-dom';
import { Map, Route, Gamepad2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import sanInazioPanorama from '../assets/images/san-inazio-panorama.jpg';

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
    <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            BILBOKO DOINUAK
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            {language === 'es'
              ? 'Bienvenido a la mesa de sonidos de San Inazio'
              : 'Ongi etorri San Inazioko soinu-mahaiara'}
          </p>
        </div>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all p-6 flex flex-col items-start"
              >
                <div className={`w-14 h-14 ${item.iconBg} rounded-2xl flex items-center justify-center mb-4`}>
                  <IconComponent className="w-7 h-7 text-white" />
                </div>
                <h2 className="font-bold text-xl text-gray-900 mb-1">
                  {language === 'es' ? item.name_es : item.name_eu}
                </h2>
                <p className="text-gray-500 text-sm">
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

        {/* Panoramic Image */}
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <img
            src={sanInazioPanorama}
            alt={language === 'es' ? 'Vista panoramica de San Inazio' : 'San Inazioko ikuspegi panoramikoa'}
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="bg-white p-4 text-center">
            <p className="text-gray-600 font-medium">San Inazio</p>
          </div>
        </div>
      </div>
    </main>
  );
}
