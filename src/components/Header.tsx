import logo from "@/assets/logo/logo_land_eng.png";
import React from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";

interface HeaderProps {
  title: string;
  onBack?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  subText?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  onRefresh,
  refreshing,
  subText,
}) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white py-4 px-4 border-b">
      <div className="flex justify-center mb-6">
        <Link to="/index">
          <img src={logo} alt="Navi Logo" className="h-10"/>
        </Link>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <button
            onClick={() => {
              if (window.history.length > 2) {
                navigate(-1);
              } else {
                navigate("/index");
              }
            }}
            className="mr-2"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        {/* 
        {onRefresh ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
          </Button>
        ) : (
          <div className="w-6" /> // 버튼 없을 때 공간 유지용
        )} */}
      </div>

      {subText && <div className="text-center text-gray-500">{subText}</div>}
    </header>
  );
};

export default Header;
