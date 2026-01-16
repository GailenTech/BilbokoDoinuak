import { useState, useEffect } from 'react';
import { Users, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { fetchAllStats, exportToCSV, type AllStats, type RecentRegistration } from '../lib/stats/statsService';

// Colors for charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const AGE_LABELS: Record<string, string> = {
  under_18: '< 18',
  '18_30': '18-30',
  '31_50': '31-50',
  '51_65': '51-65',
  over_65: '> 65',
};

const GENDER_LABELS: Record<string, string> = {
  female: 'Mujer',
  male: 'Hombre',
  non_binary: 'No binario',
};

const BARRIO_LABELS: Record<string, string> = {
  san_ignacio: 'San Ignacio',
  ibarrekolanda: 'Ibarrekolanda',
  elegorrieta: 'Elegorrieta',
  otro_bilbao: 'Otro (Bilbao)',
  otro_municipio: 'Otro municipio',
};

export function StatsPage() {
  const [stats, setStats] = useState<AllStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchAllStats();
        setStats(data);
      } catch (err) {
        setError('Error al cargar las estadísticas');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const handleExportCSV = () => {
    if (stats?.recent_registrations) {
      exportToCSV(stats.recent_registrations);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <p>No hay datos disponibles</p>
        </div>
      </main>
    );
  }

  // Prepare chart data
  const ageData = stats.age_distribution.map((item, index) => ({
    name: AGE_LABELS[item.age_range || ''] || item.age_range,
    value: item.count,
    color: COLORS[index % COLORS.length],
  }));

  const genderData = stats.gender_distribution.map((item, index) => ({
    name: GENDER_LABELS[item.gender || ''] || item.gender,
    value: item.count,
    color: COLORS[index % COLORS.length],
  }));

  const barrioData = stats.barrio_distribution.map((item, index) => ({
    name: BARRIO_LABELS[item.barrio || ''] || item.barrio,
    value: item.count,
    color: COLORS[index % COLORS.length],
  }));

  const growthIsPositive = stats.user_stats.growth_percent >= 0;

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel Municipal</h1>
            <p className="text-gray-500">Gestión y métricas del proyecto Bilboko Doinuak</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>

        {/* Total Users Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Total Usuarios</p>
              <p className="text-4xl font-bold text-gray-900 mt-1">
                {stats.user_stats.total_users}
              </p>
              <div className={`flex items-center gap-1 mt-2 text-sm ${growthIsPositive ? 'text-green-600' : 'text-red-600'}`}>
                {growthIsPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>
                  {growthIsPositive ? '+' : ''}{stats.user_stats.growth_percent}% desde el mes pasado
                </span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Age Distribution - Pie Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Edad</h2>
            <div className="flex justify-center">
              <PieChart width={350} height={250}>
                <Pie
                  data={ageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value }) => `${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          </div>

          {/* Gender Distribution - Bar Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Género</h2>
            <div className="flex justify-center">
              <BarChart width={350} height={250} data={genderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6">
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </div>
          </div>
        </div>

        {/* Barrio Distribution */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Barrio</h2>
          <div className="flex justify-center overflow-x-auto">
            <BarChart width={700} height={250} data={barrioData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="value" fill="#10B981">
                {barrioData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </div>
        </div>

        {/* Recent Registrations Table */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Últimos Registros</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Fecha</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Edad</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Género</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Barrio</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_registrations.map((reg: RecentRegistration, index: number) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">
                      {new Date(reg.fecha).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {AGE_LABELS[reg.age_range] || reg.age_range}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {GENDER_LABELS[reg.gender] || reg.gender}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {BARRIO_LABELS[reg.barrio] || reg.barrio}
                    </td>
                  </tr>
                ))}
                {stats.recent_registrations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      No hay registros disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
