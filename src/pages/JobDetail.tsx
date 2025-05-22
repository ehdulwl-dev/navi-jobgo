import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Job } from "../components/JobList";
import {
  getJobById,
  toggleFavoriteJob,
  getFavoriteJobIds,
} from "../services/jobService";
import { getMockMatchAnalysis } from "../services/matchingService";
import { Button } from "@/components/ui/button";
import JobHeader from "../components/job/JobHeader";
import JobTabs from "../components/job/JobTabs";
import JobActions from "../components/job/JobActions";
import ApplyDialog from "../components/job/ApplyDialog";
import QualificationQuestionDialog from "../components/matching/QualificationQuestionDialog";
import BottomNavigation from "../components/BottomNavigation";
import Header from "../components/Header";
import {
  JobAnalysisResult,
  hasClarificationQuestions,
} from "../services/jobs/directAnalysisService";
import { ClarificationQuestion } from "../services/jobs/analysis/types";
import {
  extractClarificationQuestions,
  applyUserAnswers,
} from "../services/jobs/analysis/analysisUtils";
import { toast } from "sonner";
import { 
  getJobAnalysisFromCache, 
  saveJobAnalysisToCache,
  hasClarificationNeeded 
} from "../services/jobs/analysis/cacheUtils";

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [matchScore, setMatchScore] = useState(0);
  const [activeTab, setActiveTab] = useState("info");
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] =
    useState(false);
  const [isAnalysisReady, setIsAnalysisReady] = useState(false);
  const [showAnalysisTab, setShowAnalysisTab] = useState(false);
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysisResult | null>(
    null
  );
  const [clarificationQuestions, setClarificationQuestions] = useState<
    ClarificationQuestion[]
  >([]);
  const [showQualificationDialog, setShowQualificationDialog] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);

  // 토스트 중복 방지를 위한 플래그
  const [analysisStarted, setAnalysisStarted] = useState(false);

  const shouldShowAnalysis = (
    job: Job | null,
    jobId: string | undefined
  ): boolean => {
    if (!job || !jobId) return false;

    const favoriteIds = getFavoriteJobIds();
    return favoriteIds.includes(jobId.toString());
  };

  // Reset analysis state when job ID changes
  useEffect(() => {
    setJobAnalysis(null);
    setClarificationQuestions([]);
    setHasCompletedQuestionnaire(false);
    setIsAnalysisReady(false);
    setAnalysisCompleted(false);
    setShowQualificationDialog(false);
    setIsAnalyzing(false);
    setAnalysisStarted(false);
    
    // Try to get analysis from cache immediately when job ID changes
    if (id) {
      const cachedAnalysis = getJobAnalysisFromCache(id);
      if (cachedAnalysis) {
        setJobAnalysis(cachedAnalysis);
        
        // Check if the analysis has clarification questions
        if (hasClarificationNeeded(cachedAnalysis)) {
          // If user hasn't completed questionnaire yet
          if (!hasCompletedQuestionnaire) {
            const questions = extractClarificationQuestions(cachedAnalysis);
            setClarificationQuestions(questions);
          } else {
            setIsAnalysisReady(true);
            setAnalysisCompleted(true);
          }
        } else {
          // No clarification needed
          setIsAnalysisReady(true);
          setAnalysisCompleted(true);
          setHasCompletedQuestionnaire(true);
        }
      }
    }
  }, [id]);

  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const fetchedJob = await getJobById(id);
        setJob(fetchedJob);

        const showAnalysis = shouldShowAnalysis(fetchedJob, id);
        setShowAnalysisTab(showAnalysis);

        if (showAnalysis) {
          const analysis = getMockMatchAnalysis(id);
          setMatchScore(analysis.totalScore);

          // Check if we have cached analysis results
          const cachedAnalysis = getJobAnalysisFromCache(id);
          if (cachedAnalysis) {
            setJobAnalysis(cachedAnalysis);
            setIsAnalysisReady(!hasClarificationNeeded(cachedAnalysis) || hasCompletedQuestionnaire);
            setAnalysisCompleted(!hasClarificationNeeded(cachedAnalysis) || hasCompletedQuestionnaire);
          }
        }
      } catch (err) {
        console.error("공고 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
    
    // Always default to "info" tab when entering from any navigation
    setActiveTab("info");
  }, [id]);

  // 탭 변경 처리를 위한 효과 추가
  useEffect(() => {
    // 분석 탭으로 전환되고 관심 공고인 경우, 자동으로 분석 상태 확인
    if (activeTab === "analysis" && showAnalysisTab) {
      const cachedAnalysis = getJobAnalysisFromCache(id as string);
      
      if (cachedAnalysis) {
        // 이미 분석된 결과가 있음
        setJobAnalysis(cachedAnalysis);
        
        // 질문이 필요한지 확인
        if (hasClarificationNeeded(cachedAnalysis) && !hasCompletedQuestionnaire) {
          // 질문이 필요하고 아직 응답하지 않은 경우
          const questions = extractClarificationQuestions(cachedAnalysis);
          setClarificationQuestions(questions);
          setShowQualificationDialog(true);
        } else {
          // 질문이 필요 없거나 이미 응답한 경우
          setIsAnalysisReady(true);
          setAnalysisCompleted(true);
        }
      } else {
        // 캐시된 분석 결과가 없으면 분석 시작
        handleStartAnalysis();
      }
    }
  }, [activeTab, showAnalysisTab]);

  const handleToggleFavorite = async () => {
    if (!job) return;
    try {
      const result = await toggleFavoriteJob(job.id);

      const updatedJob = await getJobById(job.id);
      if (updatedJob) {
        setJob(updatedJob);
        setShowAnalysisTab(shouldShowAnalysis(updatedJob, id));
      }
    } catch (error) {
      console.error("관심 공고 토글 실패:", error);
    }
  };

  const handleCreateCoverLetter = () => {
    if (job) {
      navigate("/cover-letter/ai-create", {
        state: {
          company: job.company,
          position: job.title,
        },
      });
    }
  };

  const handleQuestionnaireComplete = (
    answers: Array<{ question: ClarificationQuestion; answer: boolean }>
  ) => {
    if (!jobAnalysis) return;

    // 사용자 응답을 분석 결과에 적용
    const updatedAnalysis = applyUserAnswers(jobAnalysis, answers);

    // 명확한 순서로 상태 업데이트
    setJobAnalysis(updatedAnalysis);
    
    // 업데이트된 분석 결과를 캐시에 저장
    saveJobAnalysisToCache(id as string, updatedAnalysis);
    
    setClarificationQuestions([]); // 질문 초기화
    setShowQualificationDialog(false); // 다이얼로그 닫기
    setHasCompletedQuestionnaire(true); // 설문 완료 상태로
    setIsAnalysisReady(true); // 분석 준비 완료
    setAnalysisCompleted(true); // 분석 완료 상태로

    const analysis = getMockMatchAnalysis(id as string);
    setMatchScore(analysis.totalScore);
    
    // 분석 완료 이벤트는 dispatch하지 않음
    // useAnalysisData에서 처리

    // 분석 완료 토스트 메시지 표시 안함 - 중복 방지
    // useAnalysisData에서 처리
  };

  const handleStartAnalysis = async () => {
    if (isAnalyzing) {
      toast.info("분석이 이미 진행 중입니다. 잠시만 기다려주세요.");
      return;
    }

    if (analysisStarted) {
      console.log("Analysis already started, not showing toast again");
      return;
    }

    // 이미 캐시된 결과가 있는지 확인
    const cachedAnalysis = getJobAnalysisFromCache(id as string);
    if (cachedAnalysis) {
      setJobAnalysis(cachedAnalysis);
      
      // 질문이 필요한지 확인
      if (hasClarificationNeeded(cachedAnalysis) && !hasCompletedQuestionnaire) {
        // 질문이 필요하고 아직 응답하지 않은 경우
        const questions = extractClarificationQuestions(cachedAnalysis);
        setClarificationQuestions(questions);
        setShowQualificationDialog(true);
      } else {
        // 질문이 필요 없거나 이미 응답한 경우
        setIsAnalysisReady(true);
        setAnalysisCompleted(true);
        setHasCompletedQuestionnaire(true);
      }
      return;
    }

    // 캐시된 결과가 없으면 새로 분석
    setIsAnalyzing(true);
    setAnalysisCompleted(false);
    setClarificationQuestions([]);
    setAnalysisStarted(true);

    try {
      // 분석 시작 알림은 한 번만 표시 (중복 방지)
      if (!analysisStarted) {
        toast.info("공고 분석을 시작합니다. 잠시만 기다려주세요.");
        setAnalysisStarted(true);
      }
      
      // Start analysis using a timer to give feedback
      setTimeout(() => {
        // 일정 시간 후 다시 캐시 확인
        const cachedAnalysis = getJobAnalysisFromCache(id as string);
        if (cachedAnalysis) {
          setJobAnalysis(cachedAnalysis);
          
          // 질문이 필요한지 확인
          if (hasClarificationNeeded(cachedAnalysis)) {
            // 질문이 필요한 경우
            const questions = extractClarificationQuestions(cachedAnalysis);
            setClarificationQuestions(questions);
            setShowQualificationDialog(true);
          } else {
            // 질문이 필요 없는 경우
            setIsAnalysisReady(true);
            setAnalysisCompleted(true);
            setHasCompletedQuestionnaire(true);
            
            // 분석 완료 토스트 메시지는 표시 안함 - 중복 방지
            // useAnalysisData에서 처리
          }
        } else {
          // 분석을 다시 시도
          toast.error("공고 분석에 실패했습니다. 잠시 후 다시 시도해주세요.");
          setAnalysisStarted(false);
        }
        setIsAnalyzing(false);
      }, 2000);
      
    } catch (error) {
      console.error("분석 시작 중 오류 발생:", error);
      toast.error("분석 시작 중 오류가 발생했습니다. 다시 시도해주세요.");
      setIsAnalyzing(false);
      setAnalysisStarted(false);
    }
  };

  // 다이얼로그가 표시되는 조건 - 질문이 있고, 대화상자가 열려 있어야 함
  const shouldShowQuestionDialog =
    showQualificationDialog && clarificationQuestions.length > 0;

  // 로딩 중인 경우 로딩 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Header title="전체 공고" />
        <p className="text-gray-500 mt-4">공고를 불러오는 중...</p>
      </div>
    );
  }

  // job이 null인 경우 오류 메시지 표시
  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Header title="전체 공고" />
        <div className="text-center p-4">
          <h2 className="text-xl font-bold text-red-500 mb-2">
            공고를 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 mb-4">
            요청하신 공고를 찾을 수 없습니다.
          </p>
          <Button onClick={() => navigate("/index")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> 전체 공고 보기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="전체 공고" />

      <main className="px-4 py-6">
        <JobTabs
          job={job}
          fromFavorites={showAnalysisTab}
          activeTab={activeTab}
          hasCompletedQuestionnaire={hasCompletedQuestionnaire}
          isAnalysisReady={isAnalysisReady}
          matchAnalysis={getMockMatchAnalysis(id as string)}
          onTabChange={setActiveTab}
          onStartAnalysis={handleStartAnalysis}
          jobAnalysis={jobAnalysis}
          isAnalyzing={isAnalyzing}
        />

        {/* 질문 다이얼로그 - 수정된 조건에 따라 표시 */}
        <QualificationQuestionDialog
          open={shouldShowQuestionDialog}
          onOpenChange={setShowQualificationDialog}
          questions={clarificationQuestions}
          onComplete={handleQuestionnaireComplete}
        />

        <JobActions
          jobId={job.id}
          isFavorite={job.isFavorite || false}
          onToggleFavorite={handleToggleFavorite}
          onApplyClick={() => setShowApplyDialog(true)}
        />
      </main>

      <ApplyDialog
        open={showApplyDialog}
        onOpenChange={setShowApplyDialog}
        jobTitle={job.title}
        company={job.company}
        onCreateCoverLetter={handleCreateCoverLetter}
      />

      <BottomNavigation />
    </div>
  );
};

export default JobDetail;
