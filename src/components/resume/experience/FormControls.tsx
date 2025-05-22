
import React from "react";
import { Button } from "@/components/ui/button";

interface FormControlsProps {
  handlePrevious: () => void;
  handleNext: () => void;
  addNewExperience: () => void;
}

export const FormControls: React.FC<FormControlsProps> = ({
  handlePrevious,
  handleNext,
  addNewExperience,
}) => {
  return (
    <>
      <Button
        variant="outline"
        onClick={addNewExperience}
        className="w-full"
      >
        + 경력 추가
      </Button>

      <div className="flex justify-between space-x-4 mt-6">
        <Button onClick={handlePrevious} variant="outline">
          이전
        </Button>
        <Button
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-700"
        >
          다음
        </Button>
      </div>
    </>
  );
};
