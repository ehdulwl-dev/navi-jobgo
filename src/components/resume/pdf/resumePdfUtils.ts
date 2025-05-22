
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { ResumeData } from "@/services/resumeService";

/**
 * Get template name based on template ID
 */
export const getTemplateName = (): string => {
  // 템플릿 이름을 간소화 (기본 템플릿만 지원)
  return '기본 템플릿';
};

/**
 * Generate template HTML for basic template
 * This function generates HTML that closely matches the React template
 */
export const generateTemplateHTML = (resumeData: ResumeData): string => {
  // 컴퓨터 활용 능력 포맷팅 
  const formatComputerSkills = () => {
    const skills = [];
    if (resumeData.computerSkills?.documentCreation) skills.push("문서 작성");
    if (resumeData.computerSkills?.spreadsheet) skills.push("스프레드시트");
    if (resumeData.computerSkills?.presentation) skills.push("프레젠테이션");
    if (resumeData.computerSkills?.accounting) skills.push("회계 프로그램");
    if (resumeData.computerSkills?.other) skills.push(resumeData.computerSkills.other);
    return skills.join(", ");
  };

  // 비어있는지 확인하는 헬퍼 함수
  const hasUniversityData = resumeData.university && resumeData.university.trim() !== '';
  const hasCollegeData = resumeData.college && resumeData.college.trim() !== '';
  const hasHighSchoolData = resumeData.highSchool && resumeData.highSchool.trim() !== '';
  const hasEducationData = hasUniversityData || hasCollegeData || hasHighSchoolData;
  
  const hasExperienceData = resumeData.experiences && resumeData.experiences.length > 0 && 
    resumeData.experiences.some(exp => exp.companyName && exp.companyName.trim() !== '');
  
  const hasCertificateData = resumeData.certificates && resumeData.certificates.length > 0 && 
    resumeData.certificates.some(cert => cert.name && cert.name.trim() !== '');
  
  const computerSkills = formatComputerSkills();
  const hasComputerSkills = computerSkills !== '';

  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap');
      
      body {
        font-family: 'Nanum Gothic', sans-serif;
        line-height: 1.5;
        color: #333;
      }
      
      .page-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 40px;
        background-color: white;
      }
      
      .section {
        margin-bottom: 24px;
        page-break-inside: avoid;
      }
      
      .header {
        border-bottom: 2px solid #1f2937;
        padding-bottom: 16px;
        margin-bottom: 24px;
        page-break-inside: avoid;
      }
      
      .header h1 {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 8px;
      }
      
      .header-info {
        color: #4b5563;
      }
      
      h2 {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 16px; /* 간격 증가: 12px -> 16px */
        border-bottom: 1px solid #d1d5db;
        padding-bottom: 8px; /* 간격 증가: 4px -> 8px */
      }
      
      .item {
        margin-bottom: 12px;
        page-break-inside: avoid;
      }
      
      .item-title {
        font-weight: 600;
      }
      
      .item-subtitle {
        color: #4b5563;
        margin-top: 2px;
      }
      
      .responsibilities {
        margin-top: 4px;
      }
      
      .certificate-info {
        color: #4b5563;
      }
      
      .skills-list {
        margin-top: 4px;
      }
    </style>
    
    <div class="page-container">
      <div class="section header">
        <h1>${resumeData.name || '이름'}</h1>
        <div class="header-info">
          ${resumeData.birthYear && resumeData.birthMonth && resumeData.birthDay ? 
            `<p>생년월일: ${resumeData.birthYear || ''}.${resumeData.birthMonth || ''}.${resumeData.birthDay || ''}</p>` : ''}
          <p>이메일: ${resumeData.email || 'email@example.com'}</p>
          <p>연락처: ${resumeData.phone || '010-0000-0000'}</p>
          <p>주소: ${resumeData.address || '주소'}</p>
        </div>
      </div>

      ${hasEducationData ? `
        <div class="section">
          <h2>학력사항</h2>
          <div class="education-list">
            ${hasUniversityData ? `
              <div class="item">
                <p class="item-title">${resumeData.university}</p>
                <p class="item-subtitle">
                  ${resumeData.universityMajor || ''}
                  ${resumeData.universityGradYear ? ` | ${resumeData.universityGradYear}년 졸업` : ''}
                </p>
              </div>
            ` : ''}
            ${hasCollegeData ? `
              <div class="item">
                <p class="item-title">${resumeData.college}</p>
                <p class="item-subtitle">
                  ${resumeData.collegeMajor || ''}
                  ${resumeData.collegeGradYear ? ` | ${resumeData.collegeGradYear}년 졸업` : ''}
                </p>
              </div>
            ` : ''}
            ${hasHighSchoolData ? `
              <div class="item">
                <p class="item-title">${resumeData.highSchool}</p>
                ${resumeData.highSchoolGradYear ? `<p class="item-subtitle">${resumeData.highSchoolGradYear}년 졸업</p>` : ''}
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}

      ${hasExperienceData ? `
        <div class="section">
          <h2>경력사항</h2>
          <div class="experience-list">
            ${resumeData.experiences && resumeData.experiences.map((exp: any) => {
              if (!exp.companyName || exp.companyName.trim() === '') return '';
              
              return `
                <div class="item">
                  <p class="item-title">${exp.companyName || ''}</p>
                  <p class="item-subtitle">
                    ${exp.jobTitle === "직접 입력" ? (exp.customJobTitle || '') : (exp.jobTitle || '')}
                    ${exp.contractType ? ` | ${exp.contractType}` : ''}
                  </p>
                  ${(exp.startYear || exp.startMonth || exp.endYear || exp.endMonth) ? `
                    <p class="item-subtitle">
                      ${exp.startYear && exp.startMonth ? `${exp.startYear}.${exp.startMonth}` : ''}
                      ${(exp.startYear || exp.startMonth) && (exp.endYear || exp.endMonth) ? ' - ' : ''}
                      ${exp.endYear && exp.endMonth ? `${exp.endYear}.${exp.endMonth}` : ''}
                    </p>
                  ` : ''}
                  ${exp.responsibilities ? `<p class="responsibilities">${exp.responsibilities}</p>` : ''}
                </div>
              `;
            }).join('') || ''}
          </div>
        </div>
      ` : ''}

      ${hasCertificateData ? `
        <div class="section">
          <h2>자격증</h2>
          <div class="certificate-list">
            ${resumeData.certificates && resumeData.certificates.map((cert: any) => {
              if (!cert.name || cert.name.trim() === '') return '';
              
              const infoItems = [cert.grade, cert.organization, cert.issueDate]
                .filter(item => item && item.trim() !== '')
                .join(' | ');
                
              return `
                <div class="item">
                  <p class="item-title">${cert.name || ''}</p>
                  ${infoItems ? `<p class="certificate-info">${infoItems}</p>` : ''}
                </div>
              `;
            }).join('') || ''}
          </div>
        </div>
      ` : ''}

      ${hasComputerSkills ? `
        <div class="section">
          <h2>컴퓨터 활용 능력</h2>
          <p class="skills-list">${computerSkills}</p>
        </div>
      ` : ''}
    </div>
  `;
};

/**
 * Create a PDF document from HTML content with improved rendering
 */
export const createPdfFromHtml = async (
  tempDiv: HTMLDivElement,
  fileName: string
): Promise<void> => {
  try {
    // 폰트 로딩을 위한 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const canvas = await html2canvas(tempDiv, {
      scale: 2, // 적절한 해상도로 조정
      logging: false,
      backgroundColor: "#ffffff",
      allowTaint: true,
      useCORS: true,
      windowWidth: 800,
      windowHeight: tempDiv.offsetHeight,
      imageTimeout: 15000,
      onclone: (document, element) => {
        // 복제된 요소에 추가 스타일 적용 가능
        element.style.width = "800px";
        element.style.margin = "0";
        element.style.padding = "0";
      }
    });
    
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // A4 크기 설정 (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // PDF 페이지 크기와 내용 비율 계산
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // 여러 페이지 처리를 위한 계산
    let heightLeft = imgHeight;
    let position = 0;
    let pageCount = 1;
    
    // 첫 페이지 이미지 추가
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
    
    // 여러 페이지 처리
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      pageCount++;
    }
    
    pdf.save(fileName);
    toast.success("PDF가 성공적으로 다운로드되었습니다!");
    
    return Promise.resolve();
  } catch (error) {
    console.error('PDF 생성 오류:', error);
    toast.error("PDF 생성 중 오류가 발생했습니다.");
    return Promise.reject(error);
  }
};
