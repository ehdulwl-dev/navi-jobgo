
import { JobAnalysisResult } from './types';

const CACHE_KEY_PREFIX = 'job-analysis-';
const JOBS_BEING_ANALYZED_KEY = 'jobs-being-analyzed';
const FAILED_JOBS_KEY = 'failed-jobs';

// Helper to save and retrieve from localStorage with expiration
const getFromLocalStorage = <T>(key: string): T | null => {
  const item = localStorage.getItem(key);
  if (!item) return null;
  
  try {
    const parsedItem = JSON.parse(item);
    // Check if item has expired
    if (parsedItem.expiry && parsedItem.expiry < Date.now()) {
      localStorage.removeItem(key);
      return null;
    }
    return parsedItem.value;
  } catch (e) {
    console.error('Error parsing from localStorage:', e);
    return null;
  }
};

const saveToLocalStorage = <T>(key: string, value: T, expiryInMs = 24 * 60 * 60 * 1000): void => {
  const item = {
    value,
    expiry: Date.now() + expiryInMs
  };
  localStorage.setItem(key, JSON.stringify(item));
};

// Functions to manage job analysis cache
export const saveJobAnalysisToCache = (jobId: string | number, result: JobAnalysisResult): void => {
  saveToLocalStorage(`${CACHE_KEY_PREFIX}${jobId}`, result);
};

export const getJobAnalysisFromCache = (jobId: string | number): JobAnalysisResult | null => {
  return getFromLocalStorage<JobAnalysisResult>(`${CACHE_KEY_PREFIX}${jobId}`);
};

export const removeJobAnalysisFromCache = (jobId: string | number): void => {
  localStorage.removeItem(`${CACHE_KEY_PREFIX}${jobId}`);
};

// Functions to manage jobs being analyzed
export const getJobsBeingAnalyzed = (): Set<string> => {
  const jobs = getFromLocalStorage<string[]>(JOBS_BEING_ANALYZED_KEY) || [];
  return new Set(jobs);
};

export const addJobBeingAnalyzed = (jobId: string | number): void => {
  const jobs = getJobsBeingAnalyzed();
  jobs.add(jobId.toString());
  saveToLocalStorage(JOBS_BEING_ANALYZED_KEY, Array.from(jobs), 5 * 60 * 1000); // 5 minutes expiry
};

export const removeJobBeingAnalyzed = (jobId: string | number): void => {
  const jobs = getJobsBeingAnalyzed();
  jobs.delete(jobId.toString());
  saveToLocalStorage(JOBS_BEING_ANALYZED_KEY, Array.from(jobs), 5 * 60 * 1000);
};

export const isJobBeingAnalyzed = (jobId: string | number): boolean => {
  return getJobsBeingAnalyzed().has(jobId.toString());
};

// Functions to manage failed jobs
export const getFailedJobs = (): Map<string, number> => {
  const failedJobs = getFromLocalStorage<Record<string, number>>(FAILED_JOBS_KEY) || {};
  return new Map(Object.entries(failedJobs));
};

export const addFailedJob = (jobId: string | number): void => {
  const failedJobs = getFailedJobs();
  failedJobs.set(jobId.toString(), Date.now());
  saveToLocalStorage(FAILED_JOBS_KEY, Object.fromEntries(failedJobs));
};

export const removeFailedJob = (jobId: string | number): void => {
  const failedJobs = getFailedJobs();
  failedJobs.delete(jobId.toString());
  saveToLocalStorage(FAILED_JOBS_KEY, Object.fromEntries(failedJobs));
};

export const hasJobFailedRecently = (jobId: string | number, cooldownMs = 60000): boolean => {
  const failedJobs = getFailedJobs();
  const lastFailTime = failedJobs.get(jobId.toString());
  return !!lastFailTime && (Date.now() - lastFailTime < cooldownMs);
};

// Helper function to create error result
export const createErrorResult = (errorMessage: string): JobAnalysisResult => {
  return {
    requirements: {
      total: 0,
      matched: 0,
      items: [{ text: errorMessage, matched: false, clarificationNeeded: false }]
    },
    preferences: {
      total: 0,
      matched: 0,
      items: [{ text: errorMessage, matched: false, clarificationNeeded: false }]
    }
  };
};

// Helper function to check if a result contains error messages
export const hasErrorMessages = (result: JobAnalysisResult): boolean => {
  if (!result || !result.requirements || !result.preferences) return true;
  
  const requirementErrors = result.requirements.items.some(item => 
    item.text.includes("오류") || 
    item.text.includes("실패") || 
    item.text.includes("다시 시도") ||
    item.text.includes("분석이 진행 중")
  );
  
  const preferenceErrors = result.preferences.items.some(item => 
    item.text.includes("오류") || 
    item.text.includes("실패") || 
    item.text.includes("다시 시도") ||
    item.text.includes("분석이 진행 중")
  );
  
  return requirementErrors || preferenceErrors;
};

