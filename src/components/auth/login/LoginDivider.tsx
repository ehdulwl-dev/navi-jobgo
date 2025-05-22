
import React from "react";

const LoginDivider: React.FC = () => {
  return (
    <div className="flex items-center w-[220px] my-4">
      <div className="flex-grow h-px bg-gray-300" />
      <span className="mx-2 text-sm text-gray-500">또는</span>
      <div className="flex-grow h-px bg-gray-300" />
    </div>
  );
};

export default LoginDivider;
