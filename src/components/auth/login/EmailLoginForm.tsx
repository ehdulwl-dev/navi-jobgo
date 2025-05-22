
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const EmailLoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useUser();

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 상태 초기화
      setIsLoading(true);
      setError(null);

      // Supabase 인증
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // 사용자 정보 가져오기
      const { data: userInfo, error: userError } = await supabase
        .from("TB_USER")
        .select("name")
        .eq("email", email)
        .single();

      if (userError) {
        console.error("사용자 정보 조회 실패:", userError);
        throw new Error("사용자 정보를 불러오는데 실패했습니다");
      }

      const name = userInfo?.name || "이메일 사용자";

      console.log("email:", email);
      console.log("name:", name);

      // 컨텍스트 사용자 업데이트
      setUser({
        email,
        name,
      });

      // 서버 세션 업데이트 시도 (실패해도 계속 진행)
      try {
        const sessionResponse = await fetch(`${API_BASE_URL}/session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            user: {
              email,
              name,
            },
          }),
        });
        
        if (sessionResponse.ok) {
          console.log("세션이 성공적으로 업데이트되었습니다");
        } else {
          console.warn("세션 업데이트 실패, 하지만 로그인은 계속 진행됩니다");
        }
      } catch (sessionError) {
        console.warn("세션 업데이트 중 오류가 발생했지만, 로그인은 계속 진행됩니다:", sessionError);
      }

      toast.success("로그인이 완료되었습니다!");

      // 로그인 성공 시 Index로 리디렉션
      navigate("/Index");
    } catch (err: any) {
      let errorMessage = "로그인 중 오류가 발생했습니다";
      
      // 자세한 오류 메시지 표시
      if (err.message) {
        if (err.message.includes("Invalid login credentials")) {
          errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다";
        } else if (err.message.includes("Email not confirmed")) {
          errorMessage = "이메일 인증이 필요합니다";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      console.error("로그인 오류:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleEmailPasswordLogin} className="w-full max-w-[250px]">
      <input
        type="email"
        placeholder="이메일"
        className="w-full mb-3 p-3 border rounded-md"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
        required
      />
      <input
        type="password"
        placeholder="비밀번sss호"
        className="w-full mb-3 p-3 border rounded-md"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
        required
      />

      {error && (
        <Alert variant="destructive" className="mb-3 py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs ml-2">{error}</AlertDescription>
        </Alert>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-app-blue text-white font-semibold py-3 rounded-md h-[50px] relative"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <LoadingSpinner text="" className="h-5 w-5 text-white" />
            <span className="ml-2">로그인 중...</span>
          </div>
        ) : (
          "로그인"
        )}
      </button>
    </form>
  );
};

export default EmailLoginForm;
