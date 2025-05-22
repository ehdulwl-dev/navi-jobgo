
import React, { useEffect } from "react";
import { Separator } from "@/components/ui/separator";

interface CoverLetterTemplateProps {
  coverLetter: any;
  userName: string;
}

const CoverLetterTemplate = ({ coverLetter, userName }: CoverLetterTemplateProps) => {
  // 실제 데이터가 렌더링되는지 확인을 위한 콘솔 로그
  console.log("Rendering cover letter with data:", coverLetter);
  console.log("User name:", userName);
  
  // 마운트 시 데이터 검증
  useEffect(() => {
    // 필수 데이터 체크
    if (!coverLetter) {
      console.error("자기소개서 데이터가 없습니다.");
      return;
    }
    
    if (!coverLetter.sections || coverLetter.sections.length === 0) {
      console.error("자기소개서 섹션 데이터가 없습니다.");
      return;
    }
    
    console.log("Template being used:", coverLetter.template?.id);
    console.log("Number of sections:", coverLetter.sections.length);
    
    // 섹션별 데이터 체크
    coverLetter.sections.forEach((section: any, idx: number) => {
      console.log(`Section ${idx + 1} - Question:`, section.question);
      console.log(`Section ${idx + 1} - Answer length:`, section.answer ? section.answer.length : 0);
    });
  }, [coverLetter]);
  
  // 텍스트를 문단으로 분리하여 각 줄마다 분리 가능하도록 처리하는 함수
  const renderTextWithLineBreaks = (text: string) => {
    if (!text) return null;
    
    // 문단 단위로 분리 (빈 줄로 구분된 문단)
    const paragraphs = text.split(/\n\s*\n/);
    
    return paragraphs.map((paragraph, index) => {
      // 각 문단 내의 줄바꿈 처리
      const lines = paragraph.split('\n');
      
      return (
        <p key={index} className="mb-3 page-break-inside-avoid line-break-container" data-paragraph={index}>
          {lines.map((line, lineIdx) => (
            <React.Fragment key={lineIdx}>
              <span className="line-content">{line}</span>
              {lineIdx < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      );
    });
  };
  
  // 기본 템플릿 스타일을 제공된 이미지를 기반으로 생성
  if (coverLetter?.template?.id === "template1") {
    return (
      <div className="w-full mx-auto bg-white relative page-content pdf-content" id="pdf-content">
        {/* 헤더 - 회사명을 상단에 표시 */}
        <div className="text-center mb-6 page-break-inside-avoid">
          <h1 className="text-3xl font-bold mb-3">자기소개서</h1>
          <h2 className="text-2xl mb-2">{coverLetter.company || '회사명'}</h2>
          <Separator className="h-0.5 bg-gray-400 mt-4 mb-6 w-full" />
        </div>
        
        {/* 이름 */}
        <div className="text-right mb-6 page-break-inside-avoid">
          <p className="text-xl font-medium">{userName || '이름'}</p>
        </div>
        
        {/* 내용 섹션 - 각 섹션이 독립적으로 페이지 나누기 처리되도록 수정 */}
        <div className="space-y-6">
          {coverLetter.sections && coverLetter.sections.map((section: any, idx: number) => (
            <div key={idx} className="question-section page-break-inside-avoid mb-10" data-section-id={`section-${idx}`}>
              {/* 질문 헤더 */}
              <div className="question-header bg-gray-200 p-3 text-left border-b border-gray-300 mb-3 page-break-inside-avoid">
                <span className="text-lg font-medium">{section.question || `질문 ${idx + 1}`}</span>
              </div>
              
              {/* 답변 내용 - 줄 단위로 페이지 나눔 방지 */}
              <div className="answer-content p-4 min-h-[100px] whitespace-pre-line">
                {renderTextWithLineBreaks(section.answer || `답변 ${idx + 1}`)}
              </div>
              
              {/* 섹션 사이에 충분한 공간 추가 - 페이지 나눔 개선 */}
              {idx < coverLetter.sections.length - 1 && <div className="h-12"></div>}
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // 다른 템플릿을 위한 기본 템플릿 렌더링 - 회사명 표시 및 페이지 나누기 개선
  return (
    <div id="pdf-content" className="w-full mx-auto bg-white page-content pdf-content">
      <div className="flex flex-col items-center mb-8 page-break-inside-avoid">
        <h1 className="text-3xl font-bold mb-3">자기소개서</h1>
        <h2 className="text-2xl mb-3">{coverLetter?.company || '회사명'}</h2>
        <Separator className="h-0.5 bg-gray-400 w-full mt-4" />
      </div>

      <div className="text-right mb-6 page-break-inside-avoid">
        <p className="text-xl font-medium">{userName || '이름'}</p>
      </div>

      {coverLetter?.sections && coverLetter.sections.map((section: any, idx: number) => (
        <div key={idx} className="question-section mb-10 page-break-inside-avoid" data-section-id={`section-${idx}`}>
          <h3 className="question-header font-bold mb-3 text-xl text-left bg-gray-100 p-3 page-break-inside-avoid">
            {idx + 1}. {section.question || `질문 ${idx + 1}`}
          </h3>
          <div className="answer-content whitespace-pre-line text-base p-4">
            {renderTextWithLineBreaks(section.answer || `답변 ${idx + 1}`)}
          </div>
          
          {/* 섹션 사이에 충분한 공간 추가 - 페이지 나눔 개선 */}
          {idx < coverLetter.sections.length - 1 && <div className="h-12"></div>}
        </div>
      ))}
    </div>
  );
};

export default CoverLetterTemplate;
