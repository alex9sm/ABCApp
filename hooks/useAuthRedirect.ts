import { router } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useAuthRedirect = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, redirect to main app
        router.replace('/');
      } else {
        // User is not authenticated, redirect to sign in
        router.replace('/signin');
      }
    }
  }, [user, loading]);
};
