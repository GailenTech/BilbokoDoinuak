import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { PersistenceProvider } from './context/PersistenceContext';
import { Header } from './components/Header';
import { ProfileForm } from './components/ProfileForm';
import { HomeRouter } from './pages/HomeRouter';
import { MapPage } from './pages/MapPage';
import { RoutesPage } from './pages/RoutesPage';
import { GamesPage } from './pages/GamesPage';
import { QuizGame } from './pages/QuizGame';
import { MemoryGame } from './pages/MemoryGame';
import { AdminPage } from './pages/AdminPage';

function App() {
  return (
    <LanguageProvider>
      <PersistenceProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-white">
          <Header />
          <Routes>
            <Route path="/" element={<HomeRouter />} />
            <Route path="/profile" element={<ProfileForm />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/games/quiz" element={<QuizGame />} />
            <Route path="/games/memory" element={<MemoryGame />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
      </BrowserRouter>
      </PersistenceProvider>
    </LanguageProvider>
  );
}

export default App;
