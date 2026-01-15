import { usePersistence } from '../context/PersistenceContext';
import { Home } from './Home';
import { HomePage } from './HomePage';

/**
 * Smart router for the home page:
 * - First visit (no profile): Show language selector + redirect to profile
 * - Return visit (profile complete): Show main menu with cards
 */
export function HomeRouter() {
  const { isProfileComplete, isLoading } = usePersistence();

  // Show loading state briefly
  if (isLoading) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">...</div>
      </main>
    );
  }

  // If profile is complete, show the main HomePage with menu
  if (isProfileComplete) {
    return <HomePage />;
  }

  // If no profile, show the welcome/language selector
  return <Home />;
}
