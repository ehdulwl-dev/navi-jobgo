
// Analysis item
export interface AnalysisItem {
  text: string;
  matched: boolean;
  clarificationNeeded: boolean;
}

// Group of analysis items (either requirements or preferences)
export interface AnalysisGroup {
  total: number;
  matched: number;
  items: AnalysisItem[];
}

// Import advice types
import { AdviceItem } from './adviceTypes';

// Full analysis result
export interface JobAnalysisResult {
  requirements: AnalysisGroup;
  preferences: AnalysisGroup;
  apiType?: string;  // Added to store the API type used for analysis
  errorMessage?: string;
  adviceItems?: AdviceItem[]; // Add this field to store the advice
}

// Clarification question
export interface ClarificationQuestion {
  id?: string;  // Add id field
  text: string;
  itemType: 'requirement' | 'preference';
  index: number;
  type?: 'requirement' | 'preference';  // Add type field for backward compatibility
}

// Add UserAnswer type for reference by analysisUtils.ts
export interface UserAnswer {
  question: ClarificationQuestion;
  answer: boolean;
}
