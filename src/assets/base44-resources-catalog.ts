/**
 * Catalog of resources extracted from Base44 Bilboko Doinuak application
 * Source: https://bilboko-doinuak-san-inazio-sounds-280751de.base44.app
 *
 * This catalog maps original Base44 URLs to local asset paths
 */

export interface ResourceEntry {
  originalUrl: string;
  localPath: string;
  description: string;
  category: 'branding' | 'sound-point-image' | 'sound-audio' | 'icon';
}

// Base URL for Supabase storage used by Base44
const SUPABASE_BASE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6936cdc7a410f6ff280751de';

// Base44 files API (kept for reference)
// const BASE44_FILES_API = 'https://base44.app/api/apps/6936cdc7a410f6ff280751de/files/public/6936cdc7a410f6ff280751de';

/**
 * Branding resources - logos and identity images
 */
export const brandingResources: ResourceEntry[] = [
  {
    originalUrl: `${SUPABASE_BASE}/30fb81129_Bilbaoaytologo.png`,
    localPath: '@/assets/images/branding/bilbao-ayto-logo.png',
    description: 'Ayuntamiento de Bilbao official logo',
    category: 'branding'
  },
  {
    originalUrl: `${SUPABASE_BASE}/06ad80907_Bilbokodoinuaklowres.jpg`,
    localPath: '@/assets/images/branding/bilboko-doinuak-lowres.jpg',
    description: 'Bilboko Doinuak San Inazio project header image',
    category: 'branding'
  },
  {
    originalUrl: `${SUPABASE_BASE}/3a0c01149_logo.png`,
    localPath: '@/assets/images/branding/logo.png',
    description: 'Main project logo',
    category: 'branding'
  }
];

/**
 * Sound point images - photos of locations
 */
export const soundPointImages: ResourceEntry[] = [
  {
    originalUrl: `${SUPABASE_BASE}/1222dd801_deusto-arraun-taldea.jpg`,
    localPath: '@/assets/images/games/deusto-arraun-taldea.jpg',
    description: 'Deusto rowing club (Deusto Arraun Taldea)',
    category: 'sound-point-image'
  },
  {
    originalUrl: `${SUPABASE_BASE}/0af94353a_G4micOhXAAIIwEH.jpg`,
    localPath: '@/assets/images/games/G4micOhXAAIIwEH.jpg',
    description: 'Sound point location image',
    category: 'sound-point-image'
  },
  {
    originalUrl: `${SUPABASE_BASE}/6d366976b_15212699master.jpeg`,
    localPath: '@/assets/images/games/15212699master.jpeg',
    description: 'Sound point location image',
    category: 'sound-point-image'
  },
  {
    originalUrl: `${SUPABASE_BASE}/f9d275808_2.jpg`,
    localPath: '@/assets/images/games/sound-point-2.jpg',
    description: 'Sound point location image',
    category: 'sound-point-image'
  },
  {
    originalUrl: `${SUPABASE_BASE}/26b5c7778_810e52fc-a3b4-43d7-996e-e4c5582f284d_16-9-aspect-ratio_default_0.jpg`,
    localPath: '@/assets/images/games/conservatorio.jpg',
    description: 'Plaza de Ibarrekolanda - Conservatorio Juan Crisostomo de Arriaga',
    category: 'sound-point-image'
  },
  {
    originalUrl: `${SUPABASE_BASE}/5889355fc_bPASEOELCANAL5739.jpg`,
    localPath: '@/assets/images/games/paseo-canal.jpg',
    description: 'Paseo del Canal',
    category: 'sound-point-image'
  },
  {
    originalUrl: `${SUPABASE_BASE}/1133836d0_a6401d64-b157-4300-8e69-05edc9c29cfc_16-9-aspect-ratio_default_0.jpg`,
    localPath: '@/assets/images/games/jardines-sta-maria.jpg',
    description: 'Jardines Santa Maria Josefa Sancho',
    category: 'sound-point-image'
  }
];

