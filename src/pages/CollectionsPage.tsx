import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { usePersistence } from '../context/PersistenceContext';
import {
  ArrowLeft,
  Building2,
  TreePine,
  Users,
  Car,
  Bird,
  Lock,
  ChevronDown,
  ChevronUp,
  Volume2,
  HelpCircle,
} from 'lucide-react';
import {
  getCollectionProgress,
  isSoundUnlocked,
  type SoundCategory,
  type CollectionProgress,
  type SoundPointWithCategory,
} from '../lib/persistence';

// Map category id to Lucide icon component
const categoryIcons: Record<SoundCategory, React.ElementType> = {
  urban: Building2,
  nature: TreePine,
  people: Users,
  traffic: Car,
  animals: Bird,
};

// Map category id to color classes
const categoryColors: Record<SoundCategory, { bg: string; text: string; progress: string; border: string }> = {
  urban: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    progress: 'bg-amber-500',
    border: 'border-amber-200',
  },
  nature: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    progress: 'bg-green-500',
    border: 'border-green-200',
  },
  people: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    progress: 'bg-blue-500',
    border: 'border-blue-200',
  },
  traffic: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    progress: 'bg-red-500',
    border: 'border-red-200',
  },
  animals: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    progress: 'bg-purple-500',
    border: 'border-purple-200',
  },
};

interface CategoryCardProps {
  categoryProgress: CollectionProgress;
  unlockedSoundIds: string[];
  language: 'es' | 'eu';
  isExpanded: boolean;
  onToggle: () => void;
}

function CategoryCard({
  categoryProgress,
  unlockedSoundIds,
  language,
  isExpanded,
  onToggle,
}: CategoryCardProps) {
  const { category, total, unlocked, percentage, sounds } = categoryProgress;
  const Icon = categoryIcons[category.id];
  const colors = categoryColors[category.id];

  return (
    <div className={`bg-white rounded-xl border ${colors.border} shadow-sm overflow-hidden`}>
      {/* Category header - clickable */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center shrink-0`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900">
              {language === 'es' ? category.name_es : category.name_eu}
            </h3>
            <span className={`text-sm font-medium ${colors.text}`}>
              {unlocked}/{total}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.progress} transition-all duration-500`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <div className="shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded content - sounds grid */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4">
          {sounds.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              {language === 'es'
                ? 'No hay sonidos en esta categoria todavia'
                : 'Ez dago soinurik kategoria honetan oraindik'}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {sounds.map((sound) => (
                <SoundCard
                  key={sound.id}
                  sound={sound}
                  isUnlocked={isSoundUnlocked(sound.id, unlockedSoundIds)}
                  language={language}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface SoundCardProps {
  sound: SoundPointWithCategory;
  isUnlocked: boolean;
  language: 'es' | 'eu';
}

function SoundCard({ sound, isUnlocked, language }: SoundCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = () => {
    if (!isUnlocked || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const title = language === 'es' ? sound.title_es : sound.title_eu;

  if (!isUnlocked) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center p-2 relative">
        <div className="absolute inset-0 bg-gray-200 rounded-lg opacity-50" />
        <HelpCircle className="w-8 h-8 text-gray-400 mb-1" />
        <Lock className="w-4 h-4 text-gray-400 absolute top-2 right-2" />
      </div>
    );
  }

  return (
    <button
      onClick={playAudio}
      className="aspect-square rounded-lg overflow-hidden relative group"
    >
      <img
        src={sound.image_url}
        alt={title}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/assets/images/placeholder.jpg';
        }}
      />
      {/* Overlay on hover/playing */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity ${
          isPlaying ? 'bg-black/40 opacity-100' : 'bg-black/40 opacity-0 group-hover:opacity-100'
        }`}
      >
        <Volume2
          className={`w-8 h-8 text-white ${isPlaying ? 'animate-pulse' : ''}`}
        />
      </div>
      {/* Title at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
        <p className="text-white text-xs font-medium truncate">{title}</p>
      </div>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={sound.audio_url}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
      />
    </button>
  );
}

export function CollectionsPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { progress } = usePersistence();

  const [expandedCategory, setExpandedCategory] = useState<SoundCategory | null>(null);

  const unlockedSoundIds = progress.unlockedSounds || [];
  const collectionProgress = getCollectionProgress(unlockedSoundIds);

  const toggleCategory = (categoryId: SoundCategory) => {
    setExpandedCategory(current => (current === categoryId ? null : categoryId));
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/games')}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'es' ? 'Colecciones' : 'Bildumak'}
            </h1>
            <p className="text-gray-500 text-sm">
              {language === 'es'
                ? 'Desbloquea sonidos jugando al Quiz y Memory'
                : 'Desblokeatu soinuak Quiz eta Memory jokatuz'}
            </p>
          </div>
        </div>

        {/* Overall progress card */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl shadow-lg p-6 mb-6 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute -right-8 top-8 w-16 h-16 bg-white/10 rounded-full" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">
                {language === 'es' ? 'Progreso total' : 'Aurrerapen osoa'}
              </h2>
              <span className="text-white/90 font-medium">
                {collectionProgress.totalUnlocked}/{collectionProgress.totalSounds}
              </span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${collectionProgress.percentage}%` }}
              />
            </div>
            <p className="text-white/70 text-sm mt-2">
              {collectionProgress.percentage}%{' '}
              {language === 'es' ? 'completado' : 'osatuta'}
            </p>
          </div>
        </div>

        {/* Categories list */}
        <div className="space-y-3">
          {collectionProgress.categories.map((catProgress) => (
            <CategoryCard
              key={catProgress.category.id}
              categoryProgress={catProgress}
              unlockedSoundIds={unlockedSoundIds}
              language={language}
              isExpanded={expandedCategory === catProgress.category.id}
              onToggle={() => toggleCategory(catProgress.category.id)}
            />
          ))}
        </div>

        {/* Info message */}
        <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
          <p className="text-sm text-purple-700 text-center">
            {language === 'es'
              ? 'Juega al Quiz y Memory para desbloquear sonidos de cada categoria!'
              : 'Jokatu Quiz eta Memory kategoria bakoitzeko soinuak desblokeatzeko!'}
          </p>
        </div>
      </div>
    </main>
  );
}
