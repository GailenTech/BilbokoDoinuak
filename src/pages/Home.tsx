import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

export function Home() {
  const { setLanguage } = useLanguage();
  const navigate = useNavigate();

  const selectLanguage = (lang: 'es' | 'eu') => {
    setLanguage(lang);
    navigate('/map');
  };

  return (
    <main>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-white to-blue-50">
        <div className="w-full max-w-2xl">
          {/* Card with top border accent */}
          <div className="rounded-xl border bg-white shadow-2xl border-t-4 border-t-red-600">
            {/* Card header/content */}
            <div className="flex flex-col p-6 text-center space-y-4 pb-8">
              {/* Globe icon */}
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                <Globe className="w-8 h-8 text-red-600" />
              </div>

              {/* Spanish welcome */}
              <div className="space-y-2 pb-4 border-b border-gray-200">
                <h1 className="tracking-tight text-3xl font-black text-gray-900">
                  Bienvenido al mapa sonoro de San Ignacio
                </h1>
                <p className="text-gray-600 text-lg">
                  Elige tu idioma para explorar los sonidos del barrio y jugar con la memoria sonora.
                </p>
              </div>

              {/* Basque welcome */}
              <div className="space-y-2 pt-2">
                <h2 className="tracking-tight text-3xl font-black text-gray-900">
                  Ongi etorri San Inazioko soinu-mapara
                </h2>
                <p className="text-gray-600 text-lg">
                  Aukeratu hizkuntza, auzoko soinuak entzuteko eta memoria-jokoan parte hartzeko.
                </p>
              </div>
            </div>

            {/* Card footer with buttons */}
            <div className="p-6 pt-0 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => selectLanguage('eu')}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors shadow px-4 py-2 h-16 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Euskara
                </button>
                <button
                  onClick={() => selectLanguage('es')}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors shadow px-4 py-2 h-16 text-lg font-bold bg-red-600 hover:bg-red-700 text-white"
                >
                  Castellano / Gaztelania
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
