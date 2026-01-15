import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';

interface AuthContextValue {
  // Auth state
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSupabaseEnabled: boolean;

  // Auth actions
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  // Initialize auth state
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with Google OAuth
  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: { message: 'Supabase is not configured' } as AuthError };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      return { error };
    } catch (err) {
      console.error('[AuthContext] Sign in error:', err);
      return { error: err as AuthError };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: { message: 'Supabase is not configured' } as AuthError };
    }

    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err) {
      console.error('[AuthContext] Sign out error:', err);
      return { error: err as AuthError };
    }
  }, []);

  const value: AuthContextValue = useMemo(() => ({
    user,
    session,
    isLoading,
    isAuthenticated: user !== null,
    isSupabaseEnabled: isSupabaseConfigured,
    signInWithGoogle,
    signOut,
  }), [user, session, isLoading, signInWithGoogle, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
