import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { MapPage } from './pages/MapPage';
import { RoutesPage } from './pages/RoutesPage';
import { GamesPage } from './pages/GamesPage';
import { AdminPage } from './pages/AdminPage';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