/**
 * Sound audio files - MP3 recordings
 */
export const soundAudioFiles: ResourceEntry[] = [
  {
    originalUrl: `${SUPABASE_BASE}/bd689f9b8_AvZarandoayPuentedeSanIgnacio6Epq1fJDXxg.mp3`,
    localPath: '@/assets/sounds/av-zarandoa-puente-san-ignacio.mp3',
    description: 'Av. Zarandoa y Puente de San Ignacio - ambient sound',
    category: 'sound-audio'
  },
  {
    originalUrl: `${SUPABASE_BASE}/1a6a2987f_CaminoIbarrekolandaeI5zAxTgtJw.mp3`,
    localPath: '@/assets/sounds/camino-ibarrekolanda.mp3',
    description: 'Camino Ibarrekolanda - ambient sound',
    category: 'sound-audio'
  },
  {
    originalUrl: `${SUPABASE_BASE}/7a1b1de66_Ria.mp3`,
    localPath: '@/assets/sounds/ria.mp3',
    description: 'Ria de Bilbao - water and ambient sounds near rowing club',
    category: 'sound-audio'
  }
];

/**
 * YouTube video IDs used in the application
 */
export const youtubeVideos = [
  {
    videoId: 'eI5zAxTgtJw',
    title: 'Camino Ibarrekolanda',
    embedUrl: 'https://www.youtube.com/embed/eI5zAxTgtJw',
    description: 'Video of Camino Ibarrekolanda soundscape'
  },
  {
    videoId: '223iMpkwRsU',
    title: 'Ria',
    embedUrl: 'https://www.youtube.com/embed/223iMpkwRsU',
    description: 'Video of Ria de Bilbao soundscape near rowing club'
  }
];

/**
 * External APIs used by Base44 application
 */
export const externalApis = {
  dicebearAvatars: {
    baseUrl: 'https://api.dicebear.com/7.x/avataaars/svg',
    description: 'Used for generating user avatars',
    example: 'https://api.dicebear.com/7.x/avataaars/svg?seed=username'
  },
  youtubeChannel: {
    channelId: 'UCbuZtOUifuSWLpdJOZNNuEw',
    name: 'Bilboko Doinuak',
    url: 'https://www.youtube.com/channel/UCbuZtOUifuSWLpdJOZNNuEw'
  }
};

/**
 * Badge definitions (using emojis, not images)
 */
export const badges = [
  { emoji: '🌱', name: 'Novato', description: 'Juega tu primera partida' },
  { emoji: '👂', name: 'Oido Fino', description: 'Consigue 1000 puntos en una partida' },
  { emoji: '🔥', name: 'Racha 5', description: 'Consigue una racha de 5' },
  { emoji: '🎖️', name: 'Veterano', description: 'Juega 50 partidas' }
];

/**
 * Collection categories
 */
export const collectionCategories = [
  { name: 'Urban', count: 6, color: '#718096' },
  { name: 'Nature', count: 9, color: '#48BB78' },
  { name: 'People', count: 3, color: '#ED8936' },
  { name: 'Traffic', count: 4, color: '#E53E3E' },
  { name: 'Animals', count: 2, color: '#805AD5' }
];

/**
 * All resources combined
 */
export const allResources: ResourceEntry[] = [
  ...brandingResources,
  ...soundPointImages,
  ...soundAudioFiles
];

/**
 * Helper to get resource by local path
 */
export function getResourceByLocalPath(localPath: string): ResourceEntry | undefined {
  return allResources.find(r => r.localPath === localPath);
}

/**
 * Helper to get resources by category
 */
export function getResourcesByCategory(category: ResourceEntry['category']): ResourceEntry[] {
  return allResources.filter(r => r.category === category);
}

export default {
  brandingResources,
  soundPointImages,
  soundAudioFiles,
  youtubeVideos,
  externalApis,
  badges,
  collectionCategories,
  allResources,
  getResourceByLocalPath,
  getResourcesByCategory
};
