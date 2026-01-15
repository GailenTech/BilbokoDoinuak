import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, Volume2, TreeDeciduous, Music } from 'lucide-react';
import routesData from '../data/routes.json';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'volume-2': Volume2,
  'tree-deciduous': TreeDeciduous,
  'music': Music,
};

export function RoutesPage() {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">
            {t('routes.title')}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('routes.subtitle')}
          </p>
        </div>

        {/* Routes grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {routesData.map((route) => {
            const IconComponent = iconMap[route.icon] || Volume2;
            return (
              <Link
                key={route.id}
                to={`/map?route=${route.id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div
                  className="h-32 flex items-center justify-center"
                  style={{ backgroundColor: route.color }}
                >
                  <IconComponent size={48} className="text-white" />
                </div>
                <div className="p-5">
                  <h2 className="font-bold text-lg text-[#1e3a5f] mb-2">
                    {language === 'es' ? route.name_es : route.name_eu}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    {language === 'es' ? route.description_es : route.description_eu}
                  </p>
                  <div className="flex items-center gap-2 text-[#1e3a5f] group-hover:gap-3 transition-all">
                    <span className="font-medium">{t('routes.play')}</span>
                    <ArrowRight size={18} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
