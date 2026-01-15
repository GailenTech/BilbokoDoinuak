import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import { Volume2, X } from 'lucide-react';
import soundPointsData from '../data/soundPoints.json';
import routesData from '../data/routes.json';
import 'leaflet/dist/leaflet.css';

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
            eventHandlers={{
              click: () => setSelectedPoint(point),
            }}
          >
            <Popup>
              <div className="text-sm">
                <strong>{language === 'es' ? point.title_es : point.title_eu}</strong>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Detail panel */}
      {selectedPoint && (
        <div className="absolute top-4 right-4 w-80 bg-white rounded-xl shadow-xl overflow-hidden z-[1000]">
          {/* Header with title and audio button */}
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">
                {language === 'es' ? selectedPoint.title_es : selectedPoint.title_eu}
              </h3>
              <button
                onClick={toggleAudio}
                className={`p-1.5 rounded-full transition-colors ${
                  isAudioPlaying
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={language === 'es' ? 'Reproducir audio' : 'Audioa erreproduzitu'}
              >
                <Volume2 size={18} />
              </button>
            </div>
            <button
              onClick={() => setSelectedPoint(null)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* YouTube embedded video */}
          {selectedPoint.youtube_id && (
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedPoint.youtube_id}`}
                title={language === 'es' ? selectedPoint.title_es : selectedPoint.title_eu}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Description */}
          <div className="p-4">
            <p className="text-gray-600 text-sm">
              {language === 'es' ? selectedPoint.description_es : selectedPoint.description_eu}
            </p>
          </div>

          {/* Hidden audio element for icon playback */}
          <audio
            ref={audioRef}
            src={selectedPoint.audio_url}
            onEnded={() => setIsAudioPlaying(false)}
          />
        </div>
      )}
    </div>
  );
}
