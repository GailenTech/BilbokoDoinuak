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
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
      <PersistenceProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-white">
          <Header />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes - require authentication */}
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
            <Route path="/games/profile" element={
              <ProtectedRoute>
                <ProfilePage />
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
