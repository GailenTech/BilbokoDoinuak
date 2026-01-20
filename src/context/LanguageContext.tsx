import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type Language = 'es' | 'eu';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.home': { es: 'Inicio', eu: 'Hasiera' },
  'nav.map': { es: 'Mapa Interactivo', eu: 'Mapa Interaktiboa' },
  'nav.routes': { es: 'Rutas Temáticas', eu: 'Ibilbide Tematikoak' },
  'nav.games': { es: 'Juegos Sonoros', eu: 'Soinu Jokoak' },
  'nav.admin': { es: 'Panel Municipal', eu: 'Udal Panela' },

  // Home
  'home.welcome_es': { es: 'Bienvenido al mapa sonoro de San Ignacio', eu: 'Ongi etorri San Inazioko soinu-mapara' },
  'home.welcome_eu': { es: 'Ongi etorri San Inazioko soinu-mapara', eu: 'Ongi etorri San Inazioko soinu-mapara' },
  'home.subtitle_es': { es: 'Elige tu idioma para explorar los sonidos del barrio y jugar con la memoria sonora.', eu: 'Aukeratu hizkuntza, auzoko soinuak entzuteko eta memoria-jokoan parte hartzeko.' },
  'home.subtitle_eu': { es: 'Aukeratu hizkuntza, auzoko soinuak entzuteko eta memoria-jokoan parte hartzeko.', eu: 'Aukeratu hizkuntza, auzoko soinuak entzuteko eta memoria-jokoan parte hartzeko.' },
  'home.euskara': { es: 'Euskara', eu: 'Euskara' },
  'home.castellano': { es: 'Castellano / Gaztelania', eu: 'Gaztelania / Castellano' },

  // Map
  'map.filter_emotion': { es: 'Filtrar por emoción', eu: 'Emozioen arabera iragazi' },
  'map.all_emotions': { es: 'Todas las emociones', eu: 'Emozio guztiak' },
  'map.all_sounds': { es: 'Todos los sonidos', eu: 'Soinu guztiak' },
  'map.all': { es: 'Todos', eu: 'Guztiak' },

  // Emotions
  'emotion.happy': { es: 'Me anima / Me alegra', eu: 'Animatzen nau / Pozten nau' },
  'emotion.relax': { es: 'Me relaja', eu: 'Erlaxatzen nau' },
  'emotion.neutral': { es: 'Me da igual', eu: 'Berdin zait' },
  'emotion.fear': { es: 'No me gusta / Me da miedo', eu: 'Ez zait gustatzen / Beldurtzen nau' },
  'emotion.annoy': { es: 'Me molesta', eu: 'Gogaitzen nau' },

  // Routes
  'routes.title': { es: 'Rutas Temáticas', eu: 'Ibilbide Tematikoak' },
  'routes.subtitle': { es: 'Explora San Inazio a través de nuestros recorridos temáticos curados.', eu: 'Esploratu San Inazio gure ibilbide tematiko hautatuen bidez.' },
  'routes.play': { es: 'Jugar', eu: 'Jolastu' },
  'routes.startGuide': { es: 'Iniciar Guía', eu: 'Gida hasi' },
  'routes.viewOnMap': { es: 'Ver en Mapa', eu: 'Mapan ikusi' },

  // General
  'listen': { es: 'Escuchar', eu: 'Entzun' },
  'close': { es: 'Cerrar', eu: 'Itxi' },

  // Geolocation
  'map.locateMe': { es: 'Localízame', eu: 'Kokatu nazazu' },
  'map.yourLocation': { es: 'Tu ubicación', eu: 'Zure kokapena' },
  'map.showingBilbaoCenter': { es: 'Mostrando centro de Bilbao', eu: 'Bilboko erdigunea erakusten' },
  'map.locationError': { es: 'No se pudo obtener tu ubicación', eu: 'Ezin izan da zure kokapena lortu' },
  'map.outsideBilbao': { es: 'Estás fuera de Bilbao', eu: 'Bilbotik kanpo zaude' },

  // Route Guide
  'guide.title': { es: 'Guía de Ruta', eu: 'Ibilbide Gida' },
  'guide.point': { es: 'Punto', eu: 'Puntua' },
  'guide.of': { es: 'de', eu: '/' },
  'guide.distance': { es: 'Distancia', eu: 'Distantzia' },
  'guide.meters': { es: 'm', eu: 'm' },
  'guide.arrived': { es: '¡Has llegado!', eu: 'Heldu zara!' },
  'guide.next': { es: 'Siguiente', eu: 'Hurrengoa' },
  'guide.prev': { es: 'Anterior', eu: 'Aurrekoa' },
  'guide.start': { es: 'Comenzar', eu: 'Hasi' },
  'guide.finish': { es: 'Finalizar', eu: 'Amaitu' },
  'guide.viewOnMap': { es: 'Ver en mapa', eu: 'Mapan ikusi' },
  'guide.playAudio': { es: 'Reproducir audio', eu: 'Audioa erreproduzitu' },
  'guide.watchVideo': { es: 'Ver vídeo', eu: 'Bideoa ikusi' },
  'guide.enableLocation': { es: 'Activar ubicación', eu: 'Kokapena aktibatu' },
  'guide.routeCompleted': { es: '¡Ruta completada!', eu: 'Ibilbidea amaituta!' },
  'guide.congratulations': { es: '¡Enhorabuena! Has visitado todos los puntos sonoros de esta ruta.', eu: 'Zorionak! Ibilbide honetako soinu-puntu guztiak bisitatu dituzu.' },
  'guide.backToRoutes': { es: 'Volver a rutas', eu: 'Ibilbideetara itzuli' },
  'guide.walkingTo': { es: 'Camina hacia', eu: 'Oinez hona' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
