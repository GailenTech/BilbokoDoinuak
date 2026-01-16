import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface AuthButtonProps {
  variant?: 'full' | 'compact';
  className?: string;
}

export function AuthButton({ variant = 'full', className = '' }: AuthButtonProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, isSupabaseEnabled, isLoading: authLoading, signOut } = useAuth();
  const { language } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);

  // Don't show anything if Supabase is not configured
  if (!isSupabaseEnabled) {
    return null;
  }

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      </div>
    );
  }

  const handleSignIn = () => {
    // Navigate to login page instead of direct Google sign-in
    navigate('/login');
  };

  const handleSignOut = async () => {
    setIsProcessing(true);
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Sign out failed:', error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Authenticated state
  if (isAuthenticated && user) {
    const avatarUrl = user.user_metadata?.avatar_url;
    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';

    if (variant === 'compact') {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-8 h-8 rounded-full border-2 border-purple-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-sm font-medium text-purple-600">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <button
            onClick={handleSignOut}
            disabled={isProcessing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title={language === 'es' ? 'Cerrar sesion' : 'Saioa itxi'}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
          </button>
        </div>
      );
    }

    // Full variant
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-10 h-10 rounded-full border-2 border-purple-200"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-lg font-medium text-purple-600">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{displayName}</span>
          <button
            onClick={handleSignOut}
            disabled={isProcessing}
            className="text-xs text-gray-500 hover:text-purple-600 transition-colors text-left flex items-center gap-1"
          >
            {isProcessing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <LogOut className="w-3 h-3" />
            )}
            {language === 'es' ? 'Cerrar sesion' : 'Saioa itxi'}
          </button>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (variant === 'compact') {
    return (
      <button
        onClick={handleSignIn}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors ${className}`}
      >
        <LogIn className="w-4 h-4" />
      </button>
    );
  }

  // Full variant - Sign in button
  return (
    <button
      onClick={handleSignIn}
      className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-purple-300 transition-colors shadow-sm ${className}`}
    >
      <LogIn className="w-4 h-4" />
      {language === 'es' ? 'Entrar' : 'Sartu'}
    </button>
  );
}
