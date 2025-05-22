
import React from "react";
import MatchingAnalysis from "../MatchingAnalysis";
import MatchingScoreSection from "../matching/MatchingScoreSection";
import { MatchAnalysis } from "../../services/matchingService";
import { JobAnalysisResult } from "../../services/jobs/analysis/types";
import LoadingSpinner from "../ui/LoadingSpinner";

// 토스트 중복 방지를 위한 플래그
let analysisStartedFlag = false;

interface JobAnalysisTabProps {
  jobId: string | number;
  hasCompletedQuestionnaire: boolean;
  isAnalysisReady: boolean;
  matchAnalysis: MatchAnalysis;
  onStartAnalysis: () => void;
  onBack: () => void;
  jobAnalysis?: JobAnalysisResult | null;
  isAnalyzing: boolean;
}

const JobAnalysisTab: React.FC<JobAnalysisTabProps> = ({
  jobId,
  hasCompletedQuestionnaire,
  isAnalysisReady,
  matchAnalysis,
  onStartAnalysis,
  onBack,
  jobAnalysis,
  isAnalyzing,
}) => {
  // 분석이 완료되었거나 사용자가 설문을 완료한 상태라면 분석 결과 표시
  const showAnalysis = hasCompletedQuestionnaire || isAnalysisReady;
  // API 타입 확인
  const apiType = jobAnalysis?.apiType;

  // 분석 시작 플래그 초기화
  React.useEffect(() => {
    analysisStartedFlag = false;
    
    return () => {
      analysisStartedFlag = false;
    };
  }, [jobId]);

  // Component mount when tab is shown - start analysis automatically
  React.useEffect(() => {
    // Only start analysis if not already analyzing and no results yet
    if (!isAnalyzing && !showAnalysis && !analysisStartedFlag) {
      analysisStartedFlag = true;
      onStartAnalysis();
    }
  }, [isAnalyzing, showAnalysis]);

  if (showAnalysis) {
    return <MatchingAnalysis 
      jobId={jobId} 
      analysis={matchAnalysis} 
      onBack={onBack} 
    />;
  }

  return (
    <div className="text-center py-8">
      <h2 className="text-xl font-bold mb-6">
        나와 잘 맞는 공고인지 확인해보세요
      </h2>
      <div className="mb-6">
        <MatchingScoreSection
          isLoading={false}
          apiType={apiType}
        />
      </div>
      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-10">
          <LoadingSpinner 
            text="맞춤형 분석을 생성하고 있어요..." 
            className="h-10 w-10 text-blue-600"
          />
        </div>
      )}
    </div>
  );
};

export default JobAnalysisTab;
