import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Navigation,
  Volume2,
  Play,
  LocateFixed,
  CheckCircle2,
  ArrowLeft,
  Map
} from 'lucide-react';
import soundPointsData from '../data/soundPoints.json';
import routesData from '../data/routes.json';

interface SoundPoint {
  id: string;
  title_es: string;
  title_eu: string;
  description_es: string;
  description_eu: string;
  latitude: number;
  longitude: number;
  audio_url: string;
  youtube_id: string;
  image_url: string;
  routes: string[];
}

interface RouteData {
  id: string;
  name_es: string;
  name_eu: string;
  description_es: string;
  description_eu: string;
  color: string;
  geometry: [number, number][];
  approachSegments: { from: [number, number]; to: [number, number] }[];
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculate bearing between two coordinates
 */
function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);

  return ((θ * 180) / Math.PI + 360) % 360;
}

/**
 * Find the index of the closest point on the route geometry to a given coordinate
 */
function findClosestGeometryIndex(coord: [number, number], geometry: [number, number][]): number {
  let minDist = Infinity;
  let minIndex = 0;

  geometry.forEach((point, index) => {
    const dist = calculateDistance(coord[0], coord[1], point[0], point[1]);
    if (dist < minDist) {
      minDist = dist;
      minIndex = index;
    }
  });

  return minIndex;
}

/**
 * Order points along the route based on their approachSegment connections
 */
function orderPointsAlongRoute(points: SoundPoint[], route: RouteData): SoundPoint[] {
  // Map each point to its position along the route geometry
  const pointsWithOrder = points.map(point => {
    // Find the approachSegment for this point
    const segment = route.approachSegments.find(seg => {
      const dist = calculateDistance(
        point.latitude,
        point.longitude,
        seg.from[0],
        seg.from[1]
      );
      return dist < 50; // Within 50 meters
    });

    if (segment) {
      // Use the "to" coordinate (where it connects to route) for ordering
      const geometryIndex = findClosestGeometryIndex(segment.to, route.geometry);
      return { point, order: geometryIndex };
    }

    // Fallback: use the point's own coordinates
    const geometryIndex = findClosestGeometryIndex(
      [point.latitude, point.longitude],
      route.geometry
    );
    return { point, order: geometryIndex };
  });

  // Sort by order along the geometry
  pointsWithOrder.sort((a, b) => a.order - b.order);

  return pointsWithOrder.map(p => p.point);
}

