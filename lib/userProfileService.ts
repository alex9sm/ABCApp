import { supabase } from './supabase';

// TypeScript types for user profile
export interface UserProfile {
  id: string;
  email: string;
  home_store_id: string;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserProfileData {
  id: string; // auth.users id
  email: string;
  home_store_id: string;
  notifications_enabled?: boolean;
}

export interface UpdateUserProfileData {
  email?: string;
  home_store_id?: string;
  notifications_enabled?: boolean;
}

export interface UserProfileServiceError {
  message: string;
  code?: string;
  details?: any;
}

export interface UserProfileResponse<T = UserProfile> {
  data: T | null;
  error: UserProfileServiceError | null;
}

export interface UserProfileListResponse {
  data: UserProfile[] | null;
  error: UserProfileServiceError | null;
}

class UserProfileService {
  /**
   * Creates a new user profile in the public.users table
   * Called automatically when a user signs up via magic link
   */
  async createUserProfile(profileData: CreateUserProfileData): Promise<UserProfileResponse> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: profileData.id,
          email: profileData.email,
          home_store_id: profileData.home_store_id,
          notifications_enabled: profileData.notifications_enabled ?? true,
        }])
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: {
            message: 'Failed to create user profile',
            code: error.code,
            details: error.message,
          },
        };
      }

      return {
        data: data as UserProfile,
        error: null,
      };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: 'Unexpected error creating user profile',
          details: error.message,
        },
      };
    }
  }

  /**
   * Fetches user profile data by user ID
   */
  async getUserProfile(userId: string): Promise<UserProfileResponse> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            data: null,
            error: {
              message: 'User profile not found',
              code: 'PROFILE_NOT_FOUND',
            },
          };
        }

        return {
          data: null,
          error: {
            message: 'Failed to fetch user profile',
            code: error.code,
            details: error.message,
          },
        };
      }

      return {
        data: data as UserProfile,
        error: null,
      };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: 'Unexpected error fetching user profile',
          details: error.message,
        },
      };
    }
  }

  /**
   * Fetches user profile data by email
   */
  async getUserProfileByEmail(email: string): Promise<UserProfileResponse> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            data: null,
            error: {
              message: 'User profile not found',
              code: 'PROFILE_NOT_FOUND',
            },
          };
        }

        return {
          data: null,
          error: {
            message: 'Failed to fetch user profile',
            code: error.code,
            details: error.message,
          },
        };
      }

      return {
        data: data as UserProfile,
        error: null,
      };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: 'Unexpected error fetching user profile',
          details: error.message,
        },
      };
    }
  }

  /**
   * Updates user profile information
   */
  async updateUserProfile(userId: string, updates: UpdateUserProfileData): Promise<UserProfileResponse> {
    try {
      // Remove undefined values from updates
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      );

      if (Object.keys(cleanUpdates).length === 0) {
        return {
          data: null,
          error: {
            message: 'No valid fields to update',
            code: 'NO_UPDATES',
          },
        };
      }

      const { data, error } = await supabase
        .from('users')
        .update(cleanUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: {
            message: 'Failed to update user profile',
            code: error.code,
            details: error.message,
          },
        };
      }

      return {
        data: data as UserProfile,
        error: null,
      };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: 'Unexpected error updating user profile',
          details: error.message,
        },
      };
    }
  }

  /**
   * Checks if a user profile exists for the given user ID
   */
  async userProfileExists(userId: string): Promise<{ exists: boolean; error: UserProfileServiceError | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { exists: false, error: null };
        }

        return {
          exists: false,
          error: {
            message: 'Failed to check user profile existence',
            code: error.code,
            details: error.message,
          },
        };
      }

      return { exists: !!data, error: null };
    } catch (error: any) {
      return {
        exists: false,
        error: {
          message: 'Unexpected error checking user profile existence',
          details: error.message,
        },
      };
    }
  }

  /**
   * Deletes a user profile (use with caution)
   */
  async deleteUserProfile(userId: string): Promise<{ success: boolean; error: UserProfileServiceError | null }> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        return {
          success: false,
          error: {
            message: 'Failed to delete user profile',
            code: error.code,
            details: error.message,
          },
        };
      }

      return { success: true, error: null };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: 'Unexpected error deleting user profile',
          details: error.message,
        },
      };
    }
  }

  /**
   * Creates or updates a user profile (upsert operation)
   */
  async upsertUserProfile(profileData: CreateUserProfileData): Promise<UserProfileResponse> {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert([{
          id: profileData.id,
          email: profileData.email,
          home_store_id: profileData.home_store_id,
          notifications_enabled: profileData.notifications_enabled ?? true,
        }])
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: {
            message: 'Failed to upsert user profile',
            code: error.code,
            details: error.message,
          },
        };
      }

      return {
        data: data as UserProfile,
        error: null,
      };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: 'Unexpected error upserting user profile',
          details: error.message,
        },
      };
    }
  }
}

// Export singleton instance
export const userProfileService = new UserProfileService();