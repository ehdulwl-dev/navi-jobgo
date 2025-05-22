
import { JobAnalysisResult, ClarificationQuestion, UserAnswer } from './types';

// Extract clarification questions from analysis result
export const extractClarificationQuestions = (result: JobAnalysisResult): ClarificationQuestion[] => {
  const questions: ClarificationQuestion[] = [];
  
  if (!result) return questions;
  
  // Extract questions from requirements
  result.requirements.items.forEach((item, index) => {
    if (item.clarificationNeeded) {
      questions.push({
        id: `req-${index}`, // Add unique id
        text: item.text,
        itemType: 'requirement',
        index,
        type: 'requirement' // For backward compatibility
      });
    }
  });
  
  // Extract questions from preferences
  result.preferences.items.forEach((item, index) => {
    if (item.clarificationNeeded) {
      questions.push({
        id: `pref-${index}`, // Add unique id
        text: item.text,
        itemType: 'preference',
        index, 
        type: 'preference' // For backward compatibility
      });
    }
  });
  
  return questions;
};

// Check if analysis result has clarification questions
export const hasClarificationQuestions = (result: JobAnalysisResult | null): boolean => {
  if (!result) return false;
  
  return result.requirements.items.some(item => item.clarificationNeeded) ||
         result.preferences.items.some(item => item.clarificationNeeded);
};

// Apply user answers to analysis result
export const applyUserAnswers = (
  analysis: JobAnalysisResult,
  userAnswers: Array<UserAnswer>
): JobAnalysisResult => {
  if (!analysis || !userAnswers || userAnswers.length === 0) {
    return analysis;
  }
  
  // Create a copy of the analysis to avoid mutating the original
  const updatedAnalysis: JobAnalysisResult = JSON.parse(JSON.stringify(analysis));
  let reqMatched = updatedAnalysis.requirements.matched;
  let prefMatched = updatedAnalysis.preferences.matched;
  
  // Process each user answer
  userAnswers.forEach(({ question, answer }) => {
    if (question.itemType === 'requirement' || question.type === 'requirement') {
      const index = question.index;
      if (index >= 0 && index < updatedAnalysis.requirements.items.length) {
        const item = updatedAnalysis.requirements.items[index];
        // Update the item
        item.matched = answer;
        item.clarificationNeeded = false;
        
        // Update the matched count
        if (answer) {
          reqMatched += 1;
        }
      }
    } else if (question.itemType === 'preference' || question.type === 'preference') {
      const index = question.index;
      if (index >= 0 && index < updatedAnalysis.preferences.items.length) {
        const item = updatedAnalysis.preferences.items[index];
        // Update the item
        item.matched = answer;
        item.clarificationNeeded = false;
        
        // Update the matched count
        if (answer) {
          prefMatched += 1;
        }
      }
    }
  });
  
  // Update the matched counts
  updatedAnalysis.requirements.matched = reqMatched;
  updatedAnalysis.preferences.matched = prefMatched;
  
  return updatedAnalysis;
};

// Calculate final score based on analysis and API type
export const calculateFinalScore = (result: JobAnalysisResult): number => {
  if (!result) return 0;
  
  // For work24 API type: 각 필수 조건은 50점씩 부여 (최대 100점)
  if (result.apiType === "work24") {
    console.log("Calculating final score for work24 API type (50 points per condition)");
    
    // 필수 사항이 있는 경우
    const reqTotal = result.requirements.total || 0;
    const reqMatched = result.requirements.matched || 0;
    
    // work24는 필수 조건 하나당 50점씩 부여
    return Math.min(reqMatched * 50, 100);
  }
  
  // For seoul API type (70-30 split)
  else {
    console.log("Calculating final score for seoul API type (70-30 split)");
    
    // Handle special case where there are no requirements or preferences
    const hasNoRequirements = !result.requirements.total || result.requirements.total === 0;
    const hasNoPreferences = !result.preferences.total || result.preferences.total === 0;
    
    if (hasNoRequirements && hasNoPreferences) {
      return 100;
    } else if (hasNoRequirements) {
      // 필수 사항이 없으면 필수 사항 70점 만점 부여
      const prefTotal = result.preferences.total || 1;
      const prefMatched = result.preferences.matched || 0;
      const prefScore = (prefMatched / prefTotal) * 30;
      return 70 + prefScore;
    } else if (hasNoPreferences) {
      // 우대 사항이 없으면 우대 사항 30점 만점 부여
      const reqTotal = result.requirements.total || 1;
      const reqMatched = result.requirements.matched || 0;
      const reqScore = (reqMatched / reqTotal) * 70;
      return reqScore + 30;
    }
    
    // Normal case
    const reqTotal = result.requirements.total || 1;
    const prefTotal = result.preferences.total || 1;
    const reqMatched = result.requirements.matched || 0;
    const prefMatched = result.preferences.matched || 0;
    
    // Calculate scores with standard 70-30 split
    const reqScore = (reqMatched / reqTotal) * 70;
    const prefScore = (prefMatched / prefTotal) * 30;
    
    const totalScore = reqScore + prefScore;
    return Math.round(totalScore);
  }
};
