
import React from "react";
import { ExternalLink } from "lucide-react";
import LoadingSpinner from "../ui/LoadingSpinner";

interface Qualification {
  id: string;
  name: string;
  isMatched: boolean;
}

interface AdviceItem {
  id: string;
  qualification: string;
  advice: string;
  hasLink: boolean;
}

interface ImprovementSectionProps {
  requiredQualifications: Qualification[];
  preferredQualifications: Qualification[];
  adviceItems?: AdviceItem[];
  isLoadingAdvice?: boolean;
}

const ImprovementSection: React.FC<ImprovementSectionProps> = ({
  requiredQualifications,
  preferredQualifications,
  adviceItems = [],
  isLoadingAdvice = false,
}) => {
  const unmetRequired = requiredQualifications.filter(q => !q.isMatched);
  const unmetPreferred = preferredQualifications.filter(q => !q.isMatched);

  if (unmetRequired.length === 0 && unmetPreferred.length === 0) {
    return null;
  }

  // Helper function to find advice for a qualification
  const findAdviceForQualification = (qualId: string): AdviceItem | undefined => {
    return adviceItems.find(advice => advice.id === qualId);
  };

  // Open Q-Net link in a new window
  const openQNetSearch = (keyword: string) => {
    const searchUrl = `https://www.q-net.or.kr/crf005.do?id=crf00503&gSite=Q&gId=&jmCd=&jmInfoDivCcd=&jmNm=${encodeURIComponent(keyword)}`;
    window.open(searchUrl, '_blank');
  };

  if (isLoadingAdvice) {
    return (
      <div className="mt-8 mb-8">
        <h3 className="text-lg font-semibold mb-4">이렇게 점수를 올려요</h3>
        <div className="flex flex-col items-center justify-center p-8">
          <LoadingSpinner 
            text="조언을 생성하고 있어요..." 
            className="h-8 w-8 text-blue-500"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-8">
      <h3 className="text-lg font-semibold mb-4">이렇게 점수를 올려요</h3>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
          {unmetRequired.map((qual) => {
            const advice = findAdviceForQualification(qual.id);
            
            return (
              <div key={`req-${qual.id}`} className="flex-shrink-0 w-60 p-4 rounded-lg" style={{ backgroundColor: "#D3E4FD" }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                  </div>
                  <div className="font-medium">자격 사항</div>
                </div>
                {advice && (
                  <div>
                    <p className="text-sm text-blue-800">{advice.advice}</p>
                    {advice.hasLink && (
                      <button 
                        onClick={() => openQNetSearch(qual.name)}
                        className="mt-2 flex items-center text-xs text-blue-600 hover:underline"
                      >
                        <ExternalLink size={12} className="mr-1" />
                        자격증 정보 확인하기
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {unmetPreferred.map((qual) => {
            const advice = findAdviceForQualification(qual.id);
            
            return (
              <div key={`pref-${qual.id}`} className="flex-shrink-0 w-60 p-4 rounded-lg" style={{ backgroundColor: "#E5DEFF" }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                      <circle cx="12" cy="8" r="7"></circle>
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                    </svg>
                  </div>
                  <div className="font-medium">우대 사항</div>
                </div>
                {advice && (
                  <div>
                    <p className="text-sm text-purple-800">{advice.advice}</p>
                    {advice.hasLink && (
                      <button 
                        onClick={() => openQNetSearch(qual.name)}
                        className="mt-2 flex items-center text-xs text-purple-600 hover:underline"
                      >
                        <ExternalLink size={12} className="mr-1" />
                        자격증 정보 확인하기
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ImprovementSection;
