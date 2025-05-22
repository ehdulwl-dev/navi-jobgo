
import React from "react";
import { ChevronLeft } from "lucide-react";

interface AnalysisHeaderProps {
  onBack: () => void;
}

const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({ onBack }) => {
  return (
    <div className="flex items-center mb-6">
      <button onClick={onBack} className="mr-2">
        <ChevronLeft size={24} />
      </button>
      <h2 className="text-lg font-semibold">맞춤형 공고 분석</h2>
    </div>
  );
};

export default AnalysisHeader;
