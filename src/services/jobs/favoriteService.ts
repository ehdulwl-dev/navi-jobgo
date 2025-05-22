
import { analyzeJobDirectly } from "./directAnalysisService";
import { calculateMatchScore, getJobAnalysisFromCache, removeJobAnalysisFromCache } from "./analysis/cacheUtils";

// Get favorite job IDs from localStorage
export const getFavoriteJobIds = (): string[] => {
  try {
    const stored = localStorage.getItem("favoriteJobIds");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error getting favorite job IDs:", error);
    return [];
  }
};

// Set favorite job IDs in localStorage
export const setFavoriteJobIds = (ids: string[]): void => {
  try {
    localStorage.setItem("favoriteJobIds", JSON.stringify(ids));
  } catch (error) {
    console.error("Error setting favorite job IDs:", error);
  }
};

// Check if a job is favorite
export const isJobFavorite = (jobId: string | number): boolean => {
  try {
    const favoriteJobs = getFavoriteJobIds();
    return favoriteJobs.includes(jobId.toString());
  } catch (error) {
    console.error("Error checking if job is favorite:", error);
    return false;
  }
};

// Get match score for a job from the cache
export const getJobMatchScore = (jobId: string | number): number | null => {
  try {
    const cachedAnalysis = getJobAnalysisFromCache(jobId);
    const score = calculateMatchScore(cachedAnalysis);
    
    // Debug logging to trace score calculation
    console.log(`[favoriteService] Getting match score for job ${jobId}:`, { 
      hasAnalysis: !!cachedAnalysis,
      apiType: cachedAnalysis?.apiType,
      calculatedScore: score
    });
    
    return score;
  } catch (error) {
    console.error("Error getting job match score:", error);
    return null;
  }
};

// Check if a job needs clarification questions
export const jobNeedsClarification = (jobId: string | number): boolean => {
  try {
    const cachedAnalysis = getJobAnalysisFromCache(jobId);
    if (!cachedAnalysis) return false;
    
    // Check if there are clarification questions
    return cachedAnalysis.requirements.items.some(item => item.clarificationNeeded) ||
           cachedAnalysis.preferences.items.some(item => item.clarificationNeeded);
  } catch (error) {
    console.error("Error checking if job needs clarification:", error);
    return false;
  }
};

// Toggle favorite status for a job
export const toggleFavoriteJob = async (
  jobId: string | number
): Promise<boolean> => {
  console.log("[favoriteService] toggleFavoriteJob called for job", jobId);
  
  if (!jobId) {
    console.error("Invalid job ID:", jobId);
    return false;
  }
  
  const jobIdStr = jobId.toString();
  const current = getFavoriteJobIds();
  let newFavoriteJobs: string[];
  let newState: boolean;

  try {
    if (current.includes(jobIdStr)) {
      // Remove from favorites
      console.log(`[favoriteService] Removing job ${jobIdStr} from favorites`);
      newFavoriteJobs = current.filter((id) => id !== jobIdStr);
      newState = false;
      
      // When removing from favorites, also remove the analysis cache
      console.log(`[favoriteService] Removing analysis cache for job ${jobIdStr}`);
      removeJobAnalysisFromCache(jobIdStr);
    } else {
      // Add to favorites
      console.log(`[favoriteService] Adding job ${jobIdStr} to favorites`);
      newFavoriteJobs = [jobIdStr, ...current];
      newState = true;
      
      // When adding to favorites, trigger job analysis immediately
      try {
        console.log(`[favoriteService] Starting immediate job analysis for job ${jobIdStr}`);
        analyzeJobDirectly(jobIdStr).then((result) => {
          console.log(`[favoriteService] Analysis completed for job ${jobIdStr}:`, { 
            hasResult: !!result,
            apiType: result?.apiType,
            score: calculateMatchScore(result)
          });
          
          // Dispatch an event when analysis is complete to update UI
          window.dispatchEvent(
            new CustomEvent("jobAnalysisCompleted", {
              detail: { jobId: jobIdStr },
            })
          );
        });
      } catch (error) {
        console.error("[favoriteService] Failed to start job analysis:", error);
      }
    }

    // Update localStorage first
    setFavoriteJobIds(newFavoriteJobs);

    console.log(
      `[favoriteService] Dispatching favoritesUpdated event for job ${jobIdStr}, isFavorite=${newState}, totalFavorites=${newFavoriteJobs.length}`
    );

    // Dispatch a custom event to notify other components of the change
    window.dispatchEvent(
      new CustomEvent("favoritesUpdated", {
        detail: { 
          jobId: jobIdStr, 
          isFavorite: newState,
          allFavoriteIds: newFavoriteJobs 
        },
      })
    );

    return newState;
  } catch (error) {
    console.error("[favoriteService] Error toggling favorite job:", error);
    return isJobFavorite(jobId); // Return current state in case of error
  }
};
