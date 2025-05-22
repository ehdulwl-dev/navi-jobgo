
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const registerUser = async (
  fullEmail: string, 
  password: string, 
  userData: {
    name: string;
    gender?: string;
    birthdate: string | null;
    phone?: string;
    address: string;
    preferjob: string | null;
    preferlocate: string | null;
    prefertime: string | null;
    personality: string | null;
  }
) => {
  console.log("Registering user with email:", fullEmail);
  console.log("User data:", userData);

  // 1. Create the user in Supabase Auth WITHOUT email verification
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: fullEmail,
    password: password,
    options: {
      data: {
        name: userData.name,
      },
      // Explicitly disable email verification
      emailRedirectTo: undefined,
    }
  });

  if (authError) {
    console.error("Auth error:", authError);
    throw authError;
  }
  
  console.log("Auth data:", authData);
  
  if (!authData.user) {
    throw new Error("유저 생성 실패");
  }

  try {
    // 2. Insert user data into TB_USER table
    const { error: userError } = await supabase
      .from('TB_USER')
      .insert({
        name: userData.name,
        gender: userData.gender,
        birthdate: userData.birthdate,
        phone: userData.phone,
        address: userData.address,
        email: fullEmail,
        preferjob: userData.preferjob,
        preferlocate: userData.preferlocate,
        prefertime: userData.prefertime,
        personality: userData.personality
      });

    if (userError) {
      console.error("Error inserting into TB_USER:", userError);
      throw userError;
    }
    
    console.log("User successfully registered in TB_USER");
    return authData;

  } catch (error) {
    console.error("Error in registerUser:", error);
    throw error;
  }
};

export const loginAfterSignup = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw error;
  }
  
  toast.success("회원가입이 완료되었습니다!");
  return true;
};
