
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import React from "react";

interface FormNavigationButtonsProps {
  prevStep: () => void;
  nextStep: () => void;
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  onSubmit: () => void;
  loadingElement?: React.ReactNode;
}

const FormNavigationButtons = ({
  prevStep,
  nextStep,
  currentStep,
  totalSteps,
  isLoading,
  onSubmit,
  loadingElement,
}: FormNavigationButtonsProps) => {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex justify-between space-x-4 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={prevStep}
        disabled={isLoading}
        className="flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        {currentStep === 1 ? "돌아가기" : "이전"}
      </Button>
      
      <Button
        type="button"
        onClick={isLastStep ? onSubmit : nextStep}
        disabled={isLoading}
        className="flex items-center gap-1"
      >
        {isLoading ? (
          loadingElement || "처리 중..."
        ) : (
          <>
            {isLastStep ? "가입하기" : "다음"}
            {!isLastStep && <ArrowRight className="h-4 w-4" />}
          </>
        )}
      </Button>
    </div>
  );
};

export default FormNavigationButtons;
