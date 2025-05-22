
import logo from "@/assets/logo/logo.png";
import logo_land from "@/assets/logo/logo_land.png";

import React from "react";

const LoginHeader: React.FC = () => {
  return (
    <>
      {/* 로고 */}
      <img src={logo} alt="logo" className="w-30 h-30 mb-2" />

      {/* 제목 */}
      <h1 className="text-2xl font-bold">로그인을 해주세요.</h1>

      {/* 설명 */}
      <p className="text-m text-gray-600 max-w-xs leading-relaxed">
        기존에 사용하시는 계정으로 간단하게{" "}
        <span className="inline-flex items-center align-middle">
          <img
            src={logo_land}
            alt="Navi"
            className="h-4 w-auto mr-1"
            style={{ verticalAlign: "middle" }}
          />
        </span>{" "}
        에 로그인 해주세요.
      </p>
    </>
  );
};

export default LoginHeader;
