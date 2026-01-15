import type {
  StorageAdapter,
  UserProfile,
  GameProgress,
  GameRecord,
  BadgeId,
} from './types';
import { getDefaultProgress } from './types';
import { calculateLevel, getLevelUpBadges } from './levelSystem';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import type { User } from '@supabase/supabase-js';

/**
 * Database table types matching Supabase schema
 */
interface DbProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  age_range: string | null;
  gender: string | null;
  barrio: string | null;
  profile_completed: boolean;
  created_at: string;
  last_login_at: string;
}

interface DbProgress {
  user_id: string;
  odisea2xp: number;
  level: number;
  coins: number;
  badges: Array<{ id: string; unlockedAt: string }>;
  games_played: GameRecord[];
  daily_missions: GameProgress['dailyMissions'] | null;
  unlocked_sounds: string[];
  updated_at: string;
}

/**
 * Convert database profile to application UserProfile
 */
function dbProfileToUserProfile(db: DbProfile): UserProfile {
  return {
    id: db.id,
    displayName: db.display_name,
    avatarUrl: db.avatar_url ?? undefined,
    ageRange: db.age_range as UserProfile['ageRange'],
    gender: db.gender as UserProfile['gender'],
    barrio: db.barrio as UserProfile['barrio'],
    profileCompleted: db.profile_completed,
    createdAt: db.created_at,
    lastLoginAt: db.last_login_at,
  };
}

/**
 * Convert application UserProfile to database format
 */
function userProfileToDb(profile: UserProfile): Omit<DbProfile, 'created_at'> {
  return {
    id: profile.id,
    display_name: profile.displayName,
    avatar_url: profile.avatarUrl ?? null,
    age_range: profile.ageRange ?? null,
    gender: profile.gender ?? null,
    barrio: profile.barrio ?? null,
    profile_completed: profile.profileCompleted,
    last_login_at: profile.lastLoginAt,
  };
}

/**
 * Convert database progress to application GameProgress
 */
function dbProgressToGameProgress(db: DbProgress): GameProgress {
  return {
    odisea2xp: db.odisea2xp,
    level: db.level,
    coins: db.coins,
    badges: db.badges.map(b => ({ id: b.id as BadgeId, unlockedAt: b.unlockedAt })),
    gamesPlayed: db.games_played,
    dailyMissions: db.daily_missions ?? undefined,
    unlockedSounds: db.unlocked_sounds,
  };
}

/**
 * Convert application GameProgress to database format
 */
function gameProgressToDb(userId: string, progress: GameProgress): Omit<DbProgress, 'updated_at'> {
  return {
    user_id: userId,
    odisea2xp: progress.odisea2xp,
    level: progress.level,
    coins: progress.coins,
    badges: progress.badges.map(b => ({ id: b.id, unlockedAt: b.unlockedAt })),
    games_played: progress.gamesPlayed,
    daily_missions: progress.dailyMissions ?? null,
    unlocked_sounds: progress.unlockedSounds,
  };
}

/**
 * Supabase implementation of the StorageAdapter interface.
 * Falls back to LocalStorageAdapter when not authenticated.
 */
export class SupabaseAdapter implements StorageAdapter {
  private localAdapter: LocalStorageAdapter;
  private user: User | null = null;
  private onAuthChange?: (user: User | null) => void;

  constructor(user: User | null = null, onAuthChange?: (user: User | null) => void) {
    this.localAdapter = new LocalStorageAdapter();
    this.user = user;
    this.onAuthChange = onAuthChange;
  }

  /**
   * Update the current user
   */
  setUser(user: User | null): void {
    this.user = user;
    this.onAuthChange?.(user);
  }

  /**
   * Check if we should use Supabase or fall back to localStorage
   */
  private shouldUseSupabase(): boolean {
    return isSupabaseConfigured && this.user !== null && supabase !== null;
  }

  /**
   * Get user profile from Supabase or localStorage
   */
  async getProfile(): Promise<UserProfile | null> {
    if (!this.shouldUseSupabase()) {
      return this.localAdapter.getProfile();
    }

    try {
      const { data, error } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', this.user!.id)
        .single();

      if (error) {
        // Profile doesn't exist yet
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('[SupabaseAdapter] Error fetching profile:', error);
        return this.localAdapter.getProfile();
      }

      return dbProfileToUserProfile(data as DbProfile);
    } catch (err) {
      console.error('[SupabaseAdapter] Exception fetching profile:', err);
      return this.localAdapter.getProfile();
    }
  }

  /**
   * Save user profile to Supabase or localStorage
   */
  async saveProfile(profile: UserProfile): Promise<void> {
    if (!this.shouldUseSupabase()) {
      return this.localAdapter.saveProfile(profile);
    }

    try {
      // Ensure profile ID matches authenticated user
      const profileToSave = {
        ...userProfileToDb(profile),
        id: this.user!.id,
        created_at: profile.createdAt,
      };

      const { error } = await supabase!
        .from('profiles')
        .upsert(profileToSave, { onConflict: 'id' });

      if (error) {
        console.error('[SupabaseAdapter] Error saving profile:', error);
        throw new Error('Failed to save profile to Supabase');
      }
    } catch (err) {
      console.error('[SupabaseAdapter] Exception saving profile:', err);
      throw err;
    }
  }

