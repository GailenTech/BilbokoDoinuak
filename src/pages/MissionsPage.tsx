import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { usePersistence } from '../context/PersistenceContext';
import {
  generateDailyMissions,
  getTodayDate,
  isMissionCompleted,
  isMissionClaimed,
  getMissionProgressPercent,
  type Mission,
  type DailyMissions,
} from '../lib/persistence';
import { ArrowLeft, Target, Check, Coins, Trophy, Zap, Music, Brain } from 'lucide-react';

/**
 * Get icon component for mission type
 */
function getMissionIcon(type: Mission['type']) {
  switch (type) {
    case 'play_quiz':
      return Trophy;
    case 'streak':
      return Zap;
    case 'unlock_sounds':
      return Music;
    case 'fast_memory':
      return Brain;
    default:
      return Target;
  }
}

/**
 * Get color scheme for mission type
 */
function getMissionColors(type: Mission['type']) {
  switch (type) {
    case 'play_quiz':
      return {
        bg: 'bg-green-100',
        icon: 'text-green-600',
        progress: 'bg-green-500',
        border: 'border-green-200',
      };
    case 'streak':
      return {
        bg: 'bg-orange-100',
        icon: 'text-orange-600',
        progress: 'bg-orange-500',
        border: 'border-orange-200',
      };
    case 'unlock_sounds':
      return {
        bg: 'bg-purple-100',
        icon: 'text-purple-600',
        progress: 'bg-purple-500',
        border: 'border-purple-200',
      };
    case 'fast_memory':
      return {
        bg: 'bg-blue-100',
        icon: 'text-blue-600',
        progress: 'bg-blue-500',
        border: 'border-blue-200',
      };
    default:
      return {
        bg: 'bg-gray-100',
        icon: 'text-gray-600',
        progress: 'bg-gray-500',
        border: 'border-gray-200',
      };
  }
}

interface MissionCardProps {
  mission: Mission;
  progress: number;
  claimed: boolean;
  language: 'es' | 'eu';
  onClaim: () => void;
}

