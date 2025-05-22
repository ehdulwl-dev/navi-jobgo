import React from "react";
import { BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MatchScoreGauge from "../MatchScoreGauge";

interface MatchingScoreCardProps {
  matchScore: number;
  onShowAnalysis: () => void;
}

const MatchingScoreCard: React.FC<MatchingScoreCardProps> = ({
  matchScore,
  onShowAnalysis,
}) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold">맞춤형 공고 분석</h3>
        <p className="text-sm text-gray-600 mt-1 mb-3">
          나와 잘 맞는 공고인지 알아보세요
        </p>
        <div className="mb-6">
          <MatchScoreGauge score={matchScore} />
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full mt-4 border-dashed border-gray-300"
        onClick={onShowAnalysis}
      >
        <BarChart2 size={16} className="mr-2" />
        분석 자세히 보기
      </Button>
    </div>
  );
};

export default MatchingScoreCard;
