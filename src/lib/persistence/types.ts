/**
 * User profile information
 */
export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt: string;
}

/**
 * Badge earned by completing achievements
 */
export interface Badge {
  id: BadgeId;
  unlockedAt: string;
}

/**
 * Available badge identifiers
 */
export type BadgeId =
  | 'first_quiz'
  | 'first_memory'
  | 'perfect_quiz'
  | 'fast_memory'
  | 'level_2'
  | 'level_3'
  | 'level_4';

/**
 * Record of a single game played
 */
export interface GameRecord {
  gameType: 'quiz' | 'memory';
  score: number;
  maxScore: number;
  playedAt: string;
  moves?: number; // For memory game - number of moves to complete
}

/**
 * User's game progress including XP, level, badges, and history
 */
export interface GameProgress {
  odisea2xp: number;
  level: number;
  badges: Badge[];
  gamesPlayed: GameRecord[];
}

/**
 * Abstract storage adapter interface.
 * Implementations can use localStorage, Supabase, Firebase, etc.
 */
export interface StorageAdapter {
  // Profile operations
  getProfile(): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<void>;

  // Progress operations
  getProgress(): Promise<GameProgress>;
  saveProgress(progress: GameProgress): Promise<void>;

  // Combined convenience methods
  addXP(amount: number): Promise<GameProgress>;
  unlockBadge(badgeId: BadgeId): Promise<void>;
  recordGame(record: Omit<GameRecord, 'playedAt'>): Promise<void>;
}

/**
 * Get default progress for new users
 * Returns a new object each time to avoid mutation issues
 */
export function getDefaultProgress(): GameProgress {
  return {
    odisea2xp: 0,
    level: 1,
    badges: [],
    gamesPlayed: [],
  };
}

/**
 * Default progress for new users
 * @deprecated Use getDefaultProgress() instead to avoid mutation issues
 */
export const DEFAULT_PROGRESS: GameProgress = {
  odisea2xp: 0,
  level: 1,
  badges: [],
  gamesPlayed: [],
};
