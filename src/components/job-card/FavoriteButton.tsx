
import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ isFavorite, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute top-2 left-2 hover:scale-110 transition z-10"
      aria-label={
        isFavorite ? "관심 공고에서 제거" : "관심 공고에 추가"
      }
      type="button"
    >
      <Star
        size={24}
        className={cn(
          "transition-colors",
          isFavorite
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        )}
      />
    </button>
  );
};
