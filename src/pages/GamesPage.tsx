import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Play, Trophy, Target, LayoutGrid, User, Swords, Award, Coins } from 'lucide-react';

const mainGames = [
  {
    id: 'quiz',
    path: '/games/quiz',
    name_es: 'Quiz Sonoro',
    name_eu: 'Soinu Quiz',
    description_es: 'Adivina los sonidos y gana XP',
    description_eu: 'Asmatu soinuak eta irabazi XP',
    icon: Play,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-500',
    borderColor: 'border-l-green-500',
    enabled: true,
  },
  {
    id: 'memory',
    path: '/games/memory',
    name_es: 'Memory Sonoro',
    name_eu: 'Soinu Memory',
    description_es: 'Asocia imágenes con sus sonidos',
    description_eu: 'Lotu irudiak haien soinuekin',
    icon: Trophy,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500',
    borderColor: 'border-l-orange-500',
    enabled: true,
  },
  {
    id: 'missions',
    path: null,
    name_es: 'Misiones Diarias',
    name_eu: 'Eguneko Misioak',
    description_es: '3 objetivos para hoy',
    description_eu: 'Gaurko 3 helburu',
    icon: Target,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500',
    borderColor: 'border-l-blue-500',
    enabled: false,
  },
];

const secondaryGames = [
  {
    id: 'collections',
    name_es: 'Colecciones',
    name_eu: 'Bildumak',
    icon: LayoutGrid,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    id: 'profile',
    name_es: 'Perfil & Badges',
    name_eu: 'Profila & Insigniak',
    icon: User,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-500',
  },
  {
    id: 'challenge',
    name_es: '1 vs 1',
    name_eu: '1 vs 1',
    icon: Swords,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
  },
  {
    id: 'ranking',
    name_es: 'Ranking',
    name_eu: 'Sailkapena',
    icon: Award,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
];

export function GamesPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* User profile card with gradient */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-400 rounded-2xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/30 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl">{language === 'es' ? 'Usuario' : 'Erabiltzailea'}</h2>
                <p className="text-white/80 text-sm">Level Explorer</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm">
                <Coins className="w-4 h-4" />
                <span>Coins</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>XP</span>
              <span>0 XP</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full w-1/4"></div>
            </div>
          </div>
        </div>

        {/* Main games - horizontal cards */}
        <div className="space-y-3 mb-6">
          {mainGames.map((game) => {
            const IconComponent = game.icon;
            return (
              <button
                key={game.id}
                onClick={() => game.path && navigate(game.path)}
                disabled={!game.enabled}
                className={`w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-left transition-all flex items-center gap-4 p-4 border-l-4 ${game.borderColor} ${
                  game.enabled
                    ? 'hover:shadow-md cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className={`w-12 h-12 ${game.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                  <IconComponent className={`w-6 h-6 ${game.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {language === 'es' ? game.name_es : game.name_eu}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {language === 'es' ? game.description_es : game.description_eu}
                  </p>
                </div>
                {!game.enabled && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                    {language === 'es' ? 'Próximamente' : 'Laster'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary games - grid */}
        <div className="grid grid-cols-2 gap-3">
          {secondaryGames.map((game) => {
            const IconComponent = game.icon;
            return (
              <button
                key={game.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center transition-all hover:shadow-md"
              >
                <div className={`w-12 h-12 ${game.iconBg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <IconComponent className={`w-6 h-6 ${game.iconColor}`} />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  {language === 'es' ? game.name_es : game.name_eu}
                </h3>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
