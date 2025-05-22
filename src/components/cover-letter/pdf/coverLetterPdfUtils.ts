
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { CoverLetterData } from "@/hooks/useCoverLetterData";

/**
 * Create a PDF document from HTML content with improved performance
 */
export const createPdfFromHtml = async (
  tempDiv: HTMLDivElement,
  fileName: string
): Promise<void> => {
  try {
    toast.info("PDF 생성을 시작합니다...");
    
    // 폰트 로딩을 위한 잠시 대기 (충분한 시간 확보)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // A4 비율 계산 (1:1.414)
    const tempDivWidth = tempDiv.offsetWidth;
    const tempDivHeight = tempDiv.scrollHeight;
    
    // 최적화된 html2canvas 설정
    const canvas = await html2canvas(tempDiv, {
      scale: 2.5,               // 높은 해상도로 설정하여 선명도 개선
      logging: false,           // 로깅 비활성화
      backgroundColor: "#ffffff",
      allowTaint: true,         // 외부 이미지 허용
      useCORS: true,            // 크로스 오리진 리소스 허용
      imageTimeout: 5000,       // 타임아웃 설정 증가
      width: tempDivWidth,
      height: tempDivHeight,    // 전체 높이 사용
      windowWidth: tempDivWidth,
      windowHeight: tempDivHeight,
      onclone: (document, clone) => {
        // 텍스트 요소의 줄 높이 기준 정의
        const paragraphs = clone.querySelectorAll('p, .line-break-container');
        paragraphs.forEach(element => {
          (element as HTMLElement).style.pageBreakInside = 'avoid';
          (element as HTMLElement).style.breakInside = 'avoid';
          (element as HTMLElement).style.lineHeight = '1.8';
          (element as HTMLElement).style.marginBottom = '1em';
          (element as HTMLElement).dataset.lineElement = 'true';
        });
        
        // 질문 헤더에 명시적 표시
        const headers = clone.querySelectorAll('.question-header');
        headers.forEach(header => {
          (header as HTMLElement).dataset.header = 'true';
          (header as HTMLElement).style.pageBreakInside = 'avoid';
          (header as HTMLElement).style.pageBreakAfter = 'avoid';
          (header as HTMLElement).style.breakInside = 'avoid';
          (header as HTMLElement).style.breakAfter = 'avoid';
          (header as HTMLElement).style.paddingBottom = '0.5em';
        });
        
        return clone;
      }
    });
    
    // A4 크기 설정 (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // PDF 크기 계산
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // 페이지 여백 설정
    const marginTop = 10;
    const marginBottom = 10;
    const marginSides = 10;
    
    // 유효 콘텐츠 영역 계산
    const contentWidth = pdfWidth - (marginSides * 2);
    
    // 캔버스 이미지 비율 계산
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // PDF에 적합한 이미지 크기 계산
    const imgWidth = contentWidth;
    const imgHeight = (canvasHeight / canvasWidth) * imgWidth;
    
    // 각 페이지에 표시할 수 있는 높이 계산
    const pageContentHeight = pdfHeight - marginTop - marginBottom;
    
    // 픽셀 단위로 페이지 높이 계산
    const pageHeightInPixels = (pageContentHeight / imgHeight) * canvasHeight;
    
    // 줄 높이 픽셀 단위로 계산 (추정치)
    const lineHeightPixels = 36; // 약 36px (2.5 스케일 기준)
    
    // Canvas 이미지 데이터 분석하여 텍스트 줄 위치 찾기
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('캔버스 컨텍스트를 가져올 수 없습니다.');
    }
    
    // 페이지 나눔 계산 (줄 단위로 계산)
    let pageBreaks: number[] = [];
    pageBreaks.push(0); // 첫 페이지 시작점
    
    let currentPage = 1;
    let currentY = pageHeightInPixels; // 첫 페이지 끝점
    
    // 최대 페이지 수 설정 (무한루프 방지)
    const maxPages = Math.min(Math.ceil(canvasHeight / pageHeightInPixels) + 1, 20);
    
    while (currentY < canvasHeight && currentPage < maxPages) {
      // 현재 페이지 끝점 위치 계산 (픽셀)
      let idealPageBreak = currentPage * pageHeightInPixels;
      
      // 이상적인 페이지 끝점에서 텍스트 줄을 찾기 위해 위아래로 검색 범위 설정
      const searchStart = Math.max(0, idealPageBreak - lineHeightPixels * 3);
      const searchEnd = Math.min(canvasHeight, idealPageBreak + lineHeightPixels * 3);
      
      // 이상적 페이지 끝점 근처에서 안전한 줄바꿈 위치 찾기
      let bestBreakPosition = idealPageBreak;
      
      // 줄 간격의 배수로 위치 조정 (온전한 줄 유지)
      bestBreakPosition = Math.floor(idealPageBreak / lineHeightPixels) * lineHeightPixels;
      
      // 다음 페이지 시작점으로 설정 (찾은 줄 위치)
      currentY = bestBreakPosition;
      pageBreaks.push(currentY);
      currentPage++;
    }
    
    // 마지막으로 전체 높이 추가 (마지막 페이지 끝점)
    if (pageBreaks[pageBreaks.length - 1] < canvasHeight) {
      pageBreaks.push(canvasHeight);
    }
    
    // 페이지 나눔 확인 (디버깅)
    console.log("페이지 나눔 위치 (픽셀):", pageBreaks);
    console.log("총 페이지 수:", pageBreaks.length - 1);
    console.log("캔버스 전체 높이:", canvasHeight);
    console.log("페이지당 높이 (픽셀):", pageHeightInPixels);
    
    // 각 페이지마다 해당 영역만 잘라서 표시
    for (let i = 0; i < pageBreaks.length - 1; i++) {
      // 첫 페이지가 아니면 새 페이지 추가
      if (i > 0) {
        pdf.addPage();
      }
      
      // 현재 페이지에 표시할 영역의 시작점과 높이 계산
      const sourceY = pageBreaks[i];
      const sliceHeight = pageBreaks[i + 1] - pageBreaks[i];
      
      if (sliceHeight <= 0) continue; // 높이가 0 이하면 건너뜀
      
      // 임시 캔버스 생성 - 현재 페이지에 표시할 부분만 추출
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasWidth;
      tempCanvas.height = sliceHeight;
      
      // 원본 캔버스에서 현재 페이지 영역만 추출하여 임시 캔버스에 그림
      const tempContext = tempCanvas.getContext('2d');
      if (tempContext) {
        // 배경색 설정
        tempContext.fillStyle = '#FFFFFF';
        tempContext.fillRect(0, 0, canvasWidth, sliceHeight);
        
        // 원본 캔버스에서 영역 추출
        tempContext.drawImage(
          canvas,                // 원본 캔버스
          0, sourceY,           // 원본 캔버스의 시작 좌표 (x, y)
          canvasWidth, sliceHeight, // 원본 캔버스에서 가져올 영역 크기 (width, height)
          0, 0,                 // 대상 캔버스의 시작 좌표 (x, y)
          canvasWidth, sliceHeight // 대상 캔버스에 그릴 크기 (width, height)
        );
        
        // 현재 페이지에 이미지 추가 - 각 페이지마다 잘려진 이미지만 표시
        pdf.addImage(
          tempCanvas.toDataURL('image/jpeg', 0.95),
          'JPEG',
          marginSides,
          marginTop,
          contentWidth,
          (sliceHeight / canvasWidth) * contentWidth,
          undefined,
          'FAST'
        );
      }
    }
    
    // 완료 후 저장
    pdf.save(fileName);
    toast.success("PDF가 성공적으로 다운로드되었습니다!");
    
    return Promise.resolve();
  } catch (error) {
    console.error('PDF 생성 오류:', error);
    toast.error("PDF 생성 중 오류가 발생했습니다.");
    return Promise.reject(error);
  }
};

/**
 * Get template name based on template ID
 */
export const getTemplateName = (templateId?: string): string => {
  return templateId === "template1" ? "기본형 템플릿" : "기본 템플릿";
};