// Helper to check if analysis has clarification questions
export const hasClarificationNeeded = (result: JobAnalysisResult | null): boolean => {
  if (!result) return false;
  
  const requirementQuestions = result.requirements.items.some(item => item.clarificationNeeded);
  const preferenceQuestions = result.preferences.items.some(item => item.clarificationNeeded);
  
  return requirementQuestions || preferenceQuestions;
};

// Helper to check if analysis is complete and ready to show
export const isAnalysisComplete = (result: JobAnalysisResult | null): boolean => {
  if (!result) return false;
  if (hasErrorMessages(result)) return false;
  return true;
};

// Calculate the match score based on analysis result
export const calculateMatchScore = (result: JobAnalysisResult | null): number | null => {
  if (!result || hasErrorMessages(result)) {
    console.log("No valid result or has errors, returning null");
    return null;
  }
  
  // If analysis is complete but has clarification questions that haven't been answered
  if (hasClarificationNeeded(result)) {
    console.log("Analysis has unanswered clarification questions, returning null");
    return null;
  }
  
  // Ensure requirements and preferences have valid data
  if (!result.requirements || !result.preferences) {
    console.log("Missing requirements or preferences, returning 0");
    return 0;
  }
  
  // Log detailed calculation for debugging
  console.log("Analysis result for score calculation:", { 
    reqMatched: result.requirements.matched,
    reqTotal: result.requirements.total,
    prefMatched: result.preferences.matched,
    prefTotal: result.preferences.total,
    apiType: result.apiType
  });
  
  // Different score calculation based on API type
  // For work24 API: 50% for requirements, 50% for preferences (instead of 70-30)
  if (result.apiType === "work24") {
    console.log("Calculating score for work24 API type (50-50 split)");
  
    const reqMatched = result.requirements.matched || 0;

    // work24는 필수 조건당 50점, 최대 100점
    const score = Math.min(reqMatched * 50, 100);
  
    console.log("Calculated work24 score (final version):", { reqMatched, score });
  
    return score;
  }
  
  // For seoul API type: 70% for requirements, 30% for preferences
  else if (result.apiType === "seoul") {
    // If there are no requirements to match (total is 0), give full score for requirements
    const hasNoRequirements = !result.requirements.total || result.requirements.total === 0;
    // If there are no preferences to match (total is 0), give full score for preferences
    const hasNoPreferences = !result.preferences.total || result.preferences.total === 0;
    
    if (hasNoRequirements && hasNoPreferences) {
      console.log("Seoul API job with no requirements or preferences, returning full score (100)");
      return 100;
    } else if (hasNoRequirements) {
      // If no requirements but there are preferences, give full score (70) for requirements part
      console.log("Seoul API job with no requirements, giving full score for requirements portion");
      const prefTotal = result.preferences.total || 1;
      const prefMatched = result.preferences.matched || 0;
      const prefScore = (prefMatched / prefTotal) * 30;
      return 70 + prefScore;
    } else if (hasNoPreferences) {
      // If no preferences but there are requirements, give full score (30) for preferences part
      console.log("Seoul API job with no preferences, giving full score for preferences portion");
      const reqTotal = result.requirements.total || 1;
      const reqMatched = result.requirements.matched || 0;
      const reqScore = (reqMatched / reqTotal) * 70;
      return reqScore + 30;
    }
    
    // Handle edge cases to prevent NaN
    const reqTotal = result.requirements.total || 1; // Avoid division by zero
    const prefTotal = result.preferences.total || 1; // Avoid division by zero
    const reqMatched = result.requirements.matched || 0;
    const prefMatched = result.preferences.matched || 0;
    
    // Calculate scores with 70-30 split for seoul
    const reqScore = (reqMatched / reqTotal) * 70;
    const prefScore = (prefMatched / prefTotal) * 30;
    
    const totalScore = reqScore + prefScore;
    console.log("Calculated seoul score:", { reqScore, prefScore, totalScore });
    
    return isNaN(totalScore) ? 0 : Math.round(totalScore);
  }
  
  // Default case (unknown API type) - use 70-30 split
  const reqTotal = result.requirements.total || 1; // Avoid division by zero
  const prefTotal = result.preferences.total || 1; // Avoid division by zero
  const reqMatched = result.requirements.matched || 0;
  const prefMatched = result.preferences.matched || 0;
  
  const reqScore = (reqMatched / reqTotal) * 70;
  const prefScore = (prefMatched / prefTotal) * 30;
  
  const totalScore = reqScore + prefScore;
  console.log("Calculated default score (70-30 split):", { reqScore, prefScore, totalScore });
  
  return isNaN(totalScore) ? 0 : Math.round(totalScore);
};

