import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import * as Linking from 'expo-linking'

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key)
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value)
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key)
  },
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Types for deep link handling
export interface DeepLinkResult {
  success: boolean;
  error?: string;
  isAuthLink?: boolean;
}

// Enhanced deep link handler for magic link redirects
export const handleDeepLink = async (url: string): Promise<DeepLinkResult> => {
  try {
    console.log('Processing deep link:', url);
    
    const parsedUrl = Linking.parse(url);
    console.log('Parsed URL:', parsedUrl);
    
    // Check if this is an auth-related deep link
    if (parsedUrl.hostname === 'auth' || parsedUrl.path?.includes('auth')) {
      const { queryParams } = parsedUrl;
      
      // Handle magic link authentication
      if (queryParams?.access_token && queryParams?.refresh_token) {
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: queryParams.access_token as string,
            refresh_token: queryParams.refresh_token as string,
          });
          
          if (error) {
            console.error('Error setting session from deep link:', error);
            return {
              success: false,
              error: error.message || 'Failed to authenticate with magic link',
              isAuthLink: true,
            };
          }
          
          console.log('Successfully authenticated via magic link:', data.user?.email);
          return {
            success: true,
            isAuthLink: true,
          };
        } catch (error: any) {
          console.error('Error processing magic link session:', error);
          return {
            success: false,
            error: 'Invalid or expired magic link',
            isAuthLink: true,
          };
        }
      }
      
      // Handle error cases in auth links
      if (queryParams?.error) {
        console.error('Auth error from deep link:', queryParams.error_description || queryParams.error);
        return {
          success: false,
          error: queryParams.error_description as string || 'Authentication failed',
          isAuthLink: true,
        };
      }
      
      // Handle other auth-related links without tokens
      return {
        success: false,
        error: 'Invalid magic link format',
        isAuthLink: true,
      };
    }
    
    // Not an auth link
    return {
      success: true,
      isAuthLink: false,
    };
  } catch (error: any) {
    console.error('Error handling deep link:', error);
    return {
      success: false,
      error: 'Failed to process link',
      isAuthLink: false,
    };
  }
};

// Helper function to check if a URL is a magic link
export const isMagicLink = (url: string): boolean => {
  try {
    const parsedUrl = Linking.parse(url);
    return parsedUrl.hostname === 'auth' || parsedUrl.path?.includes('auth') || false;
  } catch {
    return false;
  }
};