
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  name: string;
  email: string;
  phone: string | null;
  birthdate: string | null;
  address: string | null;
  gender: string | null;
  preferjob: string | null;
  preferlocate: string | null;
  prefertime: string | null;
  personality: string | null;
}

/**
 * Fetches the current authenticated user's profile
 */
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  try {
    // Get current session
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    
    if (!user?.email) {
      console.log('No authenticated user found');
      return null;
    }

    // Fetch user profile from TB_USER table
    const { data, error } = await supabase
      .from('TB_USER')
      .select('*')
      .eq('email', user.email)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getCurrentUserProfile:', error);
    return null;
  }
};

/**
 * Fetches a user profile by email
 */
export const getUserProfileByEmail = async (email: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('TB_USER')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching user profile by email:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfileByEmail:', error);
    return null;
  }
};
