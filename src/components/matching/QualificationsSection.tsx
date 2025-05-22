
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import QualificationItem from "./QualificationItem";

interface Qualification {
  id: string;
  name: string;
  isMatched: boolean;
}

interface QualificationsSectionProps {
  title: string;
  qualifications: Qualification[];
}

const QualificationsSection: React.FC<QualificationsSectionProps> = ({
  title,
  qualifications,
}) => {
  // 오류 메시지가 포함된 자격 요건이 있는지 확인
  const hasErrorMessages = qualifications.some(q => 
    q.name.includes("오류") || 
    q.name.includes("실패") || 
    q.name.includes("다시 시도")
  );

  // 자격 요건이 없거나 오류 메시지만 있는 경우 처리
  if (qualifications.length === 0 || hasErrorMessages) {
    return null;
  }

  const matchedCount = qualifications.filter((q) => q.isMatched).length;
  const totalCount = qualifications.length;
  
  return (
    <Collapsible>
      <Card>
        <CollapsibleTrigger className="w-full text-left p-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">{title}</span>
            <span className="text-sm text-gray-600">
              {totalCount}개 중 {matchedCount}개를 만족했어요
            </span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid gap-3 py-4">
              {qualifications.map((qual) => (
                <QualificationItem
                  key={qual.id}
                  name={qual.name}
                  isMatched={qual.isMatched}
                />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default QualificationsSection;
