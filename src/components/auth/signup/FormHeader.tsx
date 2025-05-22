
import logo from "@/assets/logo/logo.png";
import React from "react";

interface FormHeaderProps {
  title: string;
  subtitle: string;
}

const FormHeader: React.FC<FormHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="flex flex-col items-center mb-6">
      <img 
        src={logo}
        alt="Navi Logo" 
        className="w-16 h-16 mb-2" 
      />
      <h1 className="text-2xl font-bold mb-1">{title}</h1>
      <p className="text-gray-600 text-center">{subtitle}</p>
    </div>
  );
};

export default FormHeader;
