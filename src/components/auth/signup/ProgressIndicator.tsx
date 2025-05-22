
import React from "react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="mb-4 flex justify-between">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div 
          key={index}
          className={`h-2 flex-1 ${index < currentStep ? "bg-app-blue" : "bg-gray-300"} ${
            index > 0 ? "ml-1" : ""
          }`}
        />
      ))}
    </div>
  );
};

export default ProgressIndicator;
