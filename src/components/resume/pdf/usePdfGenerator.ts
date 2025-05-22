
import { useState } from 'react';
import { toast } from 'sonner';
import { ResumeData } from '@/services/resumeService';
import { getTemplateName, generateTemplateHTML, createPdfFromHtml } from './resumePdfUtils';

export const usePdfGenerator = (resumeData: ResumeData) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    toast.info("PDF 생성 중...");
    
    try {
      // 원본 데이터를 복사하여 사용 (원본 데이터 변경 방지)
      // 깊은 복사를 확실히 하기 위해 JSON.stringify와 JSON.parse 사용
      const resumeDataCopy = JSON.parse(JSON.stringify(resumeData));
      
      // 임시 div 생성
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '800px'; // 너비 고정
      tempDiv.style.backgroundColor = 'white';
      document.body.appendChild(tempDiv);
      
      // 템플릿 HTML 생성 및 삽입
      tempDiv.innerHTML = generateTemplateHTML(resumeDataCopy);
      
      // 렌더링 후 잠시 대기 (폰트, 이미지 로딩을 위한 시간)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // PDF 생성 및 저장
      const templateName = getTemplateName();
      const fileName = `이력서_${resumeDataCopy.name || '이름'}_${templateName}_${new Date().toLocaleDateString('ko-KR').replace(/\./g, '')}.pdf`;
      
      await createPdfFromHtml(tempDiv, fileName);
      toast.success("PDF가 다운로드되었습니다!");
      
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
