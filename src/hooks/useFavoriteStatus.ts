
import { useState, useEffect } from "react";
import { isJobFavorite, getJobMatchScore } from "@/services/jobService";

/**
 * Custom hook to manage job favorite status and match score
 */
export function useFavoriteStatus(id: string | number, initialFavorite: boolean = false) {
  // Initialize with either the passed prop value OR check localStorage
  const [isFavoriteState, setIsFavoriteState] = useState<boolean>(
    initialFavorite || isJobFavorite(id)
  );
  
  const [matchScore, setMatchScore] = useState<number | null>(null);

  // Initialize and refresh the favorite state and score on component mount
  useEffect(() => {
    // Double-check current favorite status from source of truth
    const currentFavoriteState = isJobFavorite(id);
    
    console.log(`[useFavoriteStatus] Initial check for job ${id}, favorite:`, currentFavoriteState);
    
    // Update state if different from what we initialized with
    if (currentFavoriteState !== isFavoriteState) {
      setIsFavoriteState(currentFavoriteState);
    }
    
    // Get match score if it's a favorite
    if (currentFavoriteState) {
      const score = getJobMatchScore(id);
      setMatchScore(score);
    }
  }, [id, initialFavorite]);

  // Listen for global favorite updates
  useEffect(() => {
    // Listen for favorites updates from any source
    const handleFavoritesUpdated = (event: CustomEvent) => {
      const { jobId, isFavorite, allFavoriteIds } = (event as CustomEvent).detail;
      
      // Check if this is for this particular job or a global event
      if (jobId === id.toString() || !jobId) {
        // Always check the actual state from localStorage
        const currentFavoriteState = isJobFavorite(id);
        
        console.log(`[useFavoriteStatus] Favorites updated for job ${id}: ${currentFavoriteState}`);
        
        // Update our local state if it has changed
        if (currentFavoriteState !== isFavoriteState) {
          setIsFavoriteState(currentFavoriteState);
        }

        // Update score based on favorite status
        if (currentFavoriteState) {
          const updatedScore = getJobMatchScore(id);
          setMatchScore(updatedScore);
        } else {
          setMatchScore(null);
        }
      }
    };

    // Listen for analysis completion events
    const handleAnalysisCompleted = (event: CustomEvent) => {
      const { jobId } = (event as CustomEvent).detail;
      if (jobId === id.toString() && isFavoriteState) {
        console.log(`[useFavoriteStatus] Updating score for job ${id} after analysis completion`);
        const updatedScore = getJobMatchScore(id);
        setMatchScore(updatedScore);
      }
    };

    // Add event listeners
    window.addEventListener("favoritesUpdated", handleFavoritesUpdated as EventListener);
    window.addEventListener("jobAnalysisCompleted", handleAnalysisCompleted as EventListener);
    
    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdated as EventListener);
      window.removeEventListener("jobAnalysisCompleted", handleAnalysisCompleted as EventListener);
    };
  }, [id, isFavoriteState]);

  return { isFavoriteState, matchScore, setIsFavoriteState };
}
