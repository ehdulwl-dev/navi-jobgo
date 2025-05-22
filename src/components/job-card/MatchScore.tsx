
import React from "react";

interface MatchScoreProps {
  score: number | null;
}

export const MatchScore: React.FC<MatchScoreProps> = ({ score }) => {
  return (
    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-sm font-medium">
      {score !== null
        ? `매칭점수 ${Math.round(score)}점`
        : "매칭점수 준비중"}
    </span>
  );
};
