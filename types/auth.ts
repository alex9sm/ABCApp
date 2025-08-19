export interface User {
  id: string;
  email: string;
  home_store_id: string;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  product_code: string;
  product_name: string;
  product_image_url?: string;
  inventory_data: any; // JSONB data
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
}

export interface AuthContextType extends AuthState {
  signInWithEmail: (email: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
  updateProfile: (updates: Partial<User>) => Promise<{ error: any | null }>;
}
