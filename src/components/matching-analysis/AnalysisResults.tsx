
import React from "react";
import QualificationsSection from "../matching/QualificationsSection";
import ImprovementSection from "../matching/ImprovementSection";
import { JobAnalysisResult } from "../../services/jobs/analysis/types";
import { AdviceItem } from "../../services/jobs/analysis/adviceTypes";

interface AnalysisResultsProps {
  finalAnalysis: JobAnalysisResult;
  requiredQualifications: Array<{id: string; name: string; isMatched: boolean}>;
  preferredQualifications: Array<{id: string; name: string; isMatched: boolean}>;
  adviceItems?: AdviceItem[];
  isLoadingAdvice?: boolean;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  finalAnalysis,
  requiredQualifications,
  preferredQualifications,
  adviceItems,
  isLoadingAdvice,
}) => {
  return (
    <>
      <div className="mt-8">
        <QualificationsSection
          title="자격 사항"
          qualifications={requiredQualifications}
        />

        {!(finalAnalysis?.apiType === "work24" && preferredQualifications.length === 0) && (
          <QualificationsSection
            title="우대 사항"
            qualifications={preferredQualifications}
          />
        )}
      </div>

      <ImprovementSection
        requiredQualifications={requiredQualifications}
        preferredQualifications={preferredQualifications}
        adviceItems={adviceItems}
        isLoadingAdvice={isLoadingAdvice}
      />
    </>
  );
};

export default AnalysisResults;
