
import React from 'react';
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  text = "로딩 중...", 
  className = "h-8 w-8 text-blue-600" 
}) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Loader2 className={`animate-spin ${className}`} />
      {text && <p className="text-gray-600">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