function MissionCard({ mission, progress, claimed, language, onClaim }: MissionCardProps) {
  const completed = isMissionCompleted(mission, progress);
  const progressPercent = getMissionProgressPercent(mission, progress);
  const colors = getMissionColors(mission.type);
  const IconComponent = getMissionIcon(mission.type);

  const description = language === 'es' ? mission.description_es : mission.description_eu;

  return (
    <div
      className={`bg-white rounded-xl border-2 ${
        claimed ? 'border-green-300 bg-green-50' : completed ? colors.border : 'border-gray-200'
      } shadow-sm p-4 transition-all`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center shrink-0`}
        >
          {claimed ? (
            <Check className="w-6 h-6 text-green-600" />
          ) : (
            <IconComponent className={`w-6 h-6 ${colors.icon}`} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold ${claimed ? 'text-green-700 line-through' : 'text-gray-900'}`}
          >
            {description}
          </h3>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className={claimed ? 'text-green-600' : 'text-gray-500'}>
                {progress}/{mission.target}
              </span>
              <span className={claimed ? 'text-green-600' : 'text-gray-500'}>
                {progressPercent}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${claimed ? 'bg-green-400' : colors.progress} rounded-full transition-all duration-500`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Reward and claim button */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1 text-amber-600 font-medium">
              <Coins className="w-4 h-4" />
              <span>+{mission.reward}</span>
            </div>

            {completed && !claimed && (
              <button
                onClick={onClaim}
                className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {language === 'es' ? 'Reclamar' : 'Eskatu'}
              </button>
            )}

            {claimed && (
              <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                <Check className="w-4 h-4" />
                {language === 'es' ? 'Reclamado' : 'Eskatuta'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MissionsPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { progress, refreshProgress } = usePersistence();

  // Generate today's missions (deterministic based on date)
  const today = getTodayDate();
  const missions = useMemo(() => generateDailyMissions(today), [today]);

  // Local state for missions progress and claimed status
  const [dailyState, setDailyState] = useState<DailyMissions>(() => {
    // Initialize from stored progress or create new
    const stored = progress.dailyMissions;
    if (stored && stored.date === today) {
      return {
        date: today,
        missions,
        progress: stored.progress,
        claimed: stored.claimed,
      };
    }
    // New day - reset progress
    const initialProgress: Record<string, number> = {};
    missions.forEach((m) => {
      initialProgress[m.id] = 0;
    });
    return {
      date: today,
      missions,
      progress: initialProgress,
      claimed: [],
    };
  });

  // Calculate mission progress from game stats
  useEffect(() => {
    // Count quiz games played today
    const todayGames = progress.gamesPlayed.filter((g) => {
      const gameDate = g.playedAt.split('T')[0];
      return gameDate === today;
    });

    const quizGamesPlayed = todayGames.filter((g) => g.gameType === 'quiz').length;
    const memoryGames = todayGames.filter((g) => g.gameType === 'memory');
    const bestMemoryMoves =
      memoryGames.length > 0 ? Math.min(...memoryGames.map((g) => g.moves ?? Infinity)) : Infinity;

    // Calculate best streak from quiz games (simplified - based on perfect scores)
    // In a real implementation, you'd track streak during gameplay
    const bestStreak = todayGames.filter((g) => g.gameType === 'quiz' && g.score === g.maxScore)
      .length;

    // Update progress for each mission
    setDailyState((prev) => {
      const newProgress = { ...prev.progress };
      let changed = false;

      missions.forEach((mission) => {
        let newValue = prev.progress[mission.id] ?? 0;

        switch (mission.type) {
          case 'play_quiz':
            newValue = quizGamesPlayed;
            break;
          case 'streak':
            newValue = Math.max(bestStreak, prev.progress[mission.id] ?? 0);
            break;
          case 'fast_memory':
            if (bestMemoryMoves <= mission.target) {
              newValue = mission.target; // Completed
            }
            break;
          case 'unlock_sounds':
            // Would need to track this separately
            // For now, keep existing progress
            break;
        }

        if (newValue !== prev.progress[mission.id]) {
          newProgress[mission.id] = newValue;
          changed = true;
        }
      });

      if (!changed) return prev;
      return { ...prev, progress: newProgress };
    });
  }, [progress.gamesPlayed, today, missions]);

  // Save daily state to localStorage when it changes
  useEffect(() => {
    const saveState = async () => {
      const storedProgress = await import('../lib/persistence').then((m) =>
        new m.LocalStorageAdapter().getProgress()
      );

      const updatedProgress = {
        ...storedProgress,
        dailyMissions: {
          date: dailyState.date,
          progress: dailyState.progress,
          claimed: dailyState.claimed,
        },
      };

      await import('../lib/persistence').then((m) =>
        new m.LocalStorageAdapter().saveProgress(updatedProgress)
      );
    };

    saveState();
  }, [dailyState]);

  // Handle claiming a mission reward
  const handleClaim = useCallback(
    async (missionId: string) => {
      const mission = missions.find((m) => m.id === missionId);
      if (!mission) return;

      // Update claimed status
      setDailyState((prev) => ({
        ...prev,
        claimed: [...prev.claimed, missionId],
      }));

      // Add coins to progress
      const { LocalStorageAdapter } = await import('../lib/persistence');
      const adapter = new LocalStorageAdapter();
      const currentProgress = await adapter.getProgress();

      await adapter.saveProgress({
        ...currentProgress,
        coins: (currentProgress.coins ?? 0) + mission.reward,
        dailyMissions: {
          date: dailyState.date,
          progress: dailyState.progress,
          claimed: [...dailyState.claimed, missionId],
        },
      });

      // Refresh context
      await refreshProgress();
    },
    [missions, dailyState, refreshProgress]
  );

  // Count completed and total missions
  const completedCount = missions.filter((m) =>
    isMissionCompleted(m, dailyState.progress[m.id] ?? 0)
  ).length;
  const claimedCount = dailyState.claimed.length;

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/games')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-500" />
              {language === 'es' ? 'Misiones Diarias' : 'Eguneko Misioak'}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {language === 'es'
                ? 'Completa misiones para ganar monedas'
                : 'Bete misioak txanponak irabazteko'}
            </p>
          </div>
        </div>

        {/* Coins counter */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-400 rounded-xl p-4 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Coins className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm">
                  {language === 'es' ? 'Tus monedas' : 'Zure txanponak'}
                </p>
                <p className="text-white text-2xl font-bold">{progress.coins ?? 0}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">
                {language === 'es' ? 'Misiones' : 'Misioak'}
              </p>
              <p className="text-white text-lg font-semibold">
                {claimedCount}/{missions.length}
              </p>
            </div>
          </div>
        </div>

        {/* Progress summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">
              {language === 'es' ? 'Progreso del dia' : 'Eguneko aurrerapena'}
            </span>
            <span className="text-gray-900 font-semibold">
              {completedCount}/{missions.length}{' '}
              {language === 'es' ? 'completadas' : 'osatuta'}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / missions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Mission cards */}
        <div className="space-y-4">
          {missions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              progress={dailyState.progress[mission.id] ?? 0}
              claimed={isMissionClaimed(mission.id, dailyState.claimed)}
              language={language}
              onClaim={() => handleClaim(mission.id)}
            />
          ))}
        </div>

        {/* Info note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-sm text-blue-700 text-center">
            {language === 'es'
              ? 'Las misiones se renuevan cada dia a medianoche'
              : 'Misioak gauerdian berritzen dira egunero'}
          </p>
        </div>
      </div>
    </main>
  );
}
