import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import { Play, X } from 'lucide-react';
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

  useEffect(() => {
    const route = searchParams.get('route');
    if (route) setSelectedRoute(route);
  }, [searchParams]);

  const filteredPoints = selectedRoute
    ? soundPoints.filter(p => p.routes.includes(selectedRoute))
    : soundPoints;

  // Get route color and path coordinates for polyline
  const selectedRouteData = routesData.find(r => r.id === selectedRoute);
  const routeColor = selectedRouteData?.color || '#1e3a5f';

  // Create path coordinates from filtered points (sorted by latitude for a logical path)
  const routePath: [number, number][] = selectedRoute
    ? filteredPoints
        .sort((a, b) => a.latitude - b.latitude)
        .map(p => [p.latitude, p.longitude] as [number, number])
    : [];

  const center: [number, number] = [43.278, -2.961];

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Filters */}
      <div className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedRoute(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !selectedRoute
                  ? 'bg-[#1e3a5f] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('map.all')}
            </button>
            {routesData.map((route) => (
              <button
                key={route.id}
                onClick={() => setSelectedRoute(route.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedRoute === route.id
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={selectedRoute === route.id ? { backgroundColor: route.color } : {}}
              >
                {language === 'es' ? route.name_es : route.name_eu}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer center={center} zoom={15} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Route path line */}
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
            <div className="relative">
              <img
                src={selectedPoint.image_url}
                alt={language === 'es' ? selectedPoint.title_es : selectedPoint.title_eu}
                className="w-full h-40 object-cover"
              />
              <button
                onClick={() => setSelectedPoint(null)}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">
                {language === 'es' ? selectedPoint.title_es : selectedPoint.title_eu}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {language === 'es' ? selectedPoint.description_es : selectedPoint.description_eu}
              </p>

              {/* Audio player */}
              <div className="mb-4">
                <audio controls className="w-full" src={selectedPoint.audio_url}>
                  Tu navegador no soporta audio.
                </audio>
              </div>

              {/* YouTube link */}
              {selectedPoint.youtube_id && (
                <a
                  href={`https://www.youtube.com/watch?v=${selectedPoint.youtube_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Play size={16} />
                  <span className="text-sm">Ver en YouTube</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