  /**
   * Get game progress from Supabase or localStorage
   */
  async getProgress(): Promise<GameProgress> {
    if (!this.shouldUseSupabase()) {
      return this.localAdapter.getProgress();
    }

    try {
      const { data, error } = await supabase!
        .from('progress')
        .select('*')
        .eq('user_id', this.user!.id)
        .single();

      if (error) {
        // Progress doesn't exist yet
        if (error.code === 'PGRST116') {
          return getDefaultProgress();
        }
        console.error('[SupabaseAdapter] Error fetching progress:', error);
        return this.localAdapter.getProgress();
      }

      return dbProgressToGameProgress(data as DbProgress);
    } catch (err) {
      console.error('[SupabaseAdapter] Exception fetching progress:', err);
      return this.localAdapter.getProgress();
    }
  }

  /**
   * Save game progress to Supabase or localStorage
   */
  async saveProgress(progress: GameProgress): Promise<void> {
    if (!this.shouldUseSupabase()) {
      return this.localAdapter.saveProgress(progress);
    }

    try {
      const progressToSave = {
        ...gameProgressToDb(this.user!.id, progress),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase!
        .from('progress')
        .upsert(progressToSave, { onConflict: 'user_id' });

      if (error) {
        console.error('[SupabaseAdapter] Error saving progress:', error);
        throw new Error('Failed to save progress to Supabase');
      }
    } catch (err) {
      console.error('[SupabaseAdapter] Exception saving progress:', err);
      throw err;
    }
  }

  /**
   * Add XP to user's progress and handle level ups
   */
  async addXP(amount: number): Promise<GameProgress> {
    const progress = await this.getProgress();
    const oldLevel = progress.level;

    progress.odisea2xp += amount;
    progress.level = calculateLevel(progress.odisea2xp);

    // Check for level up badges
    if (progress.level > oldLevel) {
      const levelBadges = getLevelUpBadges(oldLevel, progress.level);
      for (const badgeId of levelBadges) {
        await this.unlockBadge(badgeId, progress);
      }
    }

    await this.saveProgress(progress);
    return progress;
  }

  /**
   * Unlock a badge if not already unlocked
   */
  async unlockBadge(badgeId: BadgeId, existingProgress?: GameProgress): Promise<void> {
    const progress = existingProgress ?? (await this.getProgress());

    // Check if badge already unlocked
    const alreadyUnlocked = progress.badges.some(b => b.id === badgeId);
    if (alreadyUnlocked) return;

    progress.badges.push({
      id: badgeId,
      unlockedAt: new Date().toISOString(),
    });

    // Only save if we weren't passed an existing progress object
    if (!existingProgress) {
      await this.saveProgress(progress);
    }
  }

  /**
   * Record a completed game
   */
  async recordGame(record: Omit<GameRecord, 'playedAt'>): Promise<void> {
    const progress = await this.getProgress();

    const fullRecord: GameRecord = {
      ...record,
      playedAt: new Date().toISOString(),
    };

    progress.gamesPlayed.push(fullRecord);

    // Check for first game badges
    const isFirstQuiz =
      record.gameType === 'quiz' &&
      !progress.badges.some(b => b.id === 'first_quiz');

    const isFirstMemory =
      record.gameType === 'memory' &&
      !progress.badges.some(b => b.id === 'first_memory');

    if (isFirstQuiz) {
      progress.badges.push({
        id: 'first_quiz',
        unlockedAt: new Date().toISOString(),
      });
    }

    if (isFirstMemory) {
      progress.badges.push({
        id: 'first_memory',
        unlockedAt: new Date().toISOString(),
      });
    }

    await this.saveProgress(progress);
  }

  /**
   * Migrate data from localStorage to Supabase
   * Called when user authenticates for the first time
   */
  async migrateFromLocalStorage(): Promise<void> {
    if (!this.shouldUseSupabase()) {
      console.warn('[SupabaseAdapter] Cannot migrate - not authenticated');
      return;
    }

    try {
      // Get local data
      const localProfile = await this.localAdapter.getProfile();
      const localProgress = await this.localAdapter.getProgress();

      // Check if cloud data already exists
      const { data: cloudProfile } = await supabase!
        .from('profiles')
        .select('id')
        .eq('id', this.user!.id)
        .single();

      const { data: cloudProgress } = await supabase!
        .from('progress')
        .select('user_id')
        .eq('user_id', this.user!.id)
        .single();

      // Migrate profile if local exists and cloud doesn't
      if (localProfile && !cloudProfile) {
        console.log('[SupabaseAdapter] Migrating profile from localStorage');
        await this.saveProfile({
          ...localProfile,
          id: this.user!.id, // Use Supabase user ID
        });
      }

      // Migrate progress if local has meaningful data and cloud doesn't
      const hasLocalProgress = localProgress.odisea2xp > 0 || localProgress.badges.length > 0;
      if (hasLocalProgress && !cloudProgress) {
        console.log('[SupabaseAdapter] Migrating progress from localStorage');
        await this.saveProgress(localProgress);
      }

      console.log('[SupabaseAdapter] Migration complete');
    } catch (err) {
      console.error('[SupabaseAdapter] Migration failed:', err);
    }
  }
}
