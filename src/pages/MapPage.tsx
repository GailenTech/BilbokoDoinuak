import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon, DivIcon, Marker as LeafletMarker } from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import { Volume2, LocateFixed } from 'lucide-react';
import soundPointsData from '../data/soundPoints.json';
import routesData from '../data/routes.json';
import 'leaflet/dist/leaflet.css';

/**
 * Bilbao Geographic Constants
 * Source: OpenStreetMap Nominatim API (relation 339549)
 * https://www.openstreetmap.org/relation/339549
 *
 * Center coordinates: 43.26271, -2.92528 (official city center)
 * Bounding box of Bilbao municipality:
 *   - North: 43.2901315
 *   - South: 43.2137176
 *   - East: -2.8802639
 *   - West: -2.9859808
 */
const BILBAO_CENTER: [number, number] = [43.26271, -2.92528];
const BILBAO_BOUNDS = {
  north: 43.2901315,
  south: 43.2137176,
  east: -2.8802639,
  west: -2.9859808,
};

/**
 * Checks if given coordinates are within Bilbao's bounding box
 */
function isWithinBilbao(lat: number, lng: number): boolean {
  return (
    lat >= BILBAO_BOUNDS.south &&
    lat <= BILBAO_BOUNDS.north &&
    lng >= BILBAO_BOUNDS.west &&
    lng <= BILBAO_BOUNDS.east
  );
}

