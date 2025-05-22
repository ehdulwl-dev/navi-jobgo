
import { JobAnalysisResult } from "../../services/jobs/analysis/types";

// Convert the API format to the format expected by QualificationsSection
export const formatForQualificationsSection = (items: Array<{text: string, matched: boolean}> = []) => {
  return items.map((item, index) => ({
    id: `qual-${index}`,
    name: item.text,
    isMatched: item.matched
  }));
};

// Helper function to get qualifications from either finalized data or initial analysis
export const getQualifications = (
  finalAnalysis: JobAnalysisResult | null, 
  initialAnalysis: any, 
  type: 'requirements' | 'preferences',
  hasError: boolean
) => {
  if (finalAnalysis && !hasError) {
    const items = type === 'requirements' 
      ? finalAnalysis.requirements?.items 
      : finalAnalysis.preferences?.items;
    
    if (items) {
      return formatForQualificationsSection(items);
    }
  }
  
  return type === 'requirements'
    ? initialAnalysis.requiredQualifications
    : initialAnalysis.preferredQualifications;
};
