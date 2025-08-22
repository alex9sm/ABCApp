import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthError, AuthResponse } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { userProfileService } from './userProfileService';

// Comprehensive TypeScript types
export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

export interface AuthMethods {
  signInWithEmail: (email: string, password?: string) => Promise<AuthResponse>;
  signInWithMagicLink: (email: string) => Promise<{ data: any; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<{ data: { session: Session | null }; error: AuthError | null }>;
  checkSession: () => Promise<Session | null>;
}

export interface AuthContextType extends AuthState, AuthMethods {}

const defaultAuthState: AuthState = {
  user: null,
  session: null,
  loading: true,
  initialized: false,
};

const defaultAuthMethods: AuthMethods = {
  signInWithEmail: async () => ({ data: { user: null, session: null }, error: null }),
  signInWithMagicLink: async () => ({ data: null, error: null }),
  signOut: async () => ({ error: null }),
  refreshSession: async () => ({ data: { session: null }, error: null }),
  checkSession: async () => null,
};

const AuthContext = createContext<AuthContextType>({
  ...defaultAuthState,
  ...defaultAuthMethods,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Helper function to handle user sign-in and profile creation
    const handleUserSignIn = async (user: User) => {
      try {
        // Check if user profile exists
        const { exists, error: checkError } = await userProfileService.userProfileExists(user.id);
        
        if (checkError) {
          console.error('Error checking user profile existence:', checkError);
          return;
        }

        // If profile doesn't exist, create it
        if (!exists && user.email) {
          console.log('Creating user profile for new user:', user.email);
          
          const { data: profile, error: createError } = await userProfileService.createUserProfile({
            id: user.id,
            email: user.email,
            home_store_id: '', // User will need to set this in their profile
            notifications_enabled: true,
          });

          if (createError) {
            console.error('Error creating user profile:', createError);
          } else {
            console.log('User profile created successfully:', profile);
          }
        }
      } catch (error) {
        console.error('Error in handleUserSignIn:', error);
      }
    };

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) {
            console.error('Error getting session:', error);
          }
          
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Handle automatic profile creation for new users
        if (event === 'SIGNED_IN' && session?.user) {
          await handleUserSignIn(session.user);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        setInitialized(true);
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Authentication methods
  const signInWithEmail = async (email: string, password?: string): Promise<AuthResponse> => {
    try {
      if (password) {
        // Sign in with email and password
        return await supabase.auth.signInWithPassword({ email, password });
      } else {
        // Sign in with email only (passwordless)
        const { data, error } = await supabase.auth.signInWithOtp({ email });
        return { data: data as any, error };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: { user: null, session: null }, error: error as AuthError };
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: 'abcapp://auth',
        },
      });
      
      return { data, error };
    } catch (error) {
      console.error('Magic link error:', error);
      return { data: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error as AuthError };
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      return { data, error };
    } catch (error) {
      console.error('Refresh session error:', error);
      return { data: { session: null }, error: error as AuthError };
    }
  };

  const checkSession = async (): Promise<Session | null> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Check session error:', error);
        return null;
      }
      return session;
    } catch (error) {
      console.error('Check session error:', error);
      return null;
    }
  };

  const value: AuthContextType = {
    // State
    user,
    session,
    loading,
    initialized,
    // Methods
    signInWithEmail,
    signInWithMagicLink,
    signOut,
    refreshSession,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};