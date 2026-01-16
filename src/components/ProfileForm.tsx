import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePersistence } from '../context/PersistenceContext';
import type { AgeRange, Gender, Barrio } from '../lib/persistence/types';

const AGE_OPTIONS: { value: AgeRange; label_es: string; label_eu: string }[] = [
  { value: 'under_18', label_es: 'Menor de 18', label_eu: '18 urte baino gutxiago' },
  { value: '18_30', label_es: '18 - 30', label_eu: '18 - 30' },
  { value: '31_50', label_es: '31 - 50', label_eu: '31 - 50' },
  { value: '51_65', label_es: '51 - 65', label_eu: '51 - 65' },
  { value: 'over_65', label_es: 'Mayor de 65', label_eu: '65 urte baino gehiago' },
];

const GENDER_OPTIONS: { value: Gender; label_es: string; label_eu: string }[] = [
  { value: 'female', label_es: 'Mujer', label_eu: 'Emakumea' },
  { value: 'male', label_es: 'Hombre', label_eu: 'Gizona' },
  { value: 'non_binary', label_es: 'No binario', label_eu: 'Ez binarioa' },
];

const BARRIO_OPTIONS: { value: Barrio; label_es: string; label_eu: string; needsSpecify?: boolean }[] = [
  { value: 'san_ignacio', label_es: 'San Ignacio', label_eu: 'San Ignazio' },
  { value: 'ibarrekolanda', label_es: 'Ibarrekolanda', label_eu: 'Ibarrekolanda' },
  { value: 'elegorrieta', label_es: 'Elegorrieta', label_eu: 'Elegorrieta' },
  { value: 'otro_bilbao', label_es: 'Otro barrio de Bilbao', label_eu: 'Bilboko beste auzo bat', needsSpecify: true },
  { value: 'otro_municipio', label_es: 'Otro municipio', label_eu: 'Beste udalerri bat', needsSpecify: true },
];

export function ProfileForm() {
  const { language } = useLanguage();
  const { saveUserProfile } = usePersistence();
  const navigate = useNavigate();

  const [ageRange, setAgeRange] = useState<AgeRange | ''>('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [barrio, setBarrio] = useState<Barrio | ''>('');
  const [barrioOtro, setBarrioOtro] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedBarrioOption = BARRIO_OPTIONS.find(opt => opt.value === barrio);
  const needsBarrioSpecify = selectedBarrioOption?.needsSpecify ?? false;

  const isFormComplete =
    ageRange !== '' &&
    gender !== '' &&
    barrio !== '' &&
    (!needsBarrioSpecify || barrioOtro.trim() !== '');

  const handleSubmit = async () => {
    if (!isFormComplete) return;

    setIsSubmitting(true);
    try {
      await saveUserProfile({
        ageRange: ageRange as AgeRange,
        gender: gender as Gender,
        barrio: barrio as Barrio,
        barrioOtro: needsBarrioSpecify ? barrioOtro.trim() : undefined,
      });
      navigate('/map');
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBarrioChange = (value: Barrio | '') => {
    setBarrio(value);
    // Clear barrioOtro when changing to a non-specify option
    if (!BARRIO_OPTIONS.find(opt => opt.value === value)?.needsSpecify) {
      setBarrioOtro('');
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center py-8">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              {language === 'es'
                ? 'Ayudanos a conocerte mejor'
                : 'Lagundu ezagutzen'}
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              {language === 'es'
                ? 'Tus datos son anonimos y nos ayudan a mejorar.'
                : 'Zure datuak anonimoak dira eta hobetzen laguntzen digute.'}
            </p>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'es' ? 'Edad' : 'Adina'}
              </label>
              <select
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value as AgeRange | '')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer"
              >
                <option value="">
                  {language === 'es' ? 'Selecciona tu rango de edad' : 'Aukeratu adin tartea'}
                </option>
                {AGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {language === 'es' ? opt.label_es : opt.label_eu}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'es' ? 'Genero' : 'Generoa'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender | '')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer"
              >
                <option value="">
                  {language === 'es' ? 'Selecciona tu genero' : 'Aukeratu generoa'}
                </option>
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {language === 'es' ? opt.label_es : opt.label_eu}
                  </option>
                ))}
              </select>
            </div>

            {/* Barrio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'es' ? 'Barrio' : 'Auzoa'}
              </label>
              <select
                value={barrio}
                onChange={(e) => handleBarrioChange(e.target.value as Barrio | '')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer"
              >
                <option value="">
                  {language === 'es' ? 'Selecciona tu barrio' : 'Aukeratu auzoa'}
                </option>
                {BARRIO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {language === 'es' ? opt.label_es : opt.label_eu}
                  </option>
                ))}
              </select>
            </div>

            {/* Conditional text field for "otro" options */}
            {needsBarrioSpecify && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'es' ? '¿Cuál?' : 'Zein?'}
                </label>
                <input
                  type="text"
                  value={barrioOtro}
                  onChange={(e) => setBarrioOtro(e.target.value)}
                  placeholder={language === 'es'
                    ? (barrio === 'otro_bilbao' ? 'Nombre del barrio' : 'Nombre del municipio')
                    : (barrio === 'otro_bilbao' ? 'Auzoaren izena' : 'Udalerriaren izena')
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!isFormComplete || isSubmitting}
              className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all mt-6 ${
                isFormComplete && !isSubmitting
                  ? 'bg-purple-600 hover:bg-purple-700 cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {isSubmitting
                ? (language === 'es' ? 'Guardando...' : 'Gordetzen...')
                : (language === 'es' ? 'Guardar y Continuar' : 'Gorde eta Jarraitu')}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
