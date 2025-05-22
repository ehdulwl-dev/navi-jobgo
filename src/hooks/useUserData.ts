
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useUserData = (userName?: string, isLoggedIn = false) => {
  const [fetchedUserName, setFetchedUserName] = useState<string | null>(null);
  const [preferredGu, setPreferredGu] = useState<string | null>(null);

  // 희망 지역 조회
  const getUserPreferredGu = async (email: string): Promise<string | null> => {
    const { data, error } = await supabase
      .from("TB_USER")
      .select("preferlocate")
      .eq("email", email)
      .single();

    if (error) {
      console.error("📛 사용자 희망 지역 조회 실패:", error.message);
      return null;
    }

    return data?.preferlocate || null;
  };

  const fetchUserNameAndGu = async () => {
    try {
      // Supabase에서 현재 로그인된 사용자 정보 가져오기
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData || !sessionData.session) {
        console.error("로그인된 사용자가 없습니다.");
        return;
      }
  
      const user = sessionData.session.user;
  
      setFetchedUserName(user.user_metadata?.name || user.user_metadata?.nickname || "");
  
      // 사용자 희망 지역 정보 가져오기
      const gu = await getUserPreferredGu(user.email);
      setPreferredGu(gu);
    } catch (err) {
      console.error("세션 요청 실패:", err);
    }
  };

  useEffect(() => {
    if (!userName && isLoggedIn) {
      fetchUserNameAndGu();
    }
  }, [userName, isLoggedIn]);

  const displayName = userName || fetchedUserName;
  
  return { displayName, preferredGu };
};
