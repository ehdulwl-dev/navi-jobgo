
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Header from "../components/Header";
import CoverLetterTemplate from "../components/cover-letter/CoverLetterTemplate";
import PdfGenerator from "../components/cover-letter/PdfGenerator";
import useCoverLetterData from "../hooks/useCoverLetterData";

const CoverLetterTemplatePreview = () => {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const { coverLetter, userName, loading, saveCoverLetter } = useCoverLetterData();

  // 데이터 로딩 상태 확인
  useEffect(() => {
    if (!loading && coverLetter) {
      console.log("자기소개서 데이터 로드 완료:", coverLetter);
      console.log("사용자 이름:", userName);
    }
  }, [loading, coverLetter, userName]);

  const handleZoomIn = () => {
    if (zoomLevel < 1.5) {
      setZoomLevel(prev => prev + 0.1);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 0.5) {
      setZoomLevel(prev => prev - 0.1);
    }
  };

  const handleBack = () => {
    navigate("/cover-letter/template-select");
  };

  if (loading || !coverLetter) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="자기소개서" />
      <div className="max-w-[800px] mx-auto px-6 py-8">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h2 className="text-2xl font-bold">미리보기</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">아래와 같이 저장될 예정입니다.</p>

        <PdfGenerator 
          contentRef={contentRef}
          coverLetter={coverLetter}
          userName={userName}
          zoomLevel={zoomLevel}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          hideDownload={true}
        />
        
        <div className="border rounded-lg bg-white shadow-sm overflow-hidden mb-6 preview-container">
          <div 
            className="bg-white p-6" 
            style={{ 
              transform: `scale(${zoomLevel})`, 
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease'
            }}
            ref={contentRef}
          >
            <CoverLetterTemplate coverLetter={coverLetter} userName={userName} />
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <Button
            variant="outline"
            className="w-1/2"
            onClick={handleBack}
          >
            이전
          </Button>
          <Button
            className="w-1/2 bg-yellow-400 hover:bg-yellow-500 text-black"
            onClick={saveCoverLetter}
          >
            저장하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterTemplatePreview;
