import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { StorageAdapter, GameProgress, BadgeId, GameRecord } from '../lib/persistence/types';
import { LocalStorageAdapter, getDefaultProgress, getLevelInfoFromXP, calculateLevelProgress, getXPForNextLevel } from '../lib/persistence';

interface PersistenceContextValue {
  // Progress state
  progress: GameProgress;
  isLoading: boolean;

  // Level info derived from progress
  levelInfo: ReturnType<typeof getLevelInfoFromXP>;
  levelProgress: number;
  xpForNextLevel: ReturnType<typeof getXPForNextLevel>;

  // Actions
  addXP: (amount: number) => Promise<{ leveledUp: boolean; newBadges: BadgeId[] }>;
  unlockBadge: (badgeId: BadgeId) => Promise<void>;
  recordGame: (record: Omit<GameRecord, 'playedAt'>) => Promise<void>;
  refreshProgress: () => Promise<void>;
}

const PersistenceContext = createContext<PersistenceContextValue | undefined>(undefined);

interface PersistenceProviderProps {
  children: ReactNode;
  adapter?: StorageAdapter;
}

export function PersistenceProvider({ children, adapter }: PersistenceProviderProps) {
  const [storageAdapter] = useState<StorageAdapter>(() => adapter ?? new LocalStorageAdapter());
  const [progress, setProgress] = useState<GameProgress>(getDefaultProgress);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const loaded = await storageAdapter.getProgress();
        setProgress(loaded);
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [storageAdapter]);

  // Refresh progress from storage
  const refreshProgress = useCallback(async () => {
    try {
      const loaded = await storageAdapter.getProgress();
      setProgress(loaded);
    } catch (error) {
      console.error('Failed to refresh progress:', error);
    }
  }, [storageAdapter]);

  // Add XP and return level up info
  const addXP = useCallback(async (amount: number) => {
    const oldProgress = progress;
    const oldLevel = oldProgress.level;
    const oldBadgeIds = new Set(oldProgress.badges.map(b => b.id));

    const newProgress = await storageAdapter.addXP(amount);
    setProgress(newProgress);

    const leveledUp = newProgress.level > oldLevel;
    const newBadges = newProgress.badges
      .filter(b => !oldBadgeIds.has(b.id))
      .map(b => b.id);

    return { leveledUp, newBadges };
  }, [storageAdapter, progress]);

  // Unlock badge
  const unlockBadge = useCallback(async (badgeId: BadgeId) => {
    await storageAdapter.unlockBadge(badgeId);
    await refreshProgress();
  }, [storageAdapter, refreshProgress]);

  // Record game
  const recordGame = useCallback(async (record: Omit<GameRecord, 'playedAt'>) => {
    await storageAdapter.recordGame(record);
    await refreshProgress();
  }, [storageAdapter, refreshProgress]);

  // Derived values
  const levelInfo = useMemo(() => getLevelInfoFromXP(progress.odisea2xp), [progress.odisea2xp]);
  const levelProgress = useMemo(() => calculateLevelProgress(progress.odisea2xp), [progress.odisea2xp]);
  const xpForNextLevel = useMemo(() => getXPForNextLevel(progress.odisea2xp), [progress.odisea2xp]);

  const value: PersistenceContextValue = useMemo(() => ({
    progress,
    isLoading,
    levelInfo,
    levelProgress,
    xpForNextLevel,
    addXP,
    unlockBadge,
    recordGame,
    refreshProgress,
  }), [progress, isLoading, levelInfo, levelProgress, xpForNextLevel, addXP, unlockBadge, recordGame, refreshProgress]);

  return (
    <PersistenceContext.Provider value={value}>
      {children}
    </PersistenceContext.Provider>
  );
}

export function usePersistence() {
  const context = useContext(PersistenceContext);
  if (!context) {
    throw new Error('usePersistence must be used within a PersistenceProvider');
  }
  return context;
}
