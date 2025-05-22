
import { JobAnalysisResult, ClarificationQuestion } from "../../services/jobs/directAnalysisService";
import { AdviceItem } from "../../services/jobs/analysis/adviceTypes";

export interface UserAnswer {
  question: ClarificationQuestion;
  answer: boolean;
}

export interface AnalysisDataHookResult {
  jobAnalysis: JobAnalysisResult | null;
  finalAnalysis: JobAnalysisResult | null;
  loading: boolean;
  error: string | null;
  isAnalyzing: boolean;
  clarificationQuestions: any[];
  showClarificationDialog: boolean;
  setShowClarificationDialog: (show: boolean) => void;
  analysisCompleted: boolean;
  userAnswers: UserAnswer[];
  analyzeJob: () => Promise<void>;
  handleQuestionnaireComplete: (answers: UserAnswer[]) => void;
  handleRetryAnalysis: () => void;
  requiredQualifications: Array<{id: string; name: string; isMatched: boolean}>;
  preferredQualifications: Array<{id: string; name: string; isMatched: boolean}>;
  matchScore: number;
  adviceItems: AdviceItem[];
  isLoadingAdvice: boolean;
  // 새로 추가: 조언 생성 완료 상태
  adviceCompleted: boolean;
  // 새로 추가: 모든 처리 완료 상태
  allProcessingCompleted: boolean;
}
