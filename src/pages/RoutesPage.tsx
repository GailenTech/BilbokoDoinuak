import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Map, Navigation, Ear, Trees, Music } from 'lucide-react';
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
              <div
                key={route.id}
                className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden flex flex-row"
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
                  <p className="text-gray-600 text-sm mb-4">
                    {language === 'es' ? route.description_es : route.description_eu}
                  </p>
                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/guide/${route.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium text-sm transition-colors hover:opacity-90"
                      style={{ backgroundColor: route.color }}
                    >
                      <Navigation size={16} />
                      <span>{t('routes.startGuide')}</span>
                    </Link>
                    <Link
                      to={`/map?route=${route.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition-colors"
                    >
                      <Map size={16} />
                      <span>{t('routes.viewOnMap')}</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
