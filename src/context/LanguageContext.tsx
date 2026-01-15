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

  // General
  'listen': { es: 'Escuchar', eu: 'Entzun' },
  'close': { es: 'Cerrar', eu: 'Itxi' },
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
