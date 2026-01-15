import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { usePersistence } from '../context/PersistenceContext';
import { X, Volume2, CheckCircle, XCircle, Trophy, RotateCcw, Flame, ArrowLeft, Star } from 'lucide-react';
import soundPointsData from '../data/soundPoints.json';

interface SoundPoint {
  id: string;
  title_es: string;
  title_eu: string;
  audio_url: string;
  image_url: string;
}

interface Question {
  correctAnswer: SoundPoint;
  options: SoundPoint[];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateQuestions(soundPoints: SoundPoint[], count: number): Question[] {
  const shuffled = shuffleArray(soundPoints);
  const questions: Question[] = [];

  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const correctAnswer = shuffled[i];
    const otherOptions = shuffleArray(
      soundPoints.filter(p => p.id !== correctAnswer.id)
    ).slice(0, 3);

    const options = shuffleArray([correctAnswer, ...otherOptions]);
    questions.push({ correctAnswer, options });
  }

  return questions;
}

export function QuizGame() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  const { addXP, recordGame, unlockBadge } = usePersistence();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [resultSaved, setResultSaved] = useState(false);

  const TOTAL_QUESTIONS = 5;
  const XP_PER_CORRECT = 20;

  useEffect(() => {
    const points = soundPointsData as SoundPoint[];
    setQuestions(generateQuestions(points, TOTAL_QUESTIONS));
  }, []);

  const currentQuestion = questions[currentIndex];

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAnswer = (answerId: string) => {
    if (showResult) return;

    setSelectedAnswer(answerId);
    setShowResult(true);

    if (answerId === currentQuestion.correctAnswer.id) {
      setScore(prev => prev + 1);
    }

    // Stop audio when answering
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setGameOver(true);
    }
  };

  // Save game results when game ends
  const saveGameResults = useCallback(async (finalScore: number) => {
    if (resultSaved) return;

    const earnedXP = finalScore * XP_PER_CORRECT;
    setXpEarned(earnedXP);

    // Record the game
    await recordGame({
      gameType: 'quiz',
      score: finalScore,
      maxScore: TOTAL_QUESTIONS,
    });

    // Add XP
    if (earnedXP > 0) {
      await addXP(earnedXP);
    }

    // Check for perfect quiz badge
    if (finalScore === TOTAL_QUESTIONS) {
      await unlockBadge('perfect_quiz');
    }

    setResultSaved(true);
  }, [resultSaved, recordGame, addXP, unlockBadge]);

  // Save results when game ends
  useEffect(() => {
    if (gameOver && !resultSaved) {
      saveGameResults(score);
    }
  }, [gameOver, score, resultSaved, saveGameResults]);

  const restartGame = () => {
    const points = soundPointsData as SoundPoint[];
    setQuestions(generateQuestions(points, TOTAL_QUESTIONS));
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
    setXpEarned(0);
    setResultSaved(false);
  };

  const getOptionStyle = (optionId: string) => {
    if (!showResult) {
      return 'bg-white border-gray-200 hover:border-green-400 hover:bg-green-50';
    }
    if (optionId === currentQuestion.correctAnswer.id) {
      return 'bg-green-100 border-green-500';
    }
    if (optionId === selectedAnswer && optionId !== currentQuestion.correctAnswer.id) {
      return 'bg-red-100 border-red-500';
    }
    return 'bg-gray-100 border-gray-200 opacity-50';
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
        <p>{language === 'es' ? 'Cargando...' : 'Kargatzen...'}</p>
      </div>
    );
  }

  if (gameOver) {
    const percentage = Math.round((score / TOTAL_QUESTIONS) * 100);
    const isPerfect = score === TOTAL_QUESTIONS;
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {language === 'es' ? '!Juego completado!' : 'Jokoa amaituta!'}
            </h2>
            <p className="text-gray-600 mb-4">
              {language === 'es'
                ? `Has acertado ${score} de ${TOTAL_QUESTIONS} preguntas`
                : `${TOTAL_QUESTIONS} galderatik ${score} asmatu dituzu`}
            </p>
            <div className="text-5xl font-bold text-green-500 mb-4">
              {percentage}%
            </div>

            {/* XP earned */}
            {xpEarned > 0 && (
              <div className="bg-purple-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-purple-700">
                  <Star className="w-5 h-5" />
                  <span className="font-bold text-lg">+{xpEarned} XP</span>
                </div>
                {isPerfect && (
                  <p className="text-purple-600 text-sm mt-1">
                    {language === 'es' ? 'Quiz perfecto!' : 'Quiz perfektua!'}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/games')}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 inline mr-2" />
                {language === 'es' ? 'Volver' : 'Itzuli'}
              </button>
              <button
                onClick={restartGame}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
              >
                <RotateCcw className="w-5 h-5 inline mr-2" />
                {language === 'es' ? 'Jugar de nuevo' : 'Berriro jokatu'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/games')}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
              <Flame className="w-4 h-4" />
              {score}
            </span>
            <span className="inline-flex items-center px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">
              {score * 10} pts
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / TOTAL_QUESTIONS) * 100}%` }}
          />
        </div>

        {/* Audio player card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="text-right text-sm text-gray-500 mb-4">
            {language === 'es' ? 'Fácil' : 'Erraza'}
          </div>

          {/* Speaker icon */}
          <div className="flex justify-center mb-6">
            <button
              onClick={playAudio}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isPlaying
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-500'
              }`}
            >
              <Volume2 className={`w-12 h-12 ${isPlaying ? 'animate-pulse' : ''}`} />
            </button>
          </div>

          {/* Audio controls */}
          <audio
            ref={audioRef}
            src={currentQuestion.correctAnswer.audio_url}
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            controls
            className="w-full"
          />
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleAnswer(option.id)}
              disabled={showResult}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${getOptionStyle(option.id)}`}
            >
              <span className="font-medium">
                {language === 'es' ? option.title_es : option.title_eu}
              </span>
              {showResult && option.id === currentQuestion.correctAnswer.id && (
                <CheckCircle className="w-6 h-6 text-green-500" />
              )}
              {showResult && option.id === selectedAnswer && option.id !== currentQuestion.correctAnswer.id && (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
            </button>
          ))}
        </div>

        {/* Next button */}
        {showResult && (
          <button
            onClick={nextQuestion}
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            {currentIndex < questions.length - 1
              ? (language === 'es' ? 'Siguiente pregunta' : 'Hurrengo galdera')
              : (language === 'es' ? 'Ver resultados' : 'Emaitzak ikusi')}
          </button>
        )}
      </div>
    </div>
  );
}
