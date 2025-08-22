import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = "https://kerjdglezcovvfltfjkw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlcmpkZ2xlemNvdnZmbHRmamt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NTg3MTksImV4cCI6MjA3MDMzNDcxOX0.4mtoI2NjSyTjP01VSvWZzd2keW1hCRfp9zsU10xZANY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
