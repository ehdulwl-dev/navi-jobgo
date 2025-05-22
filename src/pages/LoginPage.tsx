import logo from "@/assets/logo/logo.png";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SignupForm from "../components/auth/SignupForm";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { useLocation } from "react-router-dom";

// 컴포넌트 분리 구조
import LoginHeader from "@/components/auth/login/LoginHeader";
import LoginDivider from "@/components/auth/login/LoginDivider";
import SkipLoginLink from "@/components/auth/login/SkipLoginLink";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser } = useUser();

  const location = useLocation();

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // 이미 로그인된 사용자 처리
  useEffect(() => {
    if (location.state?.reset) {
      setIsSignupMode(false);
      navigate("/LoginPage", { replace: true, state: {} });
      return;
    }

    const checkSession = async () => {
      try {
        if (user) {
          navigate("/Index");
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          const name = session.user.user_metadata?.name || "이메일 사용자";
          setUser({ email: session.user.email, name });
          navigate("/Index");
        }
      } catch (err) {
        console.error("세션 확인 오류:", err);
      }
    };

    checkSession();
  }, [navigate, user, setUser, location.state]);

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: userInfo, error: userError } = await supabase
        .from("TB_USER")
        .select("name")
        .eq("email", email)
        .single();

      const name = userInfo?.name || "이메일 사용자";
      setUser({ email, name });

      toast.success("로그인이 완료되었습니다!");
      navigate("/Index");
    } catch (err: any) {
      setError(err.message || "로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/kakao`;
  };

  const handleSkipLogin = () => {
    navigate("/Index");
  };

  if (isSignupMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center space-y-4">
        <SignupForm onBack={() => setIsSignupMode(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center space-y-4">
      <LoginHeader />

      {/* 이메일 로그인 폼 */}
      <form onSubmit={handleEmailPasswordLogin} className="w-full max-w-xs">
        <input
          type="email"
          placeholder="이메일"
          className="w-full mb-3 p-3 border rounded-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          className="w-full mb-3 p-3 border rounded-md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-500 text-sm mb-3">{error}</div>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full text-white font-semibold py-3 rounded-md"
          style={{ backgroundColor: "#399cff" }}
        >
          {isLoading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      {/* 회원가입 버튼 */}
      <button
        className="flex items-center justify-center gap-6 border border-app-blue px-5 py-4 rounded-lg text-m font-semibold w-[200px] h-[50px]"
        onClick={() => setIsSignupMode(true)}
      >
        <img src={logo} alt="logo" className="w-7 h-7 object-contain ml-1" />
        <span className="whitespace-nowrap">ID/PW 회원가입</span>
      </button>

      {/* 카카오 로그인 버튼 */}
      <button
        onClick={handleKakaoLogin}
        className="w-[300px] h-[50px] mt-3 p-0 border-none"
      >
        <img
          src="/kakao_login.png"
          className="w-full h-full object-contain rounded-lg"
        />
      </button>

      <LoginDivider />

      <SkipLoginLink onClick={handleSkipLogin} />
    </div>
  );
};

export default LoginPage;
