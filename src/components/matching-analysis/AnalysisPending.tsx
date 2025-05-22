
import React from "react";
import { Button } from "@/components/ui/button";

interface AnalysisPendingProps {
  onRetry: () => void;
  isAnalyzing: boolean;
}

const AnalysisPending: React.FC<AnalysisPendingProps> = ({ 
  onRetry, 
  isAnalyzing 
}) => {
  return (
    <div className="text-center py-6">
      <p>분석 결과를 준비 중입니다.</p>
      <Button 
        onClick={onRetry}
        disabled={isAnalyzing}
        className="mt-4"
      >
        다시 시도하기
      </Button>
    </div>
  );
};

export default AnalysisPending;
