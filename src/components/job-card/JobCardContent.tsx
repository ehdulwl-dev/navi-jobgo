
import React from "react";
import { cn } from "@/lib/utils";
import { CategoryBadge } from "./CategoryBadge";
import { MatchScore } from "./MatchScore";
import { JobStatusBadge } from "./JobStatusBadge";
import { getDeadlineDisplay } from "@/utils/dateUtils";

interface JobCardContentProps {
  title: string;
  company: string;
  category?: string;
  highlight?: string;
  deadline?: Date | null;
  hideFavorite?: boolean;
  isFavorite: boolean;
  showMatchScore?: boolean;
  matchScore: number | null;
}

export const JobCardContent: React.FC<JobCardContentProps> = ({
  title,
  company,
  category,
  highlight,
  deadline,
  hideFavorite = false,
  isFavorite,
  showMatchScore = false,
  matchScore,
}) => {
  return (
    <div className={cn("pr-2", !hideFavorite ? "pl-8" : "pl-0")}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {title.length > 13 ? `${title.slice(0, 13)}...` : title}
          </h3>
          <p className="text-gray-600 font-medium">
            {company ? (
              company.length > 15 ? (
                `${company.slice(0, 15)}...`
              ) : (
                company
              )
            ) : (
              <br />
            )}
          </p>
          <CategoryBadge category={category} />
        </div>

        {/* Show match score only when in favorites (showMatchScore is true) */}
        {isFavorite && showMatchScore ? (
          <MatchScore score={matchScore} />
        ) : (
          <JobStatusBadge highlight={highlight} />
        )}

        {getDeadlineDisplay(deadline) && (
          <div className="absolute bottom-5 right-7">
            <span className="text-xs text-gray-400">
              {getDeadlineDisplay(deadline)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
