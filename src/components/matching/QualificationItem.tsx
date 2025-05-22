
import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface QualificationItemProps {
  name: string;
  isMatched: boolean;
}

const QualificationItem: React.FC<QualificationItemProps> = ({ name, isMatched }) => {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg ${
        isMatched ? "bg-green-50" : "bg-red-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm">{name}</span>
      </div>
      {isMatched ? (
        <CheckCircle2 size={20} className="text-green-500" />
      ) : (
        <XCircle size={20} className="text-red-500" />
      )}
    </div>
  );
};

export default QualificationItem;

