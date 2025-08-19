import { User as SupabaseUser } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, AuthState, User } from '../types/auth';
import { supabase } from '../utils/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  // Fetch user profile from public.users table
  const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user).then((userProfile) => {
          setState({
            user: userProfile,
            session,
            loading: false,
          });
        });
      } else {
        setState({
          user: null,
          session: null,
          loading: false,
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user);
          setState({
            user: userProfile,
            session,
            loading: false,
          });
        } else {
          setState({
            user: null,
            session: null,
            loading: false,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string): Promise<{ error: any | null }> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        }
      });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    // The auth state change listener will handle the routing
  };

  const resetPassword = async (email: string): Promise<{ error: any | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ error: any | null }> => {
    try {
      if (!state.user) {
        return { error: new Error('No user logged in') };
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', state.user.id);

      if (!error) {
        // Update local state
        setState(prev => ({
          ...prev,
          user: prev.user ? { ...prev.user, ...updates } : null,
        }));
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const value: AuthContextType = {
    ...state,
    signInWithEmail,
    signOut,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
