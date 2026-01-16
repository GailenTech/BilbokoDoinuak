import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { PersistenceProvider } from './context/PersistenceContext';
import { Header } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ProfileForm } from './components/ProfileForm';
import { Home } from './pages/Home';
import { HomePage } from './pages/HomePage';
import { MapPage } from './pages/MapPage';
import { RoutesPage } from './pages/RoutesPage';
import { GamesPage } from './pages/GamesPage';
import { QuizGame } from './pages/QuizGame';
import { MemoryGame } from './pages/MemoryGame';
import { MissionsPage } from './pages/MissionsPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { AdminPage } from './pages/AdminPage';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
      <PersistenceProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-white">
          <Header />
          <Routes>
            {/* Public route - Home/Welcome page */}
            <Route path="/" element={<Home />} />

            {/* Protected routes - require authentication */}
            <Route path="/home" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfileForm />
              </ProtectedRoute>
            } />
            <Route path="/map" element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            } />
            <Route path="/routes" element={
              <ProtectedRoute>
                <RoutesPage />
              </ProtectedRoute>
            } />
            <Route path="/games" element={
              <ProtectedRoute>
                <GamesPage />
              </ProtectedRoute>
            } />
            <Route path="/games/quiz" element={
              <ProtectedRoute>
                <QuizGame />
              </ProtectedRoute>
            } />
            <Route path="/games/memory" element={
              <ProtectedRoute>
                <MemoryGame />
              </ProtectedRoute>
            } />
            <Route path="/games/missions" element={
              <ProtectedRoute>
                <MissionsPage />
              </ProtectedRoute>
            } />
            <Route path="/games/collections" element={
              <ProtectedRoute>
                <CollectionsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </BrowserRouter>
      </PersistenceProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
