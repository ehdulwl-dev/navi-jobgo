
import React from "react";
import { MatchAnalysis } from "../services/matchingService";
import MatchingScoreSection from "./matching/MatchingScoreSection";
import QualificationQuestionDialog from "./matching/QualificationQuestionDialog";
import { useAnalysisData } from "./matching-analysis/useAnalysisData";
import AnalysisHeader from "./matching-analysis/AnalysisHeader";
import AnalysisError from "./matching-analysis/AnalysisError";
import AnalysisResults from "./matching-analysis/AnalysisResults";
import AnalysisPending from "./matching-analysis/AnalysisPending";
import LoadingSpinner from "./ui/LoadingSpinner";

interface MatchingAnalysisProps {
  analysis: MatchAnalysis;
  onBack: () => void;
  jobId: string | number;
}

const MatchingAnalysis: React.FC<MatchingAnalysisProps> = ({
  analysis,
  onBack,
  jobId,
}) => {
  const {
    loading,
    error,
    finalAnalysis,
    clarificationQuestions,
    showClarificationDialog,
    setShowClarificationDialog,
    isAnalyzing,
    handleQuestionnaireComplete,
    handleRetryAnalysis,
    requiredQualifications,
    preferredQualifications,
    matchScore,
    adviceItems,
    isLoadingAdvice,
    allProcessingCompleted
  } = useAnalysisData(jobId, analysis);

  // 질문 다이얼로그 표시 여부를 결정하는 조건
  const shouldShowQuestionDialog = showClarificationDialog && clarificationQuestions.length > 0;

  // API 타입을 가져옴
  const apiType = finalAnalysis?.apiType;
  
  // 분석과 조언 생성이 모두 완료되었는지 확인
  const isFullyLoaded = finalAnalysis && allProcessingCompleted;
  
  // 로딩 상태 통합 - 분석 중이거나 조언 생성 중일 때
  const isAnyLoading = loading || isAnalyzing || isLoadingAdvice;

  return (
    <div>
      <main className="px-4 pb-20">
        <AnalysisHeader onBack={onBack} />

        {/* 통합된 로딩 표시 - 화면 전체에 표시 */}
        {isAnyLoading && !shouldShowQuestionDialog ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner 
              text="맞춤형 분석을 생성하고 있어요..." 
              className="h-12 w-12 text-blue-500"
            />
          </div>
        ) : (
          <div className="space-y-6">
            <MatchingScoreSection 
              score={matchScore} 
              apiType={apiType}
              isLoading={false} // 로딩 표시를 별도로 하므로 여기서는 false로 설정
            />

            {error ? (
              <AnalysisError 
                error={error} 
                onRetry={handleRetryAnalysis} 
                isAnalyzing={isAnalyzing} 
              />
            ) : isFullyLoaded && apiType !== "government" ? (
              <AnalysisResults 
                finalAnalysis={finalAnalysis}
                requiredQualifications={requiredQualifications}
                preferredQualifications={preferredQualifications}
                adviceItems={adviceItems}
                isLoadingAdvice={false} // 로딩 표시를 별도로 하므로 여기서는 false로 설정
              />
            ) : (
              // 분석 결과가 없고, 로딩도 아니고, 질문 다이얼로그도 안 뜨고 있을 때만 "분석 결과를 준비 중입니다" 표시
              !apiType || apiType !== "government" ? (
                <AnalysisPending 
                  onRetry={handleRetryAnalysis}
                  isAnalyzing={isAnalyzing}
                />
              ) : null
            )}
          </div>
        )}
      </main>

      {/* 질문 다이얼로그 */}
      <QualificationQuestionDialog
        open={shouldShowQuestionDialog}
        onOpenChange={setShowClarificationDialog}
        questions={clarificationQuestions}
        onComplete={handleQuestionnaireComplete}
      />
    </div>
  );
};

export default MatchingAnalysis;
