
import { useState } from "react";
import { toast } from "sonner";
import { 
  analyzeJobDirectly, 
  hasErrorMessages,
  JobAnalysisResult
} from "../../services/jobs/directAnalysisService";
import { 
  extractClarificationQuestions,
  hasClarificationQuestions
} from "../../services/jobs/analysis/analysisUtils";
import { saveJobAnalysisToCache } from "../../services/jobs/analysis/cacheUtils";

interface UseJobAnalysisResult {
  isAnalyzing: boolean;
  error: string | null;
  analyzeJob: (jobId: string) => Promise<{
    result: JobAnalysisResult | null;
    clarificationQuestions: any[];
    needsClarification: boolean;
  }>;
}

export const useJobAnalysis = (): UseJobAnalysisResult => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeJob = async (jobId: string) => {
    console.log("Analysis triggered for job:", jobId);
    
    try {
      setError(null);
      setIsAnalyzing(true);
      
      console.log(`Analyzing job ${jobId} directly with OpenAI`);
      const result = await analyzeJobDirectly(jobId);
      
      if (!result) {
        setError("분석 서비스를 현재 이용할 수 없습니다");
        toast.error("공고 분석 서비스를 현재 이용할 수 없습니다.");
        return { result: null, clarificationQuestions: [], needsClarification: false };
      }
      
      // Check for error messages in the result
      if (hasErrorMessages(result)) {
        toast.error("공고 분석에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
        setError("분석 서비스 일시적 오류");
        return { result, clarificationQuestions: [], needsClarification: false };
      }
      
      console.log("Analysis API type:", result.apiType);
      
      // work24 API 유형은 추가 질문이 필요 없음
      if (result.apiType === "work24") {
        // Save to cache
        saveJobAnalysisToCache(jobId, result);
        return { 
          result, 
          clarificationQuestions: [], 
          needsClarification: false 
        };
      } 
      
      // seoul API 유형은 기존 방식대로 추가 질문 확인
      const clarificationQuestions = extractClarificationQuestions(result);
      const needsClarification = clarificationQuestions.length > 0;
      
      // Save to cache regardless of clarification needs
      saveJobAnalysisToCache(jobId, result);
      
      return { result, clarificationQuestions, needsClarification };
      
    } catch (error) {
      console.error("Error analyzing job:", error);
      setError("공고 분석 중 오류가 발생했습니다");
      toast.error("공고 분석 중 오류가 발생했습니다.");
      return { result: null, clarificationQuestions: [], needsClarification: false };
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { isAnalyzing, error, analyzeJob };
};
