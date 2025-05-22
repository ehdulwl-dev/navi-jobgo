import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SignupForm from "../components/auth/SignupForm";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser } = useUser();

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        // First check user context
        if (user) {
          console.log("User already logged in via context:", user);
          navigate("/Index");
          return;
        }

        // Then check Supabase session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          console.log("User already logged in via Supabase:", session.user);

          // Update user context if needed
          const name = session.user.user_metadata?.name || "이메일 사용자";
          setUser({
            email: session.user.email,
            name,
          });

          navigate("/Index");
        } else {
          console.log("No active session found");
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };

    checkSession();
  }, [navigate, user, setUser]);

  const handleKakaoLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/kakao`;
  };

  const handleSkipLogin = () => {
    navigate("/Index");
  };

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      const { data: userInfo, error: userError } = await supabase
        .from("TB_USER")
        .select("name")
        .eq("email", email)
        .single();

      const name = userInfo?.name || "이메일 사용자";

      console.log("email:", email);
      console.log("name:", name);

      // Update user in context
      setUser({
        email,
        name,
      });

      // Also update session
      try {
        await fetch(`${API_BASE_URL}/session`, {
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
        console.log("Session updated successfully");
      } catch (sessionError) {
        console.error("Failed to update session:", sessionError);
      }

      toast.success("로그인이 완료되었습니다!");

      // If login is successful, redirect to Index
      navigate("/Index");
    } catch (err) {
      setError(err.message || "로그인 중 오류가 발생했습니다");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
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
      {/* 로고 */}
      <img src="/Navi-logo.svg" alt="logo" className="w-20 h-20 mb-2" />

      {/* 제목 */}
      <h1 className="text-2xl font-bold">로그인을 해주세rrrr.</h1>

      {/* 설명 */}
      <p className="text-m text-gray-600 max-w-xs leading-relaxed">
        기존에 사용하시는 계정으로 간단하게
        <br />
        <img
          src="/Navi-linear.svg"
          alt="Navi"
          className="h-3 inline-block align-baseline mr-1"
        />{" "}
        에 로그인 해주세요.
      </p>

      {/* 이메일/비밀번호 로그인 폼 */}
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
          className="w-full bg-app-blue text-white font-semibold py-3 rounded-md"
        >
          {isLoading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      {/* 회원가입 버튼 */}
      <button
        className="flex items-center justify-center gap-6 border border-app-blue px-5 py-4 rounded-lg text-m font-semibold w-[250px] h-[50px]"
        onClick={() => setIsSignupMode(true)}
      >
        <img
          src="/Navi-logo.svg"
          alt="logo"
          className="w-7 h-7 object-contain ml-1"
        />
        <span className="whitespace-nowrap">ID/PW 회원가입</span>
      </button>

      {/* 카카오 로그인 버튼 */}
      <button
        onClick={handleKakaoLogin}
        className="w-[300px] h-[20px] mt-3 p-0 border-none"
      >
        <img
          src="/kakao_login.png"
          style={{ transform: "scale(0.7)" }}
          className="w-full h-full object-contain rounded-lg"
        />
      </button>

      {/* 구분선 */}
      <div className="flex items-center w-[220px] my-4">
        <div className="flex-grow h-px bg-gray-300" />
        <span className="mx-2 text-sm text-gray-500">또는</span>
        <div className="flex-grow h-px bg-gray-300" />
      </div>

      {/* 로그인 없이 시작 */}
      <p
        className="text-sm text-gray-600 cursor-pointer hover:underline"
        onClick={handleSkipLogin}
      >
        로그인 없이 시작하기
      </p>
    </div>
  );
};

export default LoginPage;
