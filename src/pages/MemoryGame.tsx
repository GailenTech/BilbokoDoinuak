import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Volume2, RotateCcw } from 'lucide-react';
import soundPointsData from '../data/soundPoints.json';

interface SoundPoint {
  id: string;
  title_es: string;
  title_eu: string;
  audio_url: string;
  image_url: string;
}

interface Card {
  id: string;
  pairId: string;
  type: 'image' | 'audio';
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateCards(soundPoints: SoundPoint[], pairCount: number): Card[] {
  const selected = shuffleArray(soundPoints).slice(0, pairCount);
  const cards: Card[] = [];

  selected.forEach((point, index) => {
    // Image card
    cards.push({
      id: `img-${index}`,
      pairId: point.id,
      type: 'image',
      content: point.image_url,
      isFlipped: false,
      isMatched: false,
    });
    // Audio card
    cards.push({
      id: `audio-${index}`,
      pairId: point.id,
      type: 'audio',
      content: point.audio_url,
      isFlipped: false,
      isMatched: false,
    });
  });

  return shuffleArray(cards);
}

export function MemoryGame() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [_matches, setMatches] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const PAIR_COUNT = 6;

  useEffect(() => {
    const points = soundPointsData as SoundPoint[];
    setCards(generateCards(points, PAIR_COUNT));
  }, []);

  const playAudio = (audioUrl: string, cardId: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setPlayingAudioId(cardId);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingAudioId(null);
    }
  };

  const handleCardClick = (cardId: string) => {
    if (isChecking) return;

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    // If clicking an audio card, play its audio
    if (card.type === 'audio') {
      playAudio(card.content, cardId);
    }

    // Flip the card
    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    // Check for match if two cards are flipped
    if (newFlipped.length === 2) {
      setIsChecking(true);
      setMoves(prev => prev + 1);

      const [firstId, secondId] = newFlipped;
      const firstCard = newCards.find(c => c.id === firstId)!;
      const secondCard = newCards.find(c => c.id === secondId)!;

      if (firstCard.pairId === secondCard.pairId && firstCard.type !== secondCard.type) {
        // Match found!
        setTimeout(() => {
          stopAudio();
          setCards(prev =>
            prev.map(c =>
              c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c
            )
          );
          setMatches(prev => {
            const newMatches = prev + 1;
            if (newMatches === PAIR_COUNT) {
              setGameOver(true);
            }
            return newMatches;
          });
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          stopAudio();
          setCards(prev =>
            prev.map(c =>
              newFlipped.includes(c.id) && !c.isMatched
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
          setIsChecking(false);
        }, 1500);
      }
    }
  };

  const restartGame = () => {
    const points = soundPointsData as SoundPoint[];
    setCards(generateCards(points, PAIR_COUNT));
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameOver(false);
    stopAudio();
  };

  if (cards.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
        <p>{language === 'es' ? 'Cargando...' : 'Kargatzen...'}</p>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold mb-2">
              {language === 'es' ? '¡Felicidades!' : 'Zorionak!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {language === 'es'
                ? `Has completado el juego en ${moves} movimientos`
                : `Jokoa ${moves} mugimendu(etan) osatu duzu`}
            </p>
            <div className="text-3xl font-bold text-gray-900 mb-6">
              {moves} {language === 'es' ? 'MOVIMIENTOS' : 'MUGIMENDU'}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/games')}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                {language === 'es' ? 'Volver' : 'Itzuli'}
              </button>
              <button
                onClick={restartGame}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                {language === 'es' ? 'Reiniciar' : 'Berrabiarazi'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          onEnded={() => setPlayingAudioId(null)}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">
            {language === 'es' ? 'Juego de Memoria' : 'Memoria Jokoa'}
          </h1>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium">
              {language === 'es' ? 'MOVIMIENTOS' : 'MUGIMENDUAK'}
              <span className="font-bold text-lg">{moves}</span>
            </span>
            <button
              onClick={restartGame}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {language === 'es' ? 'Reiniciar' : 'Berrabiarazi'}
            </button>
          </div>
        </div>

        {/* Cards grid - 4x3 like original */}
        <div className="grid grid-cols-4 gap-4">
          {cards.map((card) => {
            const isAudio = card.type === 'audio';
            const baseColor = isAudio ? 'from-red-500 to-red-600' : 'from-blue-500 to-blue-600';
            const hoverColor = isAudio ? 'hover:from-red-600 hover:to-red-700' : 'hover:from-blue-600 hover:to-blue-700';

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={card.isFlipped || card.isMatched || isChecking}
                className={`aspect-square rounded-xl transition-all duration-300 transform ${
                  card.isFlipped || card.isMatched
                    ? isAudio
                      ? 'bg-red-50 border-2 border-red-200'
                      : 'bg-white shadow-lg'
                    : `bg-gradient-to-br ${baseColor} ${hoverColor} shadow-md hover:shadow-lg hover:scale-105`
                } ${card.isMatched ? 'opacity-50' : ''}`}
              >
                {(card.isFlipped || card.isMatched) ? (
                  card.type === 'image' ? (
                    <img
                      src={card.content}
                      alt=""
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                        playingAudioId === card.id ? 'bg-red-100' : 'bg-red-50'
                      }`}>
                        <Volume2
                          className={`w-8 h-8 ${
                            playingAudioId === card.id
                              ? 'text-red-600 animate-pulse'
                              : 'text-red-500'
                          }`}
                        />
                      </div>
                      <span className="text-red-600 text-sm font-medium uppercase">
                        {language === 'es' ? 'Sonido' : 'Soinua'}
                      </span>
                    </div>
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">?</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
