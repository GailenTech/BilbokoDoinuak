// Types
export type {
  UserProfile,
  Badge,
  BadgeId,
  GameRecord,
  GameProgress,
  StorageAdapter,
  AgeRange,
  Gender,
  Barrio,
  DailyMissionsState,
} from './types';

export { DEFAULT_PROGRESS, getDefaultProgress } from './types';

// Missions
export type { Mission, MissionType, DailyMissions, MissionProgressUpdate } from './missions';
export {
  generateDailyMissions,
  createDailyMissionsState,
  getDefaultDailyMissions,
  shouldRegenerateMissions,
  isMissionCompleted,
  isMissionClaimed,
  getMissionProgressPercent,
  calculateMissionProgress,
  getTodayDate,
} from './missions';

// Adapters
export { LocalStorageAdapter } from './LocalStorageAdapter';

// Level System
export {
  LEVELS,
  calculateLevel,
  getLevelInfo,
  getLevelInfoFromXP,
  calculateLevelProgress,
  getXPForNextLevel,
  willLevelUp,
  getLevelUpBadges,
  BADGE_DEFINITIONS,
} from './levelSystem';

// Collections System
export type {
  SoundCategory,
  SoundPointWithCategory,
  CollectionCategory,
  CollectionProgress,
  OverallCollectionProgress,
} from './collections';

export {
  COLLECTION_CATEGORIES,
  getAllSoundPoints,
  getSoundsByCategory,
  getCategoryProgress,
  getCollectionProgress,
  isSoundUnlocked,
  getSoundById,
} from './collections';
