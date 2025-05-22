import React from "react";

interface MatchScoreGaugeProps {
  score: number;
}

const MatchScoreGauge: React.FC<MatchScoreGaugeProps> = ({ score }) => {
  // Calculate rotation angle based on score (0-100)
  const rotationAngle = -90 + (score / 100) * 180;

  return (
    <div className="relative w-40 h-20 flex flex-col items-center">
      {/* Semicircle gauge background */}
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          {/* Left section (red/pink) */}
          <path
            d="M 10 50 A 40 40 0 0 1 30 15"
            fill="none"
            stroke="#FFB5B5"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Middle section (yellow) */}
          <path
            d="M 30 15 A 40 40 0 0 1 70 15"
            fill="none"
            stroke="#FFE376"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Right section (green) */}
          <path
            d="M 70 15 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#9FE076"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Needle */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="20"
            stroke="#374151"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${rotationAngle}, 50, 50)`}
          />
          {/* Needle base */}
          <circle cx="50" cy="50" r="4" fill="#374151" />
        </svg>
      </div>
    </div>
  );
};

export default MatchScoreGauge;
