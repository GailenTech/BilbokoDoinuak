import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { StorageAdapter, GameProgress, BadgeId, GameRecord, UserProfile, AgeRange, Gender, Barrio } from '../lib/persistence/types';
import { LocalStorageAdapter, getDefaultProgress, getLevelInfoFromXP, calculateLevelProgress, getXPForNextLevel } from '../lib/persistence';

interface ProfileFormData {
  ageRange: AgeRange;
  gender: Gender;
  barrio: Barrio;
}

interface PersistenceContextValue {
  // Profile state
  profile: UserProfile | null;
  isProfileComplete: boolean;

  // Progress state
  progress: GameProgress;
  isLoading: boolean;

  // Level info derived from progress
  levelInfo: ReturnType<typeof getLevelInfoFromXP>;
  levelProgress: number;
  xpForNextLevel: ReturnType<typeof getXPForNextLevel>;

  // Profile actions
  saveUserProfile: (data: ProfileFormData) => Promise<void>;

  // Progress actions
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<GameProgress>(getDefaultProgress);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data (profile + progress)
  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedProfile, loadedProgress] = await Promise.all([
          storageAdapter.getProfile(),
          storageAdapter.getProgress(),
        ]);
        setProfile(loadedProfile);
        setProgress(loadedProgress);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
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

  // Save user profile
  const saveUserProfile = useCallback(async (data: ProfileFormData) => {
    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      id: profile?.id ?? crypto.randomUUID(),
      displayName: profile?.displayName ?? '',
      avatarUrl: profile?.avatarUrl,
      ageRange: data.ageRange,
      gender: data.gender,
      barrio: data.barrio,
      profileCompleted: true,
      createdAt: profile?.createdAt ?? now,
      lastLoginAt: now,
    };
    await storageAdapter.saveProfile(newProfile);
    setProfile(newProfile);
  }, [storageAdapter, profile]);

  // Derived values
  const isProfileComplete = profile?.profileCompleted ?? false;
  const levelInfo = useMemo(() => getLevelInfoFromXP(progress.odisea2xp), [progress.odisea2xp]);
  const levelProgress = useMemo(() => calculateLevelProgress(progress.odisea2xp), [progress.odisea2xp]);
  const xpForNextLevel = useMemo(() => getXPForNextLevel(progress.odisea2xp), [progress.odisea2xp]);

  const value: PersistenceContextValue = useMemo(() => ({
    profile,
    isProfileComplete,
    progress,
    isLoading,
    levelInfo,
    levelProgress,
    xpForNextLevel,
    saveUserProfile,
    addXP,
    unlockBadge,
    recordGame,
    refreshProgress,
  }), [profile, isProfileComplete, progress, isLoading, levelInfo, levelProgress, xpForNextLevel, saveUserProfile, addXP, unlockBadge, recordGame, refreshProgress]);

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
