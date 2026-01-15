import { useLanguage } from '../context/LanguageContext';
import { Brain, Music2, Target, Trophy, Users, Star } from 'lucide-react';

const games = [
  {
    id: 'quiz',
    name_es: 'Quiz Sonoro',
    name_eu: 'Soinu Quiz',
    description_es: 'Adivina los sonidos y gana XP',
    description_eu: 'Asmatu soinuak eta irabazi XP',
    icon: Brain,
    color: '#8b5cf6',
    available: true,
  },
  {
    id: 'memory',
    name_es: 'Memory Sonoro',
    name_eu: 'Soinu Memory',
    description_es: 'Asocia imágenes con sus sonidos',
    description_eu: 'Lotu irudiak haien soinuekin',
    icon: Music2,
    color: '#ec4899',
    available: true,
  },
  {
    id: 'missions',
    name_es: 'Misiones Diarias',
    name_eu: 'Eguneko Misioak',
    description_es: '3 objetivos para hoy',
    description_eu: 'Gaurko 3 helburu',
    icon: Target,
    color: '#f59e0b',
    available: false,
  },
  {
    id: 'collections',
    name_es: 'Colecciones',
    name_eu: 'Bildumak',
    description_es: 'Completa tu colección de sonidos',
    description_eu: 'Osatu zure soinu bilduma',
    icon: Star,
    color: '#10b981',
    available: false,
  },
  {
    id: 'challenge',
    name_es: '1 vs 1',
    name_eu: '1 vs 1',
    description_es: 'Desafía a otros jugadores',
    description_eu: 'Desafiatu beste jokalari batzuk',
    icon: Users,
    color: '#3b82f6',
    available: false,
  },
  {
    id: 'ranking',
    name_es: 'Ranking',
    name_eu: 'Sailkapena',
    description_es: 'Compite por el primer puesto',
    description_eu: 'Lehiatu lehen postuagatik',
    icon: Trophy,
    color: '#ef4444',
    available: false,
  },
];

export function GamesPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* User profile placeholder */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              U
            </div>
            <div>
              <h2 className="font-bold text-lg">{language === 'es' ? 'Usuario' : 'Erabiltzailea'}</h2>
              <p className="text-gray-500 text-sm">Level Explorer</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>XP</span>
              <span>0 XP</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-full bg-[#1e3a5f] rounded-full w-0"></div>
            </div>
          </div>
        </div>

        {/* Games grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {games.map((game) => {
            const IconComponent = game.icon;
            return (
              <button
                key={game.id}
                disabled={!game.available}
                className={`bg-white rounded-xl shadow-md overflow-hidden text-left transition-all ${
                  game.available
                    ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer'
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                <div
                  className="h-24 flex items-center justify-center"
                  style={{ backgroundColor: game.available ? game.color : '#9ca3af' }}
                >
                  <IconComponent size={40} className="text-white" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[#1e3a5f]">
                    {language === 'es' ? game.name_es : game.name_eu}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {language === 'es' ? game.description_es : game.description_eu}
                  </p>
                  {!game.available && (
                    <span className="inline-block mt-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      {language === 'es' ? 'Próximamente' : 'Laster'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
