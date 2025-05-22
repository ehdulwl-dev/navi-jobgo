
import React from "react";
import { cn } from "@/lib/utils";

interface JobStatusBadgeProps {
  highlight?: string;
}

export const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({ highlight }) => {
  return (
    <span
      className={cn(
        "text-lg font-bold",
        highlight === "마감"
          ? "text-red-700"
          : highlight?.includes("D-") || highlight === "D-DAY"
          ? "text-[#ea384c]"
          : "text-[#3b82f6]"
      )}
    >
      {highlight && (highlight.includes("D-") || highlight === "D-DAY" || highlight === "마감")
        ? highlight
        : "모집중"}
    </span>
  );
};
