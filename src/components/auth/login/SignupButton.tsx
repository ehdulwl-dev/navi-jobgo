
import React from "react";

interface SignupButtonProps {
  onClick: () => void;
}

const SignupButton: React.FC<SignupButtonProps> = ({ onClick }) => {
  return (
    <button 
      className="flex items-center justify-center gap-2 border border-app-blue px-5 py-4 rounded-lg text-m font-semibold w-[250px] h-[50px]"
      onClick={onClick}
    >
      <img
        src="/Navi-logo.svg"
        alt="logo"
        className="w-6 h-6 object-contain"
      />
      <span className="whitespace-nowrap">ID/PW 회원가입</span>
    </button>
  );
};

export default SignupButton;
