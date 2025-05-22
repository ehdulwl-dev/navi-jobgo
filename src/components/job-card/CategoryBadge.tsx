
import React from "react";

interface CategoryBadgeProps {
  category?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  if (!category) return null;
  
  return (
    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
      {category}
    </span>
  );
};
