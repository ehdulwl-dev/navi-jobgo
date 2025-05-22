
import { useState, useEffect } from "react";
import { JobAnalysisResult } from "../../services/jobs/analysis/types";
import { 
  getJobAnalysisFromCache, 
  hasClarificationNeeded 
} from "../../services/jobs/analysis/cacheUtils";
import { extractClarificationQuestions } from "../../services/jobs/analysis/analysisUtils";

interface UseCachedAnalysisResult {
  cachedAnalysis: JobAnalysisResult | null;
  needsClarification: boolean;
  clarificationQuestions: any[];
  isComplete: boolean;
}

export const useCachedAnalysis = (
  jobId: string | number,
  alreadyAnalyzed: boolean
): UseCachedAnalysisResult => {
  const [result, setResult] = useState<UseCachedAnalysisResult>({
    cachedAnalysis: null,
    needsClarification: false,
    clarificationQuestions: [],
    isComplete: false
  });

  useEffect(() => {
    // Check for cached analysis in localStorage
    const cachedAnalysis = getJobAnalysisFromCache(jobId);
    
    if (cachedAnalysis) {
      console.log("Using cached analysis from localStorage for job:", jobId);
      
      // Check if the analysis needs clarification questions
      const needsClarification = hasClarificationNeeded(cachedAnalysis) && !alreadyAnalyzed;
      let clarificationQuestions: any[] = [];
      
      if (needsClarification) {
        // Extract clarification questions from cached analysis
        clarificationQuestions = extractClarificationQuestions(cachedAnalysis);
      }
      
      setResult({
        cachedAnalysis,
        needsClarification,
        clarificationQuestions,
        isComplete: !hasClarificationNeeded(cachedAnalysis) || alreadyAnalyzed
      });
    }
  }, [jobId, alreadyAnalyzed]);

  return result;
};
