
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  name: string;
  email: string;
  phone: string | null;
  birthdate: string | null;
  address: string | null;
  gender: string | null;
}

/**
 * Fetches a user profile by email
 * @deprecated Use getCurrentUserProfile from profile.ts instead
 */
export const getUserProfile = async (email: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('TB_USER')
      .select('name, email, phone, birthdate, address, gender')
      .eq('email', email)
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
