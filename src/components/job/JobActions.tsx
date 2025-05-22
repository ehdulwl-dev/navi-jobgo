import React, { useState, useEffect } from "react";
import { Briefcase, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isJobFavorite } from "@/services/jobService";

interface JobActionsProps {
  jobId: string | number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onApplyClick: () => void;
}

const JobActions: React.FC<JobActionsProps> = ({
  jobId,
  isFavorite,
  onToggleFavorite,
  onApplyClick,
}) => {
  const [currentIsFavorite, setCurrentIsFavorite] = useState<boolean>(isFavorite);
  
  // Keep favorite state in sync with global state
  useEffect(() => {
    setCurrentIsFavorite(isFavorite);
    
    const handleFavoritesUpdated = (event: Event) => {
      const detail = (event as CustomEvent)?.detail;
      // Only update if this event is for this job or doesn't specify a job
      if (!detail?.jobId || detail.jobId === jobId.toString()) {
        setCurrentIsFavorite(isJobFavorite(jobId));
      }
    };
    
    window.addEventListener("favoritesUpdated", handleFavoritesUpdated);
    
    return () => {
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdated);
    };
  }, [jobId, isFavorite]);

  return (
    <div className="fixed bottom-[72px] left-0 right-0 p-4 bg-white border-t border-gray-100 flex gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleFavorite}
        className={cn(
          "rounded-full transition-colors",
          currentIsFavorite
            ? "bg-[#FFE376] text-black"
            : "text-gray-500 hover:bg-[#FFE376] hover:text-black"
        )}
      >
        <Star fill={currentIsFavorite ? "currentColor" : "none"} />
      </Button>
      <Button
        className="flex-1 py-3 text-lg font-medium bg-[#FFE376] hover:bg-[#FFE376] text-black"
        onClick={onApplyClick}
      >
        <Briefcase className="ml-2" />
        지원하기
      </Button>
    </div>
  );
};

export default JobActions;
