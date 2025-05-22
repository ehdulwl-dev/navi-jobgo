
import React from "react";

interface AnalysisLoadingProps {
  message?: string;
}

const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({ 
  message = "자격 요건 분석 중..." 
}) => {
  return (
    <div className="text-center py-10 space-y-4">
      <div className="animate-pulse bg-gray-200 h-12 w-full rounded-md"></div>
      <div className="animate-pulse bg-gray-200 h-12 w-full rounded-md"></div>
      <p className="text-gray-500 mt-2">{message}</p>
    </div>
  );
};

export default AnalysisLoading;
