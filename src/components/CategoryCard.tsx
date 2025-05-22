
import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  icon: LucideIcon;
  backgroundColor?: string;
  to?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  title, 
  icon: Icon, 
  backgroundColor = "bg-blue-100",
  to
}) => {
  const cardContent = (
    <div className={`${backgroundColor} p-4 rounded-lg flex items-center`}>
      <Icon className="text-gray-700 mr-2" size={20} />
      <span className="font-medium">{title}</span>
    </div>
  );

  return to ? (
    <Link to={to}>
      {cardContent}
    </Link>
  ) : (
    cardContent
  );
};

export default CategoryCard;
