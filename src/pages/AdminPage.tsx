import { useLanguage } from '../context/LanguageContext';
import { Lock } from 'lucide-react';

export function AdminPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={40} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-[#1e3a5f] mb-2">
          {language === 'es' ? 'Acceso Restringido' : 'Sarbide Mugatua'}
        </h1>
        <p className="text-gray-600 mb-6">
          {language === 'es'
            ? 'Este panel es solo para personal municipal autorizado.'
            : 'Panel hau baimendutako udal langileentzat soilik da.'}
        </p>
        <button className="px-6 py-3 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d5a87] transition-colors">
          {language === 'es' ? 'Iniciar Sesión' : 'Saioa Hasi'}
        </button>
      </div>
    </div>
  );
}
