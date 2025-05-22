
import React from "react";
import { toggleFavoriteJob } from "@/services/jobService";
import { toast } from "sonner";
import { useFavoriteStatus } from "@/hooks/useFavoriteStatus";
import { FavoriteButton } from "./job-card/FavoriteButton";
import { JobCardContent } from "./job-card/JobCardContent";

interface JobCardProps {
  id: string | number;
  title: string;
  company: string;
  location?: string;
  category?: string;
  highlight?: string;
  deadline?: Date | null;
  isFavorite?: boolean;
  regDate?: Date;
  hideFavorite?: boolean;
  onClick?: () => void;
  onFavoriteClick?: (id: string | number, isFavorite: boolean) => void;
  showMatchScore?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({
  id,
  title,
  company,
  category,
  highlight,
  deadline,
  hideFavorite = false,
  isFavorite = false,
  onClick,
  onFavoriteClick,
  showMatchScore = false,
}) => {
  const { isFavoriteState, matchScore, setIsFavoriteState } = useFavoriteStatus(
    id, 
    isFavorite
  );

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    console.log("[JobCard] handleFavoriteClick called for job", id); 
    
    try {
      // Toggle favorite status and get the new state
      const newFavoriteState = await toggleFavoriteJob(id);
      console.log("[JobCard] toggleFavoriteJob result:", newFavoriteState);
      
      // Update local state immediately to provide instant feedback
      setIsFavoriteState(newFavoriteState);
      
      // Notify parent component if callback provided
      if (onFavoriteClick) {
        console.log("[JobCard] Notifying parent via onFavoriteClick");
        onFavoriteClick(id, newFavoriteState);
      }
    } catch (error) {
      console.error(`[JobCard] Error toggling favorite for job ${id}:`, error);
      toast.error("관심 공고 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <article
      onClick={onClick}
      className="relative bg-white border-2 border-gray-200 rounded-2xl p-3 cursor-pointer hover:shadow transition"
    >
      {!hideFavorite && (
        <FavoriteButton 
          isFavorite={isFavoriteState} 
          onClick={handleFavoriteClick} 
        />
      )}

      <JobCardContent
        title={title}
        company={company}
        category={category}
        highlight={highlight}
        deadline={deadline}
        hideFavorite={hideFavorite}
        isFavorite={isFavoriteState}
        showMatchScore={showMatchScore}
        matchScore={matchScore}
      />
    </article>
  );
};

export default JobCard;
