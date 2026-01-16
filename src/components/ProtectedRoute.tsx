import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePersistence } from '../context/PersistenceContext';
import { LoginPage } from '../pages/LoginPage';

interface ProtectedRouteProps {
  children: ReactNode;
  requireProfile?: boolean;
}

export function ProtectedRoute({ children, requireProfile = true }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading: authLoading, isSupabaseEnabled } = useAuth();
  const { isProfileComplete, isLoading: profileLoading } = usePersistence();
  const location = useLocation();
  const navigate = useNavigate();

  const isLoading = authLoading || profileLoading;

  // Redirect to profile if authenticated but profile not complete
  useEffect(() => {
    if (isSupabaseEnabled && isAuthenticated && !profileLoading && !isProfileComplete && requireProfile) {
      // Don't redirect if already on profile page
      if (location.pathname !== '/profile') {
        navigate('/profile', { replace: true });
      }
    }
  }, [isSupabaseEnabled, isAuthenticated, profileLoading, isProfileComplete, requireProfile, location.pathname, navigate]);

  // If Supabase is not configured, show content (dev mode)
  if (!isSupabaseEnabled) {
    return <>{children}</>;
  }

  // Show loading while checking auth or profile
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    );
  }

  // Not authenticated - show login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Authenticated but profile not complete and profile is required - show loading while redirecting
  if (!isProfileComplete && requireProfile && location.pathname !== '/profile') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    );
  }

  // Authenticated - show content
  return <>{children}</>;
}
