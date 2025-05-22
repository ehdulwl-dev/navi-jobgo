
import React from "react";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MatchScoreGauge from "../MatchScoreGauge";

interface MatchingScoreSectionProps {
  score?: number;
  isLoading?: boolean;
  onStartAnalysis?: () => void;
  showButton?: boolean;
  apiType?: string;
}

const MatchingScoreSection: React.FC<MatchingScoreSectionProps> = ({
  score,
  isLoading = false,
  onStartAnalysis,
  showButton = false,
  apiType,
}) => {
  // 정부 공고인 경우 별도 메시지 표시
  if (apiType === "government") {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <p className="text-lg font-medium text-gray-600 mb-2">
            이 공고는 맞춤형 분석이 적용되지 않는 공고입니다
          </p>
        </div>
      </div>
    );
  }

  // 분석 중이거나 점수가 아직 계산되지 않은 경우
  if (isLoading || score === undefined || score === null) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className={isLoading ? "blur-sm" : ""}>
            <MatchScoreGauge score={0} />
          </div>
          <p className="text-gray-500 mt-2">
            {isLoading ? "분석 중..." : "분석 준비 중..."}
          </p>
        </div>
      </div>
    );
  }

  // 분석 완료된 경우 점수 표시
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <MatchScoreGauge score={score || 0} />
        <div className="flex items-center gap-2 mt-1">
          <h2 className="text-lg font-bold">매칭점수 {Math.round(score)}점</h2>
          <Dialog>
            <DialogTrigger>
              <Info className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-center mb-4">
                  매칭 점수는 이렇게 계산되었어요
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {apiType === "work24" ? (
                  // work24 API 타입의 점수 계산 설명
                  <>
                    <div className="flex justify-between items-center">
                      <span>각 필수 조건</span>
                      <span className="text-blue-500 font-medium">50점</span>
                    </div>
                    <div className="pt-2 text-sm text-gray-600 border-t">
                      <p className="mb-2">※ 점수 산출 방식</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>각 필수 조건이 만족될 때마다 50점씩 부여 (최대 100점)</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  // seoul API 타입의 점수 계산 설명 (기본값)
                  <>
                    <div className="flex justify-between items-center">
                      <span>자격 사항</span>
                      <span className="text-blue-500 font-medium">최대 70점</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>우대 사항</span>
                      <span className="text-blue-500 font-medium">최대 30점</span>
                    </div>
                    <div className="pt-2 text-sm text-gray-600 border-t">
                      <p className="mb-2">※ 점수 산출 방식</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>자격 사항: (만족한 항목 수 ÷ 전체 항목 수) × 70점</li>
                        <li>우대 사항: (만족한 항목 수 ÷ 전체 항목 수) × 30점</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default MatchingScoreSection;
