
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface AnalysisErrorProps {
  error: string;
  onRetry: () => void;
  isAnalyzing: boolean;
}

const AnalysisError: React.FC<AnalysisErrorProps> = ({ 
  error, 
  onRetry, 
  isAnalyzing 
}) => {
  return (
    <div className="text-center py-6 bg-gray-50 rounded-md">
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>{error}</AlertTitle>
        <AlertDescription>
          분석 기능에 일시적인 문제가 있습니다.
        </AlertDescription>
      </Alert>
      <Button 
        onClick={onRetry}
        disabled={isAnalyzing}
        className="flex items-center gap-2 mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
      >
        <RefreshCw size={16} className={isAnalyzing ? "animate-spin" : ""} />
        {isAnalyzing ? "분석 중..." : "다시 시도하기"}
      </Button>
    </div>
  );
};

export default AnalysisError;
