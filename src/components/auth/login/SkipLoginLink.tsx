
import React from "react";

interface SkipLoginLinkProps {
  onClick: () => void;
}

const SkipLoginLink: React.FC<SkipLoginLinkProps> = ({ onClick }) => {
  return (
    <p
      className="text-sm text-gray-600 cursor-pointer hover:underline"
      onClick={onClick}
    >
      로그인 없이 시작하기
    </p>
  );
};

export default SkipLoginLink;