export function RouteGuidePage() {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Find the route data
  const route = routesData.find(r => r.id === routeId) as RouteData | undefined;

  // Get and order points for this route
  const allPoints = soundPointsData as SoundPoint[];
  const routePoints = route
    ? orderPointsAlongRoute(
        allPoints.filter(p => p.routes.includes(route.id)),
        route
      )
    : [];

  const currentPoint = routePoints[currentIndex];
  const totalPoints = routePoints.length;

  // Calculate distance and bearing to current point
  const distanceToPoint = userLocation && currentPoint
    ? calculateDistance(
        userLocation[0],
        userLocation[1],
        currentPoint.latitude,
        currentPoint.longitude
      )
    : null;

  const bearingToPoint = userLocation && currentPoint
    ? calculateBearing(
        userLocation[0],
        userLocation[1],
        currentPoint.latitude,
        currentPoint.longitude
      )
    : null;

  // Start watching location
  const startLocationWatch = useCallback(() => {
    if (!navigator.geolocation) return;

    setIsLocating(true);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    setWatchId(id);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Reset audio when changing points
  useEffect(() => {
    setIsAudioPlaying(false);
    setShowVideo(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [currentIndex]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalPoints - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  // Format distance
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} ${t('guide.meters')}`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  if (!route || routePoints.length === 0) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Ruta no encontrada</p>
          <Link to="/routes" className="text-blue-600 hover:underline">
            {t('guide.backToRoutes')}
          </Link>
        </div>
      </main>
    );
  }

  // Completion screen
  if (isCompleted) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${route.color}20` }}
          >
            <CheckCircle2 className="w-10 h-10" style={{ color: route.color }} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('guide.routeCompleted')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('guide.congratulations')}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setIsCompleted(false)}
              className="px-6 py-3 rounded-lg font-medium text-white transition-colors"
              style={{ backgroundColor: route.color }}
            >
              Revisar puntos
            </button>
            <Link
              to="/routes"
              className="px-6 py-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {t('guide.backToRoutes')}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gray-100 flex flex-col">
      {/* Header */}
      <div
        className="text-white px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: route.color }}
      >
        <button
          onClick={() => navigate('/routes')}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold truncate">
            {language === 'es' ? route.name_es : route.name_eu}
          </h1>
          <p className="text-sm opacity-80">
            {t('guide.point')} {currentIndex + 1} {t('guide.of')} {totalPoints}
          </p>
        </div>
        <Link
          to={`/map?route=${route.id}`}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          title={t('guide.viewOnMap')}
        >
          <Map className="w-5 h-5" />
        </Link>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-300">
        <div
          className="h-full transition-all duration-300"
          style={{
            backgroundColor: route.color,
            width: `${((currentIndex + 1) / totalPoints) * 100}%`
          }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Point image */}
        <div className="relative aspect-video bg-gray-200">
          <img
            src={currentPoint.image_url}
            alt={language === 'es' ? currentPoint.title_es : currentPoint.title_eu}
            className="w-full h-full object-cover"
          />

          {/* Distance overlay */}
          {distanceToPoint !== null && (
            <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg flex items-center gap-2">
              <Navigation
                className="w-5 h-5 transition-transform"
                style={{ transform: `rotate(${bearingToPoint || 0}deg)` }}
              />
              <span className="font-medium">
                {distanceToPoint < 30
                  ? t('guide.arrived')
                  : formatDistance(distanceToPoint)
                }
              </span>
            </div>
          )}

          {/* Point number badge */}
          <div
            className="absolute bottom-4 left-4 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
            style={{ backgroundColor: route.color }}
          >
            {currentIndex + 1}
          </div>
        </div>

        {/* Point info */}
        <div className="p-4 bg-white">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {language === 'es' ? currentPoint.title_es : currentPoint.title_eu}
          </h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            {language === 'es' ? currentPoint.description_es : currentPoint.description_eu}
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Location button */}
            {!userLocation && (
              <button
                onClick={startLocationWatch}
                disabled={isLocating}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <LocateFixed className={`w-5 h-5 ${isLocating ? 'animate-pulse' : ''}`} />
                <span>{t('guide.enableLocation')}</span>
              </button>
            )}

            {/* Audio button */}
            {currentPoint.audio_url && (
              <button
                onClick={toggleAudio}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isAudioPlaying
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Volume2 className="w-5 h-5" />
                <span>{t('guide.playAudio')}</span>
              </button>
            )}

            {/* Video button */}
            {currentPoint.youtube_id && (
              <button
                onClick={() => setShowVideo(!showVideo)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showVideo
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Play className="w-5 h-5" />
                <span>{t('guide.watchVideo')}</span>
              </button>
            )}

            {/* Open in Maps */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${currentPoint.latitude},${currentPoint.longitude}&travelmode=walking`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <MapPin className="w-5 h-5" />
              <span>Google Maps</span>
            </a>
          </div>

          {/* YouTube video embed */}
          {showVideo && currentPoint.youtube_id && (
            <div className="mt-4 aspect-video rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${currentPoint.youtube_id}?rel=0&modestbranding=1`}
                title={language === 'es' ? currentPoint.title_es : currentPoint.title_eu}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Hidden audio element */}
          {currentPoint.audio_url && (
            <audio
              ref={audioRef}
              src={currentPoint.audio_url}
              onEnded={() => setIsAudioPlaying(false)}
            />
          )}
        </div>
      </div>

      {/* Navigation footer */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 px-4 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">{t('guide.prev')}</span>
        </button>

        {/* Progress dots */}
        <div className="flex-1 flex justify-center gap-1.5 overflow-x-auto py-1">
          {routePoints.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all flex-shrink-0 ${
                index === currentIndex
                  ? 'w-6'
                  : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: index <= currentIndex ? route.color : '#d1d5db'
              }}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="flex items-center gap-1 px-4 py-3 rounded-lg text-white transition-colors"
          style={{ backgroundColor: route.color }}
        >
          <span className="hidden sm:inline">
            {currentIndex === totalPoints - 1 ? t('guide.finish') : t('guide.next')}
          </span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </main>
  );
}
