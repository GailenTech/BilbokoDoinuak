import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { usePersistence } from '../context/PersistenceContext';
import { BADGE_DEFINITIONS } from '../lib/persistence/levelSystem';
import type { BadgeId } from '../lib/persistence/types';
import { ArrowLeft, Trophy, Flame, Gamepad2 } from 'lucide-react';

// All available badges in display order
const ALL_BADGE_IDS: BadgeId[] = [
  // Base44 badges first
  'novato',
  'oido_fino',
  'racha_5',
  'veterano',
  // Original badges
  'first_quiz',
  'first_memory',
  'perfect_quiz',
  'fast_memory',
  'level_2',
  'level_3',
  'level_4',
];

export function ProfilePage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { progress, levelInfo, isLoading } = usePersistence();

  // Get unlocked badge IDs for quick lookup
  const unlockedBadgeIds = new Set(progress.badges.map(b => b.id));

  // Calculate stats
  const gamesPlayed = progress.gamesPlayed.length;

  // Calculate best streak from game history (simplified - would need actual streak tracking)
  const bestStreak = progress.badges.some(b => b.id === 'racha_5') ? 5 : 0;

  // Get level name in current language
  const levelName = language === 'es' ? levelInfo.name_es : levelInfo.name_eu;

  // Generate avatar URL using DiceBear
  const avatarSeed = progress.odisea2xp.toString();
  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`;

  if (isLoading) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">
          {language === 'es' ? 'Cargando...' : 'Kargatzen...'}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Back button */}
        <button
          onClick={() => navigate('/games')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{language === 'es' ? 'Volver a Juegos' : 'Itzuli Jokoetara'}</span>
        </button>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-purple-100 overflow-hidden border-4 border-purple-200 shrink-0">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">
                {levelName}
              </h1>
              <p className="text-purple-600 font-medium">
                {language === 'es'
                  ? `Nivel ${levelInfo.level}`
                  : `${levelInfo.level}. Maila`}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {progress.odisea2xp} XP
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Games Played */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{gamesPlayed}</p>
                <p className="text-sm text-gray-500">
                  {language === 'es' ? 'Partidas' : 'Partidak'}
                </p>
              </div>
            </div>
          </div>

          {/* Best Streak */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{bestStreak}</p>
                <p className="text-sm text-gray-500">
                  {language === 'es' ? 'Mejor racha' : 'Raxa onena'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-900">
              {language === 'es' ? 'Chapas' : 'Txapak'}
            </h2>
            <span className="text-sm text-gray-500 ml-auto">
              {progress.badges.length}/{ALL_BADGE_IDS.length}
            </span>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-3 gap-3">
            {ALL_BADGE_IDS.map((badgeId) => {
              const badge = BADGE_DEFINITIONS[badgeId];
              const isUnlocked = unlockedBadgeIds.has(badgeId);
              const name = language === 'es' ? badge.name_es : badge.name_eu;
              const description = language === 'es' ? badge.description_es : badge.description_eu;

              return (
                <div
                  key={badgeId}
                  className={`rounded-xl p-3 text-center transition-all ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200'
                      : 'bg-gray-100 border border-gray-200 opacity-50'
                  }`}
                  title={description}
                >
                  {/* Badge Icon */}
                  <div
                    className={`text-3xl mb-2 ${
                      isUnlocked ? '' : 'grayscale'
                    }`}
                  >
                    {badge.icon}
                  </div>

                  {/* Badge Name */}
                  <p
                    className={`text-xs font-medium truncate ${
                      isUnlocked ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {name}
                  </p>

                  {/* Locked indicator */}
                  {!isUnlocked && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      {language === 'es' ? '(Bloqueado)' : '(Blokeatuta)'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Hint text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {language === 'es'
            ? 'Juega para desbloquear mas chapas'
            : 'Jokatu txapa gehiago desblokeatzeko'}
        </p>
      </div>
    </main>
  );
}
