
import { useState } from 'react';
import { toast } from 'sonner';
import { CoverLetterData } from '@/hooks/useCoverLetterData';
import { createPdfFromHtml, getTemplateName } from './coverLetterPdfUtils';
import CoverLetterTemplate from '../CoverLetterTemplate';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

export const useCoverLetterPdfGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async (coverLetter: CoverLetterData, userName: string = "이름") => {
    if (isGenerating || !coverLetter) {
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // 원본 데이터를 복사하여 사용 (원본 데이터 변경 방지)
      const coverLetterCopy = JSON.parse(JSON.stringify(coverLetter));
      
      console.log("Rendering cover letter with data:", coverLetterCopy);
      console.log("User name:", userName);
      
      // React 컴포넌트를 HTML 문자열로 변환
      const templateElement = React.createElement(CoverLetterTemplate, {
        coverLetter: coverLetterCopy,
        userName: userName
      });
      
      const htmlContent = ReactDOMServer.renderToString(templateElement);
      
      // 스타일을 포함한 완전한 HTML 문서 생성 - A4 비율 및 페이지 나눔 개선
      const completeHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap');
              
              body {
                font-family: 'Nanum Gothic', sans-serif;
                line-height: 1.8;
                color: #333;
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
              }
              
              .page-container {
                padding: 10mm 10mm;
                box-sizing: border-box;
                width: 100%;
                background-color: white;
                position: relative;
              }
              
              .section {
                margin-bottom: 24px;
              }
              
              .header {
                border-bottom: 2px solid #1f2937;
                padding-bottom: 16px;
                margin-bottom: 24px;
                text-align: center;
              }
              
              .name-section {
                text-align: right;
                margin-bottom: 24px;
              }
              
              .question-section {
                margin-bottom: 32px;
                border: 1px solid #d1d5db;
                break-inside: avoid;
                page-break-inside: avoid;
              }
              
              .question-header {
                background-color: #f3f4f6;
                padding: 12px;
                border-bottom: 1px solid #d1d5db;
                font-weight: 500;
                page-break-inside: avoid;
                break-inside: avoid;
              }
              
              .answer-content {
                padding: 16px;
                min-height: 100px;
                white-space: pre-line;
              }
              
              /* 줄 단위 페이지 나눔 방지 개선 */
              .line-break-container {
                page-break-inside: avoid;
                break-inside: avoid;
                margin-bottom: 1em;
              }
              
              p {
                page-break-inside: avoid;
                break-inside: avoid;
                margin-bottom: 16px;
                line-height: 1.8;
              }
              
              /* 텍스트 줄 스타일링 */
              .line-content {
                display: inline-block;
                min-height: 1.8em;
              }
              
              /* PDF 내용이 완전히 보이도록 페이지 나눔 개선 */
              .pdf-content {
                width: 100%;
                height: auto !important;
                overflow: visible !important;
              }
              
              /* A4 비율과 페이지 나눔 개선 */
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 10mm;
                }
                
                .page-break-inside-avoid {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                }
                
                .pdf-content {
                  font-size: 110%;
                }
                
                /* 섹션 간 여백을 명확히 설정 */
                .question-section {
                  margin-bottom: 40px;
                }
                
                /* 페이지 나누기 강제 설정 */
                .page-break-after {
                  page-break-after: always;
                  break-after: page;
                }
                
                /* 줄 간격 명확하게 설정 */
                p, .line-break-container {
                  line-height: 1.8;
                  margin-bottom: 1em;
                }
              }
              
              /* 질문과 답변 사이의 간격 조정 */
              .question-section + .question-section {
                margin-top: 50px; /* 섹션 간 간격 증가 */
                padding-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="page-container">
              ${htmlContent}
            </div>
          </body>
        </html>
      `;
      
      // 임시 div 생성 - 내용이 제대로 렌더링될 수 있는 충분한 공간 확보
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      
      // 미리보기 요소 너비 가져오기
      const previewContainer = document.querySelector('.preview-container') as HTMLElement;
      const previewWidth = previewContainer ? previewContainer.offsetWidth : 800;
      
      // A4 비율 설정 및 내용에 맞게 높이 설정
      tempDiv.style.width = `${previewWidth}px`;
      tempDiv.style.minHeight = `${previewWidth * 1.414}px`; // A4 비율에 맞게 최소 높이 설정
      tempDiv.style.maxHeight = 'none'; // 최대 높이 제한 없음
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.overflow = 'visible';
      tempDiv.style.position = 'absolute';
      document.body.appendChild(tempDiv);
      
      // HTML 삽입
      tempDiv.innerHTML = completeHtml;
      
      // DOM 렌더링을 위한 대기 시간 증가 - 폰트 및 스타일이 적용될 충분한 시간 확보
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 텍스트 줄 단위 페이지 나눔 방지를 위한 스타일 적용
      const paragraphs = tempDiv.querySelectorAll('p, .line-break-container');
      paragraphs.forEach(p => {
        (p as HTMLElement).style.lineHeight = '1.8';
        (p as HTMLElement).style.pageBreakInside = 'avoid';
        (p as HTMLElement).style.breakInside = 'avoid';
        (p as HTMLElement).style.marginBottom = '1em';
      });
      
      // 텍스트 줄 요소에 명시적 스타일 적용
      const lineContents = tempDiv.querySelectorAll('.line-content');
      lineContents.forEach(line => {
        (line as HTMLElement).style.display = 'inline-block';
        (line as HTMLElement).style.minHeight = '1.8em';
      });
      
      // 질문 헤더에 명시적 페이지 나눔 방지 적용
      const questionHeaders = tempDiv.querySelectorAll('.question-header');
      questionHeaders.forEach(header => {
        (header as HTMLElement).style.pageBreakInside = 'avoid';
        (header as HTMLElement).style.pageBreakAfter = 'avoid';
        (header as HTMLElement).style.breakInside = 'avoid';
        (header as HTMLElement).style.breakAfter = 'avoid';
        (header as HTMLElement).style.paddingBottom = '0.5em';
      });
      
      // PDF 파일명 생성
      const templateName = getTemplateName(coverLetterCopy.template?.id);
      const fileName = `자기소개서_${coverLetterCopy.company || '회사'}_${coverLetterCopy.position || '직무'}_${templateName}_${new Date().toLocaleDateString('ko-KR').replace(/\./g, '')}.pdf`;
      
      // 실제 높이 계산 - 모든 콘텐츠가 표시되도록 충분히 크게 설정
      const actualHeight = tempDiv.scrollHeight;
      tempDiv.style.height = `${actualHeight}px`;
      
      // PDF 생성 및 저장
      await createPdfFromHtml(tempDiv, fileName);
      
      // 임시 div 제거
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('PDF 생성 중 오류 발생:', error);
      toast.error("PDF 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  return {
    isGenerating,
    generatePDF
  };
};
