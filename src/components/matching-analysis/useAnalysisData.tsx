
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  JobAnalysisResult 
} from "../../services/jobs/directAnalysisService";
import { 
  applyUserAnswers, 
  calculateFinalScore
} from "../../services/jobs/analysis/analysisUtils";
import { MatchAnalysis } from "../../services/matchingService";
import { saveJobAnalysisToCache } from "../../services/jobs/analysis/cacheUtils";
import { useCachedAnalysis } from "./useCachedAnalysis";
import { useJobAnalysis } from "./useJobAnalysis";
import { getQualifications } from "./analysisUtils";
import { AnalysisDataHookResult, UserAnswer } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { AdviceItem, AdviceResponse } from "../../services/jobs/analysis/adviceTypes";

// 중복 토스트 표시 방지를 위한 플래그
let analysisCompletedEventFired = false;

export const useAnalysisData = (
  jobId: string | number,
  initialAnalysis: MatchAnalysis
): AnalysisDataHookResult => {
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysisResult | null>(null);
  const [finalAnalysis, setFinalAnalysis] = useState<JobAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clarificationQuestions, setClarificationQuestions] = useState<any[]>([]);
  const [showClarificationDialog, setShowClarificationDialog] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [alreadyAnalyzed, setAlreadyAnalyzed] = useState(false);
  const [adviceItems, setAdviceItems] = useState<AdviceItem[]>([]);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  // 새로 추가: 조언 생성이 완료되었는지 추적하는 상태
  const [adviceCompleted, setAdviceCompleted] = useState(false);
  // 새로 추가: 최종적으로 모든 처리가 완료되었는지 확인하는 상태
  const [allProcessingCompleted, setAllProcessingCompleted] = useState(false);

  // Use our custom hooks
  const { isAnalyzing, error: analysisError, analyzeJob: performAnalysis } = useJobAnalysis();
  const { 
    cachedAnalysis, 
    needsClarification, 
    clarificationQuestions: cachedQuestions,
    isComplete: isCachedAnalysisComplete 
  } = useCachedAnalysis(jobId, alreadyAnalyzed);

  // Reset the event flag when component unmounts or jobId changes
  useEffect(() => {
    return () => {
      analysisCompletedEventFired = false;
    };
  }, [jobId]);

  // Set error from analysis if available
  useEffect(() => {
    if (analysisError) {
      setError(analysisError);
    }
  }, [analysisError]);

  // 모든 처리가 완료되었는지 체크하는 효과
  useEffect(() => {
    if (analysisCompleted && (adviceCompleted || !isLoadingAdvice)) {
      setAllProcessingCompleted(true);
    } else {
      setAllProcessingCompleted(false);
    }
  }, [analysisCompleted, adviceCompleted, isLoadingAdvice]);

  // Handle cached analysis when available
  useEffect(() => {
    if (cachedAnalysis) {
      setJobAnalysis(cachedAnalysis);
      
      if (cachedAnalysis.adviceItems) {
        setAdviceItems(cachedAnalysis.adviceItems);
        setAdviceCompleted(true);
      }
      
      if (needsClarification) {
        setClarificationQuestions(cachedQuestions);
        setShowClarificationDialog(cachedQuestions.length > 0);
        setFinalAnalysis(null);
      } else {
        setFinalAnalysis(cachedAnalysis);
        setAnalysisCompleted(true);
        
        // 조언이 없다면 생성 시도
        if (!cachedAnalysis.adviceItems) {
          generateAdvice(cachedAnalysis);
        }
      }
      
      setLoading(false);
    }
  }, [cachedAnalysis, needsClarification, cachedQuestions]);

  // 공고 평가를 위한 GPT 조언 생성 함수
  const generateAdvice = async (analysis: JobAnalysisResult) => {
    if (!analysis) return;
    
    const requiredQuals = getQualifications(analysis, initialAnalysis, 'requirements', false);
    const preferredQuals = getQualifications(analysis, initialAnalysis, 'preferences', false);
    
    // 충족하지 못한 자격 요건들을 수집
    const unmetQualifications = [
      ...requiredQuals.filter(q => !q.isMatched),
      ...preferredQuals.filter(q => !q.isMatched)
    ];
    
    if (unmetQualifications.length === 0) {
      console.log("No unmet qualifications, skipping advice generation");
      setAdviceCompleted(true);
      return;
    }
    
    setIsLoadingAdvice(true);
    
    try {
      const { data, error } = await supabase.functions.invoke<AdviceResponse>(
        'generate-qualification-advice',
        {
          body: { qualifications: unmetQualifications }
        }
      );
      
      if (error) {
        console.error("Error generating advice:", error);
        setAdviceCompleted(true);
        setIsLoadingAdvice(false);
        return;
      }
      
      if (data && data.adviceItems) {
        setAdviceItems(data.adviceItems);
        
        // Update analysis with advice items
        const updatedAnalysis = {
          ...analysis,
          adviceItems: data.adviceItems
        };
        
        // Update cache with advice items
        saveJobAnalysisToCache(jobId, updatedAnalysis);
        
        // Update the final analysis state
        setFinalAnalysis(updatedAnalysis);
      }
      
      // 조언 생성 완료 표시
      setAdviceCompleted(true);
    } catch (err) {
      console.error("Error calling advice function:", err);
      setAdviceCompleted(true);
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  // 사용자 응답 처리 함수
  const handleQuestionnaireComplete = (answers: UserAnswer[]) => {
    if (!jobAnalysis) return;
    
    // 사용자 응답을 저장
    setUserAnswers(answers);
    
    // 사용자 응답을 분석 결과에 적용
    const updatedAnalysis = applyUserAnswers(jobAnalysis, answers);
    
    // 명확한 순서로 상태 업데이트
    setFinalAnalysis(updatedAnalysis);
    
    // 로컬 스토리지에 응답이 반영된 결과 저장
    saveJobAnalysisToCache(jobId, updatedAnalysis);
    
    setClarificationQuestions([]); // 질문 목록 초기화
    setShowClarificationDialog(false); // 팝업 닫기 상태 확실히 설정
    setAnalysisCompleted(true); // 분석 완료 상태 표시
    setAlreadyAnalyzed(true); // 분석 완료 플래그 설정
    
    // 조언 생성 시작
    generateAdvice(updatedAnalysis);
    
    // 토스트 메시지와 이벤트는 한 번만 표시하도록 상태 확인 - 이제 조언 생성이 완료된 후에만 표시
  };

  useEffect(() => {
    // 모든 처리가 완료되었을 때만 토스트 메시지와 이벤트 발생
    if (allProcessingCompleted && !analysisCompletedEventFired) {
      // 분석 완료 이벤트 발생
      window.dispatchEvent(
        new CustomEvent("jobAnalysisCompleted", {
          detail: { jobId },
        })
      );
      
      toast.success("맞춤형 공고 분석이 완료되었습니다.");
      analysisCompletedEventFired = true;
    }
  }, [allProcessingCompleted, jobId]);

  const analyzeJob = async () => {
    // If we already have analysis from cache, use it
    if (cachedAnalysis) {
      return;
    }
    
    // Skip if analysis is already in progress
    if (isAnalyzing) {
      console.log("Analysis already in progress locally, skipping duplicate fetch");
      return;
    }

    setLoading(true);
    
    // Reset the event flag when starting a new analysis
    analysisCompletedEventFired = false;
    
    // Use the hook function to perform analysis
    const { result, clarificationQuestions, needsClarification } = await performAnalysis(jobId.toString());
    
    if (result) {
      setJobAnalysis(result);
      
      // If this is a work24 job or there are no clarification questions
      if (!needsClarification) {
        setFinalAnalysis(result);
        setAnalysisCompleted(true);
        setAlreadyAnalyzed(true);
        
        // 조언 생성
        generateAdvice(result);
      } else {
        // Set questions and show dialog
        setClarificationQuestions(clarificationQuestions);
        setShowClarificationDialog(true);
      }
    }
    
    setLoading(false);
  };

  // 수동 재시도 함수
  const handleRetryAnalysis = () => {
    if (isAnalyzing) {
      toast.info("분석이 이미 진행 중입니다. 잠시만 기다려주세요.");
      return;
    }
    
    // 응답 초기화 후 다시 분석
    setUserAnswers([]);
    setClarificationQuestions([]);
    setFinalAnalysis(null);
    setAnalysisCompleted(false);
    setAlreadyAnalyzed(false);
    setAdviceItems([]);
    setAdviceCompleted(false);
    
    // Reset the event flag when retrying analysis
    analysisCompletedEventFired = false;
    
    // Remove from localStorage cache to force a fresh analysis
    localStorage.removeItem(`job-analysis-${jobId}`);
    
    analyzeJob();
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 자동으로 분석 시작
    if (jobId) {
      analyzeJob();
    }
  }, [jobId]);

  // Get required and preferred qualifications
  const requiredQualifications = getQualifications(
    finalAnalysis, 
    initialAnalysis, 
    'requirements', 
    !!error
  );

  const preferredQualifications = getQualifications(
    finalAnalysis, 
    initialAnalysis, 
    'preferences',
    !!error
  );

  // Calculate match score based on the final analysis and API type
  const matchScore = finalAnalysis ? calculateFinalScore(finalAnalysis) : initialAnalysis.totalScore;

  return {
    jobAnalysis,
    finalAnalysis,
    loading,
    error,
    isAnalyzing,
    clarificationQuestions,
    showClarificationDialog,
    setShowClarificationDialog,
    analysisCompleted,
    userAnswers,
    analyzeJob,
    handleQuestionnaireComplete,
    handleRetryAnalysis,
    requiredQualifications,
    preferredQualifications,
    matchScore,
    adviceItems,
    isLoadingAdvice,
    // 새로 추가: 조언 생성 완료 상태
    adviceCompleted,
    // 새로 추가: 모든 처리 완료 상태
    allProcessingCompleted
  };
};
