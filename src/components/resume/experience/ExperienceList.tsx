
import React from "react";
import { ExperienceItem } from "./ExperienceItem";
import { Separator } from "@/components/ui/separator";
import { ExperienceItemType } from "./types";

interface ExperienceListProps {
  experiences: ExperienceItemType[];
  jobTitles: string[];
  contractTypes: string[];
  years: number[];
  months: number[];
  handleExperienceChange: (index: number, field: string, value: string) => void;
  deleteExperience: (index: number) => void;
}

export const ExperienceList: React.FC<ExperienceListProps> = ({
  experiences,
  jobTitles,
  contractTypes,
  years,
  months,
  handleExperienceChange,
  deleteExperience,
}) => {
  return (
    <>
      {experiences.map((experience, index) => (
        <React.Fragment key={index}>
          <ExperienceItem
            experience={experience}
            index={index}
            jobTitles={jobTitles}
            contractTypes={contractTypes}
            years={years}
            months={months}
            handleExperienceChange={handleExperienceChange}
            deleteExperience={deleteExperience}
          />
          {index < experiences.length - 1 && <Separator className="my-6" />}
        </React.Fragment>
      ))}
    </>
  );
};
