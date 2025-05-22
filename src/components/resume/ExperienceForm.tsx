
import React from "react";
import { Card, CardContent } from "../ui/card";
import { ExperienceList } from "./experience/ExperienceList";
import { FormControls } from "./experience/FormControls";
import { ExperienceFormProps } from "./experience/types";

export const ExperienceForm: React.FC<ExperienceFormProps> = ({
  formData,
  handleExperienceChange,
  addNewExperience,
  deleteExperience,
  handlePrevious,
  handleNext,
}) => {
  // Generate years array from 2025 down to 1935 in descending order
  const years = Array.from(
    { length: 91 }, // 91 years (2025 to 1935)
    (_, i) => 2025 - i
  );
  
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Job titles list
  const jobTitles = [
    "외식·음료",
    "매장관리·판매",
    "서비스",
    "사무직",
    "고객상담·리서치·영업",
    "생산·건설·노무",
    "IT·기술",
    "디자인",
    "운전·배달",
    "병원·간호·연구",
    "교육·강사",
    "보안·경비·경호",
    "직접 입력",
  ];

  const contractTypes = ["정규직", "계약직", "인턴", "파견직", "프리랜서"];
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <ExperienceList
            experiences={formData.experiences}
            jobTitles={jobTitles}
            contractTypes={contractTypes}
            years={years}
            months={months}
            handleExperienceChange={handleExperienceChange}
            deleteExperience={deleteExperience}
          />
          
          <FormControls
            handlePrevious={handlePrevious}
            handleNext={handleNext}
            addNewExperience={addNewExperience}
          />
        </div>
      </CardContent>
    </Card>
  );
};
