import type {
  StorageAdapter,
  UserProfile,
  GameProgress,
  GameRecord,
  BadgeId,
} from './types';
import { getDefaultProgress } from './types';
import { calculateLevel, getLevelUpBadges } from './levelSystem';

const STORAGE_KEYS = {
  PROFILE: 'bilboko_doinuak_profile',
  PROGRESS: 'bilboko_doinuak_progress',
} as const;

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * LocalStorage implementation of the StorageAdapter interface
 */
export class LocalStorageAdapter implements StorageAdapter {
  private storageAvailable: boolean;

  constructor() {
    this.storageAvailable = isLocalStorageAvailable();
  }

  /**
   * Get user profile from localStorage
   */
  async getProfile(): Promise<UserProfile | null> {
    if (!this.storageAvailable) {
      return null;
    }

    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!data) return null;

      return JSON.parse(data) as UserProfile;
    } catch {
      console.error('Error reading profile from localStorage');
      return null;
    }
  }

  /**
   * Save user profile to localStorage
   */
  async saveProfile(profile: UserProfile): Promise<void> {
    if (!this.storageAvailable) {
      console.warn('localStorage not available, profile not saved');
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile to localStorage:', error);
      throw new Error('Failed to save profile');
    }
  }

  /**
   * Get game progress from localStorage
   */
  async getProgress(): Promise<GameProgress> {
    if (!this.storageAvailable) {
      return getDefaultProgress();
    }

    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (!data) return getDefaultProgress();

      const progress = JSON.parse(data) as GameProgress;

      // Ensure all required fields exist
      return {
        odisea2xp: progress.odisea2xp ?? 0,
        level: progress.level ?? 1,
        badges: progress.badges ?? [],
        gamesPlayed: progress.gamesPlayed ?? [],
      };
    } catch {
      console.error('Error reading progress from localStorage');
      return getDefaultProgress();
    }
  }

  /**
   * Save game progress to localStorage
   */
  async saveProgress(progress: GameProgress): Promise<void> {
    if (!this.storageAvailable) {
      console.warn('localStorage not available, progress not saved');
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress to localStorage:', error);
      throw new Error('Failed to save progress');
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
    // (caller will save it themselves)
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
}
