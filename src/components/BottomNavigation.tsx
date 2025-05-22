import React from "react";
import { Link, useLocation } from "react-router-dom";

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { path: "/index", label: "홈", icon: "home" },
    { path: "/favorites", label: "관심 공고", icon: "star" },
    { path: "/cover-letter", label: "자기소개서", icon: "ai" },
    { path: "/resume", label: "이력서", icon: "resume" },
    { path: "/profile", label: "내 정보", icon: "info" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 py-3 px-4 flex justify-between items-center max-w-lg mx-auto z-50">
      {navItems.map((item) => {
        const isActive = path === item.path;
        const iconSrc = `/icons/${item.icon}${isActive ? "-active" : ""}.svg`;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col justify-center items-center text-center gap-y-1 flex-1 min-w-0 ${
              isActive ? "text-app-blue" : "text-gray-500"
            }`}
          >
            <img
              src={iconSrc}
              className="w-7 h-7 object-contain block mx-auto"
              alt={item.label}
            />
            <span className="text-sm">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNavigation;
