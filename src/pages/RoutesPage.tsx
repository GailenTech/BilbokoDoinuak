import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, Ear, Trees, Music } from 'lucide-react';
import routesData from '../data/routes.json';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'volume-2': Ear,
  'tree-deciduous': Trees,
  'music': Music,
};

const colorMap: Record<string, string> = {
  'acoustic_friendly': 'bg-blue-600',
  'climate_refuge': 'bg-green-600',
  'sound_identity': 'bg-red-600',
};

const titleColorMap: Record<string, string> = {
  'acoustic_friendly': 'text-blue-600',
  'climate_refuge': 'text-green-600',
  'sound_identity': 'text-red-600',
};

export function RoutesPage() {
  const { language, t } = useLanguage();

  return (
    <main className="min-h-[calc(100vh-64px)] bg-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('routes.title')}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('routes.subtitle')}
          </p>
        </div>

        {/* Routes list - horizontal cards like original */}
        <div className="flex flex-col gap-4 max-w-4xl mx-auto">
          {routesData.map((route) => {
            const IconComponent = iconMap[route.icon] || Ear;
            const bgColor = colorMap[route.id] || 'bg-gray-600';
            const titleColor = titleColorMap[route.id] || 'text-gray-900';

            return (
              <Link
                key={route.id}
                to={`/map?route=${route.id}`}
                className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden hover:shadow-lg transition-shadow group flex flex-row"
              >
                {/* Icon container */}
                <div
                  className={`${bgColor} w-24 md:w-32 p-6 flex items-center justify-center shrink-0`}
                >
                  <IconComponent className="w-12 h-12 text-white" />
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-center">
                  <h2 className={`font-semibold text-lg ${titleColor} mb-2`}>
                    {language === 'es' ? route.name_es : route.name_eu}
                  </h2>
                  <p className="text-gray-600 text-sm mb-3">
                    {language === 'es' ? route.description_es : route.description_eu}
                  </p>
                  <div className="flex items-center gap-2 text-gray-900 group-hover:gap-3 transition-all">
                    <span className="font-medium text-sm">{t('routes.play')}</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
