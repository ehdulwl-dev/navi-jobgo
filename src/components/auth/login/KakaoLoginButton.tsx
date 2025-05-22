
import React from "react";

interface KakaoLoginButtonProps {
  onLogin: () => void;
}

const KakaoLoginButton: React.FC<KakaoLoginButtonProps> = ({ onLogin }) => {
  return (
    <button
      onClick={onLogin}
      className="w-[250px] h-[50px] mt-3 p-0 border-none flex items-center justify-center"
    >
      <img
        src="/kakao_login.png"
        className="w-full h-full object-contain rounded-lg"
        alt="Kakao Login"
      />
    </button>
  );
};

export default KakaoLoginButton;
