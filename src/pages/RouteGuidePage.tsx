import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Tooltip } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  Pause,
  Play,
  Image,
  Video,
  CheckCircle2,
  ArrowLeft,
  Map as MapIcon,
  X,
  LocateFixed
} from 'lucide-react';
import soundPointsData from '../data/soundPoints.json';
import routesData from '../data/routes.json';
import 'leaflet/dist/leaflet.css';

// Custom marker icon for current point (large, highlighted)
const createCurrentPointIcon = (color: string) => new DivIcon({
  className: 'current-point-marker',
  html: `<div style="
    width: 32px;
    height: 32px;
    background-color: ${color};
    border: 4px solid white;
    border-radius: 50%;
    box-shadow: 0 3px 8px rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  "><div style="
    width: 10px;
    height: 10px;
    background-color: white;
    border-radius: 50%;
  "></div></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Start point icon (flag style)
const createStartIcon = () => new DivIcon({
  className: 'start-point-marker',
  html: `<div style="
    width: 28px;
    height: 28px;
    background-color: #22c55e;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: white;
    font-weight: bold;
  ">1</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// End point icon
const createEndIcon = (totalPoints: number) => new DivIcon({
  className: 'end-point-marker',
  html: `<div style="
    width: 28px;
    height: 28px;
    background-color: #ef4444;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: white;
    font-weight: bold;
  ">${totalPoints}</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Intermediate point icon (smaller)
const createIntermediateIcon = (index: number, visited: boolean) => new DivIcon({
  className: 'intermediate-point-marker',
  html: `<div style="
    width: 20px;
    height: 20px;
    background-color: ${visited ? '#6b7280' : '#9ca3af'};
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: white;
    font-weight: bold;
  ">${index + 1}</div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Custom icon for user location
const userLocationIcon = new DivIcon({
  className: 'user-location-marker',
  html: `<div style="
    width: 18px;
    height: 18px;
    background-color: #3b82f6;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0,0,0,0.4);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Component to fit map to bounds on initial load
function MapBoundsController({ routeGeometry, currentPoint }: {
  routeGeometry: [number, number][];
  currentPoint: { latitude: number; longitude: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (routeGeometry.length > 0) {
      // Calculate bounds that include route and current point
      const allPoints = [...routeGeometry];
      if (currentPoint) {
        allPoints.push([currentPoint.latitude, currentPoint.longitude]);
      }

      const lats = allPoints.map(p => p[0]);
      const lngs = allPoints.map(p => p[1]);

      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)]
      ];

      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [map, routeGeometry, currentPoint]);

  return null;
}

// Component to center map on current point when triggered
function MapCenterOnPoint({ targetLocation, onComplete }: {
  targetLocation: [number, number] | null;
  onComplete: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (targetLocation) {
      map.flyTo(targetLocation, 17, { duration: 0.8 });
      onComplete();
    }
  }, [map, targetLocation, onComplete]);

  return null;
}

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

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

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

function orderPointsAlongRoute(points: SoundPoint[], route: RouteData): SoundPoint[] {
  const pointsWithOrder = points.map(point => {
    const segment = route.approachSegments.find(seg => {
      const dist = calculateDistance(
        point.latitude,
        point.longitude,
        seg.from[0],
        seg.from[1]
      );
      return dist < 50;
    });

    if (segment) {
      const geometryIndex = findClosestGeometryIndex(segment.to, route.geometry);
      return { point, order: geometryIndex };
    }

    const geometryIndex = findClosestGeometryIndex(
      [point.latitude, point.longitude],
      route.geometry
    );
    return { point, order: geometryIndex };
  });

  pointsWithOrder.sort((a, b) => a.order - b.order);
  return pointsWithOrder.map(p => p.point);
}

export function RouteGuidePage() {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [mediaIndex, setMediaIndex] = useState(0); // 0 = image, 1 = video
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [centerTarget, setCenterTarget] = useState<[number, number] | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Swipe threshold (percentage of container width)
  const swipeThreshold = 0.25;

  const route = routesData.find(r => r.id === routeId) as RouteData | undefined;

  const allPoints = soundPointsData as SoundPoint[];
  const routePoints = route
    ? orderPointsAlongRoute(
        allPoints.filter(p => p.routes.includes(route.id)),
        route
      )
    : [];

  const currentPoint = routePoints[currentIndex];
  const totalPoints = routePoints.length;
  const hasVideo = currentPoint?.youtube_id;

  // Start location watching when map is shown
  const startLocationWatch = useCallback(() => {
    if (!navigator.geolocation || watchId !== null) return;

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        // Silently fail if location not available
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    setWatchId(id);
  }, [watchId]);

  // Start location watch when map is shown
  useEffect(() => {
    if (showMap) {
      startLocationWatch();
    }
  }, [showMap, startLocationWatch]);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  useEffect(() => {
    setIsAudioPlaying(false);
    setMediaIndex(0);
    setAudioProgress(0);
    setAudioDuration(0);
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

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioProgress(audioRef.current.currentTime);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleAudioSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setAudioProgress(time);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Swipe handlers for gallery-style navigation with animation
  const onTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    touchStartX.current = e.targetTouches[0].clientX;
    setIsSwiping(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || touchStartX.current === null || isAnimating) return;

    const currentX = e.targetTouches[0].clientX;
    const diff = currentX - touchStartX.current;

    // Limit swipe at boundaries
    if ((currentIndex === 0 && diff > 0) || (currentIndex === totalPoints - 1 && diff < 0)) {
      setSwipeOffset(diff * 0.3); // Resistance at boundaries
    } else {
      setSwipeOffset(diff);
    }
  };

  const onTouchEnd = () => {
    if (!isSwiping || isAnimating) return;

    const containerWidth = containerRef.current?.offsetWidth || 300;
    const threshold = containerWidth * swipeThreshold;

    setIsSwiping(false);
    setIsAnimating(true);

    if (swipeOffset < -threshold && currentIndex < totalPoints - 1) {
      // Swipe left = next point - animate to -100%
      setSwipeOffset(-containerWidth);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setSwipeOffset(0);
        setIsAnimating(false);
      }, 300);
    } else if (swipeOffset > threshold && currentIndex > 0) {
      // Swipe right = previous point - animate to +100%
      setSwipeOffset(containerWidth);
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setSwipeOffset(0);
        setIsAnimating(false);
      }, 300);
    } else {
      // Snap back
      setSwipeOffset(0);
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }

    touchStartX.current = null;
  };

  // Get point data for a given index (with bounds checking)
  const getPointAt = (index: number) => {
    if (index < 0 || index >= routePoints.length) return null;
    return routePoints[index];
  };

  const prevPoint = getPointAt(currentIndex - 1);
  const nextPoint = getPointAt(currentIndex + 1);

  // Get marker icon for a point based on its position
  const getMarkerIcon = (index: number) => {
    if (index === currentIndex) {
      return createCurrentPointIcon(route!.color);
    } else if (index === 0) {
      return createStartIcon();
    } else if (index === totalPoints - 1) {
      return createEndIcon(totalPoints);
    } else {
      return createIntermediateIcon(index, index < currentIndex);
    }
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
    <main className="min-h-[calc(100vh-64px)] bg-white flex flex-col">
      {/* Header */}
      <div
        className="text-white px-4 py-3 flex items-center gap-3 shrink-0"
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
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-200 shrink-0">
        <div
          className="h-full transition-all duration-300"
          style={{
            backgroundColor: route.color,
            width: `${((currentIndex + 1) / totalPoints) * 100}%`
          }}
        />
      </div>

      {/* Media slider (image + video) - with swipe support */}
      <div
        ref={containerRef}
        className="relative aspect-[4/3] bg-gray-900 shrink-0 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Carousel track with 3 slides */}
        <div
          className="flex h-full"
          style={{
            transform: `translateX(calc(-100% + ${swipeOffset}px))`,
            transition: isAnimating && !isSwiping ? 'transform 0.3s ease-out' : 'none',
            width: '300%',
          }}
        >
          {/* Previous slide */}
          <div className="w-1/3 h-full flex-shrink-0 bg-gray-900">
            {prevPoint && (
              <img
                src={prevPoint.image_url}
                alt={language === 'es' ? prevPoint.title_es : prevPoint.title_eu}
                className="w-full h-full object-cover select-none opacity-50"
                draggable={false}
              />
            )}
          </div>

          {/* Current slide */}
          <div className="w-1/3 h-full flex-shrink-0 relative">
            {mediaIndex === 0 ? (
              <img
                src={currentPoint.image_url}
                alt={language === 'es' ? currentPoint.title_es : currentPoint.title_eu}
                className="w-full h-full object-cover select-none"
                draggable={false}
              />
            ) : hasVideo ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${currentPoint.youtube_id}?rel=0&modestbranding=1`}
                title={language === 'es' ? currentPoint.title_es : currentPoint.title_eu}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0"
              />
            ) : (
              <img
                src={currentPoint.image_url}
                alt={language === 'es' ? currentPoint.title_es : currentPoint.title_eu}
                className="w-full h-full object-cover select-none"
                draggable={false}
              />
            )}
          </div>

          {/* Next slide */}
          <div className="w-1/3 h-full flex-shrink-0 bg-gray-900">
            {nextPoint && (
              <img
                src={nextPoint.image_url}
                alt={language === 'es' ? nextPoint.title_es : nextPoint.title_eu}
                className="w-full h-full object-cover select-none opacity-50"
                draggable={false}
              />
            )}
          </div>
        </div>

        {/* Floating controls overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Bottom row: Point number + Media toggle */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end pointer-events-auto">
            {/* Point number badge */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
              style={{ backgroundColor: route.color }}
            >
              {currentIndex + 1}
            </div>

            {/* Media toggle (image/video) */}
            {hasVideo && (
              <div className="flex gap-1 bg-black/60 rounded-full p-1">
                <button
                  onClick={() => setMediaIndex(0)}
                  className={`p-1.5 rounded-full transition-colors ${
                    mediaIndex === 0 ? 'bg-white text-gray-900' : 'text-white hover:bg-white/20'
                  }`}
                  title="Imagen"
                >
                  <Image className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setMediaIndex(1)}
                  className={`p-1.5 rounded-full transition-colors ${
                    mediaIndex === 1 ? 'bg-white text-gray-900' : 'text-white hover:bg-white/20'
                  }`}
                  title="Video"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audio Player - below media */}
      {currentPoint.audio_url && (
        <div className="bg-gray-100 px-4 py-3 flex items-center gap-3 shrink-0">
          <button
            onClick={toggleAudio}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors shrink-0"
            style={{ backgroundColor: route.color }}
          >
            {isAudioPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <div className="flex-1 flex flex-col gap-1">
            <input
              type="range"
              min="0"
              max={audioDuration || 100}
              value={audioProgress}
              onChange={handleAudioSeek}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              style={{
                accentColor: route.color
              }}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatTime(audioProgress)}</span>
              <span>{formatTime(audioDuration)}</span>
            </div>
          </div>
          <Volume2 className="w-5 h-5 text-gray-400 shrink-0" />
        </div>
      )}

      {/* Point info */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex items-start gap-2 mb-2">
          <h2 className="text-xl font-bold text-gray-900 flex-1">
            {language === 'es' ? currentPoint.title_es : currentPoint.title_eu}
          </h2>
          <button
            onClick={() => setShowMap(true)}
            className="p-2 rounded-lg transition-colors shrink-0"
            style={{ backgroundColor: `${route.color}15`, color: route.color }}
            title={t('guide.viewOnMap')}
          >
            <MapIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600 leading-relaxed">
          {language === 'es' ? currentPoint.description_es : currentPoint.description_eu}
        </p>
      </div>

      {/* Hidden audio element */}
      {currentPoint.audio_url && (
        <audio
          ref={audioRef}
          src={currentPoint.audio_url}
          onEnded={() => setIsAudioPlaying(false)}
          onTimeUpdate={handleAudioTimeUpdate}
          onLoadedMetadata={handleAudioLoadedMetadata}
        />
      )}

      {/* Fullscreen Map Modal */}
      {showMap && route.geometry && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Map header */}
          <div
            className="px-4 py-3 flex items-center justify-between text-white shrink-0"
            style={{ backgroundColor: route.color }}
          >
            <div className="flex-1 min-w-0">
              <span className="font-medium block truncate">
                {language === 'es' ? currentPoint.title_es : currentPoint.title_eu}
              </span>
              <span className="text-sm opacity-80">
                {t('guide.point')} {currentIndex + 1} {t('guide.of')} {totalPoints}
              </span>
            </div>
            <button
              onClick={() => setShowMap(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors ml-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Fullscreen Map container */}
          <div className="flex-1 relative">
            <MapContainer
              center={[currentPoint.latitude, currentPoint.longitude]}
              zoom={16}
              className="h-full w-full"
              zoomControl={true}
            >
              <MapBoundsController
                routeGeometry={route.geometry}
                currentPoint={currentPoint}
              />
              <MapCenterOnPoint
                targetLocation={centerTarget}
                onComplete={() => setCenterTarget(null)}
              />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* Route line */}
              <Polyline
                positions={route.geometry}
                pathOptions={{
                  color: route.color,
                  weight: 4,
                  opacity: 0.8,
                  dashArray: '10, 10',
                }}
              />
              {/* All route point markers with tooltips */}
              {routePoints.map((point, index) => (
                <Marker
                  key={point.id}
                  position={[point.latitude, point.longitude]}
                  icon={getMarkerIcon(index)}
                  zIndexOffset={index === currentIndex ? 1000 : 0}
                >
                  <Tooltip direction="top" offset={[0, -12]} opacity={0.9}>
                    <span className="font-medium text-sm">
                      {index + 1}. {language === 'es' ? point.title_es : point.title_eu}
                    </span>
                  </Tooltip>
                </Marker>
              ))}
              {/* User location marker */}
              {userLocation && (
                <Marker position={userLocation} icon={userLocationIcon} zIndexOffset={500} />
              )}
            </MapContainer>

            {/* Center on user location button */}
            <button
              onClick={() => {
                if (userLocation) {
                  setCenterTarget(userLocation);
                } else {
                  // Request location if not available
                  startLocationWatch();
                }
              }}
              className={`absolute bottom-24 right-2.5 z-[1000] w-[34px] h-[34px] bg-white rounded-md shadow-md border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors ${
                userLocation ? 'text-blue-600' : 'text-gray-400'
              }`}
              title={language === 'es' ? 'Centrar en mi ubicación' : 'Nire kokapenean zentratu'}
            >
              <LocateFixed size={18} />
            </button>
          </div>

          {/* Map footer */}
          <div className="px-4 py-3 bg-white border-t border-gray-200 shrink-0">
            <button
              onClick={() => setShowMap(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white font-medium transition-colors"
              style={{ backgroundColor: route.color }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{language === 'es' ? 'Volver a la guía' : 'Gidara itzuli'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation footer */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="p-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Progress dots */}
        <div className="flex-1 flex justify-center gap-1.5 overflow-x-auto py-1">
          {routePoints.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all flex-shrink-0 ${
                index === currentIndex ? 'w-6' : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: index <= currentIndex ? route.color : '#d1d5db'
              }}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-3 rounded-lg text-white transition-colors"
          style={{ backgroundColor: route.color }}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </main>
  );
}
