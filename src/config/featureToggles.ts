/**
 * Feature toggles for games and features
 * Set to true to enable, false to show as "Coming soon"
 */
export const FEATURE_TOGGLES = {
  games: {
    quiz: true,           // Quiz Sonoro - Implemented
    memory: true,         // Memory Sonoro - Implemented
    missions: false,      // Misiones Diarias - TODO
    collections: false,   // Colecciones - TODO
    profile: false,       // Perfil & Chapas - TODO
    challenge: false,     // 1 vs 1 - TODO
    ranking: false,       // Ranking - TODO
  },
  features: {
    coins: false,         // Sistema de monedas - TODO
    streaks: false,       // Sistema de rachas - TODO
    dailyRewards: false,  // Recompensas diarias - TODO
  },
} as const;

export type GameId = keyof typeof FEATURE_TOGGLES.games;
export type FeatureId = keyof typeof FEATURE_TOGGLES.features;

/**
 * Check if a game is enabled
 */
export function isGameEnabled(gameId: GameId): boolean {
  return FEATURE_TOGGLES.games[gameId] ?? false;
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(featureId: FeatureId): boolean {
  return FEATURE_TOGGLES.features[featureId] ?? false;
}

/**
 * Get all enabled games
 */
export function getEnabledGames(): GameId[] {
  return (Object.keys(FEATURE_TOGGLES.games) as GameId[])
    .filter(gameId => FEATURE_TOGGLES.games[gameId]);
}

/**
 * Get all disabled games (for "Coming soon" display)
 */
export function getDisabledGames(): GameId[] {
  return (Object.keys(FEATURE_TOGGLES.games) as GameId[])
    .filter(gameId => !FEATURE_TOGGLES.games[gameId]);
}
