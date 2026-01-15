import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { usePersistence } from '../context/PersistenceContext';
import { Play, Trophy, Target, LayoutGrid, User, Swords, Award, Sparkles, Lock } from 'lucide-react';

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
    path: '/games/missions',
    name_es: 'Misiones Diarias',
    name_eu: 'Eguneko Misioak',
    description_es: '3 objetivos para hoy',
    description_eu: 'Gaurko 3 helburu',
    icon: Target,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500',
    borderColor: 'border-l-blue-500',
    enabled: true,
  },
];

const secondaryGames = [
  {
    id: 'collections',
    path: null,
    name_es: 'Colecciones',
    name_eu: 'Bildumak',
    description_es: 'Descubre sonidos',
    description_eu: 'Aurkitu soinuak',
    icon: LayoutGrid,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    enabled: false,
  },
  {
    id: 'profile',
    path: '/games/profile',
    name_es: 'Perfil & Chapas',
    name_eu: 'Profila eta Txapak',
    description_es: 'Tus logros',
    description_eu: 'Zure lorpenak',
    icon: User,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-500',
    enabled: true,
  },
  {
    id: 'challenge',
    path: null,
    name_es: '1 vs 1',
    name_eu: '1 vs 1',
    description_es: 'Reta a amigos',
    description_eu: 'Desafiatu lagunak',
    icon: Swords,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
    enabled: false,
  },
  {
    id: 'ranking',
    path: null,
    name_es: 'Ranking',
    name_eu: 'Sailkapena',
    description_es: 'Clasificacion',
    description_eu: 'Sailkapena',
    icon: Award,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    enabled: false,
  },
];

export function GamesPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { progress, levelInfo, levelProgress, xpForNextLevel, isLoading } = usePersistence();

  // Get level name in current language
  const levelName = language === 'es' ? levelInfo.name_es : levelInfo.name_eu;

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header section with title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            {language === 'es' ? 'Juegos Sonoros' : 'Soinu Jokoak'}
          </h1>
          <p className="text-gray-500 mt-1">
            {language === 'es'
              ? 'Aprende jugando con los sonidos de San Inazio'
              : 'Ikasi jolasten San Inazioko soinuekin'}
          </p>
        </div>

        {/* User profile card with gradient */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl shadow-lg p-6 mb-6 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute -right-8 top-8 w-16 h-16 bg-white/10 rounded-full"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                <User className="w-9 h-9 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl">{levelName}</h2>
                <p className="text-white/80 text-sm flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                  {language === 'es'
                    ? `Nivel ${levelInfo.level} - ${levelName}`
                    : `${levelInfo.level}. Maila - ${levelName}`}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">{language === 'es' ? 'Progreso' : 'Aurrerapena'}</span>
              <span className="text-white/80">
                {isLoading ? '...' : `${progress.odisea2xp} / ${xpForNextLevel.needed} XP`}
              </span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-300 rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-white/60 mt-2">
              {progress.badges.length > 0
                ? (language === 'es'
                    ? `${progress.badges.length} chapa${progress.badges.length > 1 ? 's' : ''} desbloqueada${progress.badges.length > 1 ? 's' : ''}`
                    : `${progress.badges.length} txapa desblokeatuta`)
                : (language === 'es'
                    ? 'Juega para ganar XP y desbloquear chapas'
                    : 'Jokatu XP irabazteko eta txapak desblokeatzeko')}
            </p>
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
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {language === 'es' ? 'Proximamente' : 'Laster'}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {secondaryGames.map((game) => {
            const IconComponent = game.icon;

            if (game.enabled && game.path) {
              return (
                <button
                  key={game.id}
                  onClick={() => navigate(game.path!)}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center relative hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className={`w-12 h-12 ${game.iconBg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                    <IconComponent className={`w-6 h-6 ${game.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-gray-700 text-sm">
                    {language === 'es' ? game.name_es : game.name_eu}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {language === 'es' ? game.description_es : game.description_eu}
                  </p>
                </button>
              );
            }

            return (
              <div
                key={game.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center relative opacity-60"
              >
                {/* Lock overlay */}
                <div className="absolute top-2 right-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <div className={`w-12 h-12 ${game.iconBg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                  <IconComponent className={`w-6 h-6 ${game.iconColor}`} />
                </div>
                <h3 className="font-semibold text-gray-700 text-sm">
                  {language === 'es' ? game.name_es : game.name_eu}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {language === 'es' ? game.description_es : game.description_eu}
                </p>
              </div>
            );
          })}
        </div>

        {/* Info about upcoming features */}
        <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
          <p className="text-sm text-purple-700 text-center">
            {language === 'es'
              ? 'Mas juegos y funciones llegaran pronto. Mientras tanto, disfruta del Quiz y Memory!'
              : 'Joko eta funtzio gehiago laster etorriko dira. Bitartean, gozatu Quiz eta Memory!'}
          </p>
        </div>
      </div>
    </main>
  );
}
