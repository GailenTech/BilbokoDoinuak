import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export function Home() {
  const { setLanguage } = useLanguage();
  const navigate = useNavigate();

  const selectLanguage = (lang: 'es' | 'eu') => {
    setLanguage(lang);
    navigate('/map');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87]">
      <div className="max-w-2xl mx-auto px-4 text-center">
        {/* Logo */}
        <div className="mb-8">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6936cdc7a410f6ff280751de/3a0c01149_logo.png"
            alt="Bilboko Doinuak"
            className="h-24 mx-auto"
          />
        </div>

        {/* Welcome text - bilingual */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 text-white">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Bienvenido al mapa sonoro de San Ignacio
            </h1>
            <p className="text-white/80">
              Elige tu idioma para explorar los sonidos del barrio y jugar con la memoria sonora.
            </p>
          </div>

          <div className="border-t border-white/20 pt-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Ongi etorri San Inazioko soinu-mapara
            </h2>
            <p className="text-white/80">
              Aukeratu hizkuntza, auzoko soinuak entzuteko eta memoria-jokoan parte hartzeko.
            </p>
          </div>
        </div>

        {/* Language buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => selectLanguage('eu')}
            className="px-8 py-4 bg-white text-[#1e3a5f] font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg text-lg"
          >
            Euskara
          </button>
          <button
            onClick={() => selectLanguage('es')}
            className="px-8 py-4 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-colors border-2 border-white/40 text-lg"
          >
            Castellano / Gaztelania
          </button>
        </div>
      </div>
    </div>
  );
}
