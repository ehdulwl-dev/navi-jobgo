
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

const LoginBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl p-4 my-4 shadow-sm border border-blue-200">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-bold text-lg text-blue-700">나와 적합한 공고를 확인해보세요</h3>
          <p className="text-blue-600 text-sm">회원가입하고 맞춤 일자리 정보를 받아보세요.</p>
        </div>
        <Button 
          onClick={() => navigate("/LoginPage")} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          회원가입
        </Button>
      </div>
    </div>
  );
};

export default LoginBanner;