// Custom icon for user location marker
const userLocationIcon = new DivIcon({
  className: 'user-location-marker',
  html: `<div style="
    width: 20px;
    height: 20px;
    background-color: #3b82f6;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Component to handle map operations (needs to be inside MapContainer)
interface MapControllerProps {
  flyToLocation: [number, number] | null;
  onFlyComplete: () => void;
  selectedPointLocation: [number, number] | null;
  onPointFlyComplete: () => void;
}

function MapController({ flyToLocation, onFlyComplete, selectedPointLocation, onPointFlyComplete }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (flyToLocation) {
      map.flyTo(flyToLocation, 16, { duration: 1 });
      onFlyComplete();
    }
  }, [flyToLocation, map, onFlyComplete]);

  useEffect(() => {
    if (selectedPointLocation) {
      map.flyTo(selectedPointLocation, 17, { duration: 0.8 });
      onPointFlyComplete();
    }
  }, [selectedPointLocation, map, onPointFlyComplete]);

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
  representativeness: string;
}

const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export function MapPage() {
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [selectedRoute, setSelectedRoute] = useState<string | null>(
    searchParams.get('route')
  );
  const [selectedPoint, setSelectedPoint] = useState<SoundPoint | null>(null);
  const [soundPoints] = useState<SoundPoint[]>(soundPointsData as SoundPoint[]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const markerRefs = useRef<Map<string, LeafletMarker>>(new Map());

  // Geolocation state
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [flyToLocation, setFlyToLocation] = useState<[number, number] | null>(null);
  const [selectedPointLocation, setSelectedPointLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Clear toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleFlyComplete = useCallback(() => {
    setFlyToLocation(null);
  }, []);

  const handlePointFlyComplete = useCallback(() => {
    setSelectedPointLocation(null);
  }, []);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setToastMessage(t('map.locationError'));
      setFlyToLocation(BILBAO_CENTER);
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        if (isWithinBilbao(latitude, longitude)) {
          // User is within Bilbao - show their location
          setUserLocation([latitude, longitude]);
          setFlyToLocation([latitude, longitude]);
        } else {
          // User is outside Bilbao - center on Bilbao
          setUserLocation(null);
          setFlyToLocation(BILBAO_CENTER);
          setToastMessage(t('map.outsideBilbao') + '. ' + t('map.showingBilbaoCenter'));
        }

        setIsLocating(false);
      },
      () => {
        // Error getting location - center on Bilbao
        setToastMessage(t('map.locationError') + '. ' + t('map.showingBilbaoCenter'));
        setFlyToLocation(BILBAO_CENTER);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [t]);

  const handlePointClick = useCallback((point: SoundPoint) => {
    setSelectedPoint(point);
    setSelectedPointLocation([point.latitude, point.longitude]);

    // Open the popup after a short delay to allow flyTo to start
    setTimeout(() => {
      const marker = markerRefs.current.get(point.id);
      if (marker) {
        marker.openPopup();
      }
    }, 100);
  }, []);

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

  // Reset audio state when selecting a new point
  useEffect(() => {
    setIsAudioPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [selectedPoint]);

  useEffect(() => {
    const route = searchParams.get('route');
    if (route) setSelectedRoute(route);
  }, [searchParams]);

  const filteredPoints = selectedRoute
    ? soundPoints.filter(p => p.routes.includes(selectedRoute))
    : soundPoints;

  // Get route data including pre-calculated geometry and approach segments
  const selectedRouteData = routesData.find(r => r.id === selectedRoute) as {
    id: string;
    color: string;
    geometry?: [number, number][];
    approachSegments?: { from: [number, number]; to: [number, number] }[];
  } | undefined;
  const routeColor = selectedRouteData?.color || '#171717';

  // Use pre-calculated route geometry (follows streets) or fallback to straight lines
  const routePath: [number, number][] = selectedRoute && selectedRouteData?.geometry
    ? selectedRouteData.geometry
    : [];

  // Approach segments: gray lines connecting markers to the main route
  const approachSegments = selectedRoute && selectedRouteData?.approachSegments
    ? selectedRouteData.approachSegments
    : [];

  const center: [number, number] = [43.278, -2.961];

  return (
    <div className="h-[calc(100vh-64px)] relative">
      {/* Route filters - overlaid on map */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedRoute(null)}
          className={`inline-flex items-center justify-center gap-2 font-medium transition-colors h-9 rounded-md px-4 text-sm whitespace-nowrap shadow-md ${
            !selectedRoute
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {t('map.all')}
        </button>
        {routesData.map((route) => (
          <button
            key={route.id}
            onClick={() => setSelectedRoute(route.id)}
            className={`inline-flex items-center justify-center gap-2 font-medium transition-colors h-9 rounded-md px-4 text-sm whitespace-nowrap shadow-md ${
              selectedRoute === route.id
                ? 'text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            style={selectedRoute === route.id ? { backgroundColor: route.color } : {}}
          >
            {language === 'es' ? route.name_es : route.name_eu}
          </button>
        ))}
      </div>

      <MapContainer center={center} zoom={15} className="h-full w-full">
        <MapController
          flyToLocation={flyToLocation}
          onFlyComplete={handleFlyComplete}
          selectedPointLocation={selectedPointLocation}
          onPointFlyComplete={handlePointFlyComplete}
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Approach segments: gray dashed lines connecting markers to the route */}
        {selectedRoute && approachSegments.map((segment, index) => (
          <Polyline
            key={`approach-${index}`}
            positions={[segment.from, segment.to]}
            pathOptions={{
              color: '#4b5563', // gray-600 for better contrast
              weight: 4,
              opacity: 0.9,
              dashArray: '8, 8',
            }}
          />
        ))}
        {/* Main route path line */}
        {selectedRoute && routePath.length > 1 && (
          <Polyline
            positions={routePath}
            pathOptions={{
              color: routeColor,
              weight: 4,
              opacity: 0.8,
              dashArray: '10, 10',
            }}
          />
        )}
        {filteredPoints.map((point) => (
          <Marker
            key={point.id}
            position={[point.latitude, point.longitude]}
            icon={defaultIcon}
            ref={(ref) => {
              if (ref) {
                markerRefs.current.set(point.id, ref as unknown as LeafletMarker);
              }
            }}
            eventHandlers={{
              click: () => handlePointClick(point),
            }}
          >
            <Popup
              minWidth={320}
              maxWidth={360}
              className="sound-point-popup"
            >
              <div className="sound-popup-content" style={{ width: '320px' }}>
                {/* Header with title and audio button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', flex: 1 }}>
                    {language === 'es' ? point.title_es : point.title_eu}
                  </h3>
                  {point.audio_url && selectedPoint?.id === point.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAudio();
                      }}
                      className="audio-btn"
                      style={{
                        backgroundColor: isAudioPlaying ? '#dcfce7' : '#f3f4f6',
                        color: isAudioPlaying ? '#16a34a' : '#4b5563',
                      }}
                      title={language === 'es' ? 'Reproducir audio' : 'Audioa erreproduzitu'}
                    >
                      <Volume2 size={20} />
                    </button>
                  )}
                </div>

                {/* YouTube embedded video */}
                {point.youtube_id && (
                  <div style={{ aspectRatio: '16/9', marginBottom: '12px', borderRadius: '8px', overflow: 'hidden' }}>
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${point.youtube_id}?rel=0&modestbranding=1`}
                      title={language === 'es' ? point.title_es : point.title_eu}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                )}

                {/* Description */}
                <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>
                  {language === 'es' ? point.description_es : point.description_eu}
                </p>

                {/* Hidden audio element */}
                {selectedPoint?.id === point.id && point.audio_url && (
                  <audio
                    ref={audioRef}
                    src={point.audio_url}
                    onEnded={() => setIsAudioPlaying(false)}
                  />
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation} icon={userLocationIcon}>
            <Popup>
              <div className="text-sm font-medium">{t('map.yourLocation')}</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Locate Me button - positioned like Leaflet zoom controls */}
      <button
        onClick={handleLocateMe}
        disabled={isLocating}
        className="absolute bottom-24 right-2.5 z-[1000] w-[34px] h-[34px] bg-white rounded-md shadow-md border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-wait transition-colors"
        title={t('map.locateMe')}
        aria-label={t('map.locateMe')}
      >
        <LocateFixed
          size={18}
          className={`text-gray-700 ${isLocating ? 'animate-pulse' : ''}`}
        />
      </button>

      {/* Toast notification */}
      {toastMessage && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm max-w-xs text-center animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
