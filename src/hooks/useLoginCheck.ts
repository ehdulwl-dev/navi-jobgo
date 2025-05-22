
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";

export const useLoginCheck = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  // 사용자가 이미 로그인되어 있는지 확인
  useEffect(() => {
    const checkSession = async () => {
      try {
        // 먼저 사용자 컨텍스트 확인
        if (user) {
          console.log("사용자가 이미 컨텍스트를 통해 로그인됨:", user);
          return;
        }

        // Supabase 세션 확인
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Supabase를 통해 사용자 로그인:", session.user);

          // 필요한 경우 사용자 컨텍스트 업데이트
          try {
            // 사용자 정보 조회
            const { data: userData, error: userError } = await supabase
              .from("TB_USER")
              .select("name")
              .eq("email", session.user.email || "")
              .single();

            if (userError) {
              console.warn("사용자 정보 조회 실패:", userError);
            }

            const name = userData?.name || session.user.user_metadata?.name || "이메일 사용자";
            
            setUser({
              email: session.user.email || "",
              name,
            });
          } catch (error) {
            console.error("사용자 정보 조회 중 오류:", error);
          }
        } else {
          console.log("활성 세션을 찾을 수 없음");
        }
      } catch (error) {
        console.error("세션 확인 중 오류:", error);
      }
    };

    checkSession();
  }, [navigate, user, setUser]);
};
