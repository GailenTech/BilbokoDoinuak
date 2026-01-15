/**
 * Sound Collections System
 * Manages categorization and unlock progress for sound points
 */

import soundPointsData from '../../data/soundPoints.json';

/**
 * Sound category identifiers
 */
export type SoundCategory = 'urban' | 'nature' | 'people' | 'traffic' | 'animals';

/**
 * Sound point with category information
 */
export interface SoundPointWithCategory {
  id: string;
  title_es: string;
  title_eu: string;
  description_es: string;
  description_eu: string;
  image_url: string;
  audio_url: string;
  category: SoundCategory;
}

/**
 * Collection category definition
 */
export interface CollectionCategory {
  id: SoundCategory;
  name_es: string;
  name_eu: string;
  description_es: string;
  description_eu: string;
  icon: string; // Lucide icon name
  color: string; // TailwindCSS color class
}

/**
 * Collection progress for a single category
 */
export interface CollectionProgress {
  category: CollectionCategory;
  total: number;
  unlocked: number;
  percentage: number;
  sounds: SoundPointWithCategory[];
}

/**
 * Overall collections progress
 */
export interface OverallCollectionProgress {
  totalSounds: number;
  totalUnlocked: number;
  percentage: number;
  categories: CollectionProgress[];
}

/**
 * Category definitions with metadata
 */
export const COLLECTION_CATEGORIES: CollectionCategory[] = [
  {
    id: 'urban',
    name_es: 'Urbano',
    name_eu: 'Hiria',
    description_es: 'Sonidos urbanos: plazas, fuentes, calles',
    description_eu: 'Hiri-soinuak: plazak, iturriak, kaleak',
    icon: 'Building2',
    color: 'amber',
  },
  {
    id: 'nature',
    name_es: 'Naturaleza',
    name_eu: 'Natura',
    description_es: 'Sonidos de la naturaleza: parques, jardines, ria',
    description_eu: 'Naturaren soinuak: parkeak, lorategiak, itsasadarra',
    icon: 'TreePine',
    color: 'green',
  },
  {
    id: 'people',
    name_es: 'Personas',
    name_eu: 'Jendea',
    description_es: 'Sonidos de actividad humana: deportes, encuentros',
    description_eu: 'Giza jardueraren soinuak: kirolak, topaketak',
    icon: 'Users',
    color: 'blue',
  },
  {
    id: 'traffic',
    name_es: 'Trafico',
    name_eu: 'Trafikoa',
    description_es: 'Sonidos del trafico: coches, autobuses',
    description_eu: 'Trafikoaren soinuak: autoak, autobusak',
    icon: 'Car',
    color: 'red',
  },
  {
    id: 'animals',
    name_es: 'Animales',
    name_eu: 'Animaliak',
    description_es: 'Sonidos de animales: pajaros, perros',
    description_eu: 'Animalia-soinuak: txoriak, txakurrak',
    icon: 'Bird',
    color: 'purple',
  },
];

/**
 * Get all sound points with their category information
 */
export function getAllSoundPoints(): SoundPointWithCategory[] {
  return soundPointsData.map(point => ({
    id: point.id,
    title_es: point.title_es,
    title_eu: point.title_eu,
    description_es: point.description_es,
    description_eu: point.description_eu,
    image_url: point.image_url,
    audio_url: point.audio_url,
    category: (point.category || 'urban') as SoundCategory,
  }));
}

/**
 * Get sounds grouped by category
 */
export function getSoundsByCategory(): Record<SoundCategory, SoundPointWithCategory[]> {
  const sounds = getAllSoundPoints();
  const grouped: Record<SoundCategory, SoundPointWithCategory[]> = {
    urban: [],
    nature: [],
    people: [],
    traffic: [],
    animals: [],
  };

  for (const sound of sounds) {
    if (grouped[sound.category]) {
      grouped[sound.category].push(sound);
    } else {
      // Fallback to urban if category is unknown
      grouped.urban.push(sound);
    }
  }

  return grouped;
}

/**
 * Get collection progress for a specific category
 */
export function getCategoryProgress(
  categoryId: SoundCategory,
  unlockedSoundIds: string[]
): CollectionProgress {
  const category = COLLECTION_CATEGORIES.find(c => c.id === categoryId);
  if (!category) {
    throw new Error(`Unknown category: ${categoryId}`);
  }

  const soundsByCategory = getSoundsByCategory();
  const categorySounds = soundsByCategory[categoryId] || [];
  const unlockedCount = categorySounds.filter(s =>
    unlockedSoundIds.includes(s.id)
  ).length;

  return {
    category,
    total: categorySounds.length,
    unlocked: unlockedCount,
    percentage: categorySounds.length > 0
      ? Math.round((unlockedCount / categorySounds.length) * 100)
      : 0,
    sounds: categorySounds,
  };
}

/**
 * Get overall collection progress across all categories
 */
export function getCollectionProgress(
  unlockedSoundIds: string[]
): OverallCollectionProgress {
  const allSounds = getAllSoundPoints();
  const totalUnlocked = allSounds.filter(s =>
    unlockedSoundIds.includes(s.id)
  ).length;

  const categories = COLLECTION_CATEGORIES.map(category =>
    getCategoryProgress(category.id, unlockedSoundIds)
  );

  return {
    totalSounds: allSounds.length,
    totalUnlocked,
    percentage: allSounds.length > 0
      ? Math.round((totalUnlocked / allSounds.length) * 100)
      : 0,
    categories,
  };
}

/**
 * Check if a sound is unlocked
 */
export function isSoundUnlocked(soundId: string, unlockedSoundIds: string[]): boolean {
  return unlockedSoundIds.includes(soundId);
}

/**
 * Get sound point by ID
 */
export function getSoundById(soundId: string): SoundPointWithCategory | undefined {
  return getAllSoundPoints().find(s => s.id === soundId);
}
