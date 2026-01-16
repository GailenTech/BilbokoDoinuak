import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import type { StorageAdapter, GameProgress, BadgeId, GameRecord, UserProfile, AgeRange, Gender, Barrio } from '../lib/persistence/types';
import { LocalStorageAdapter, SupabaseAdapter, getDefaultProgress, getLevelInfoFromXP, calculateLevelProgress, getXPForNextLevel } from '../lib/persistence';
import { useAuth } from './AuthContext';

interface ProfileFormData {
  ageRange: AgeRange;
  gender: Gender;
  barrio: Barrio;
  barrioOtro?: string;
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
  const { user, isAuthenticated, isLoading: authLoading, isSupabaseEnabled } = useAuth();

  // Create adapters - one for each mode
  const localAdapterRef = useRef(new LocalStorageAdapter());
  const supabaseAdapterRef = useRef<SupabaseAdapter | null>(null);

  // Initialize Supabase adapter only if Supabase is enabled
  useEffect(() => {
    if (isSupabaseEnabled && !supabaseAdapterRef.current) {
      supabaseAdapterRef.current = new SupabaseAdapter(user);
    }
    if (supabaseAdapterRef.current) {
      supabaseAdapterRef.current.setUser(user);
    }
  }, [user, isSupabaseEnabled]);

  // Get the appropriate adapter based on auth state
  const getActiveAdapter = useCallback((): StorageAdapter => {
    if (adapter) return adapter;
    if (isAuthenticated && supabaseAdapterRef.current) {
      return supabaseAdapterRef.current;
    }
    return localAdapterRef.current;
  }, [adapter, isAuthenticated]);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<GameProgress>(getDefaultProgress);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMigrated, setHasMigrated] = useState(false);

  // Load data when auth state changes
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const activeAdapter = getActiveAdapter();

        // If user just authenticated and we haven't migrated yet, do it now
        if (isAuthenticated && !hasMigrated && supabaseAdapterRef.current) {
          await supabaseAdapterRef.current.migrateFromLocalStorage();
          setHasMigrated(true);
        }

        const [loadedProfile, loadedProgress] = await Promise.all([
          activeAdapter.getProfile(),
          activeAdapter.getProgress(),
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
  }, [authLoading, isAuthenticated, getActiveAdapter, hasMigrated]);

  // Reset migration flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setHasMigrated(false);
    }
  }, [isAuthenticated]);

  // Refresh progress from storage
  const refreshProgress = useCallback(async () => {
    try {
      const loaded = await getActiveAdapter().getProgress();
      setProgress(loaded);
    } catch (error) {
      console.error('Failed to refresh progress:', error);
    }
  }, [getActiveAdapter]);

  // Add XP and return level up info
  const addXP = useCallback(async (amount: number) => {
    const oldProgress = progress;
    const oldLevel = oldProgress.level;
    const oldBadgeIds = new Set(oldProgress.badges.map(b => b.id));

    const newProgress = await getActiveAdapter().addXP(amount);
    setProgress(newProgress);

    const leveledUp = newProgress.level > oldLevel;
    const newBadges = newProgress.badges
      .filter(b => !oldBadgeIds.has(b.id))
      .map(b => b.id);

    return { leveledUp, newBadges };
  }, [getActiveAdapter, progress]);

  // Unlock badge
  const unlockBadge = useCallback(async (badgeId: BadgeId) => {
    await getActiveAdapter().unlockBadge(badgeId);
    await refreshProgress();
  }, [getActiveAdapter, refreshProgress]);

  // Record game
  const recordGame = useCallback(async (record: Omit<GameRecord, 'playedAt'>) => {
    await getActiveAdapter().recordGame(record);
    await refreshProgress();
  }, [getActiveAdapter, refreshProgress]);

  // Save user profile
  const saveUserProfile = useCallback(async (data: ProfileFormData) => {
    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      id: user?.id ?? profile?.id ?? crypto.randomUUID(),
      displayName: user?.user_metadata?.full_name ?? profile?.displayName ?? '',
      avatarUrl: user?.user_metadata?.avatar_url ?? profile?.avatarUrl,
      ageRange: data.ageRange,
      gender: data.gender,
      barrio: data.barrio,
      barrioOtro: data.barrioOtro,
      profileCompleted: true,
      createdAt: profile?.createdAt ?? now,
      lastLoginAt: now,
    };
    await getActiveAdapter().saveProfile(newProfile);
    setProfile(newProfile);
  }, [getActiveAdapter, profile, user]);

  // Derived values
  const isProfileComplete = profile?.profileCompleted ?? false;
  const levelInfo = useMemo(() => getLevelInfoFromXP(progress.odisea2xp), [progress.odisea2xp]);
  const levelProgress = useMemo(() => calculateLevelProgress(progress.odisea2xp), [progress.odisea2xp]);
  const xpForNextLevel = useMemo(() => getXPForNextLevel(progress.odisea2xp), [progress.odisea2xp]);

  const value: PersistenceContextValue = useMemo(() => ({
    profile,
    isProfileComplete,
    progress,
    isLoading: isLoading || authLoading,
    levelInfo,
    levelProgress,
    xpForNextLevel,
    saveUserProfile,
    addXP,
    unlockBadge,
    recordGame,
    refreshProgress,
  }), [profile, isProfileComplete, progress, isLoading, authLoading, levelInfo, levelProgress, xpForNextLevel, saveUserProfile, addXP, unlockBadge, recordGame, refreshProgress]);

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
