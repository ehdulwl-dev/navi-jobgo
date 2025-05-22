
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ResumeTemplate from '@/components/resume/ResumeTemplate';
import { getResumes, updateResume, getResumeById } from '@/services/resume';
import ResumePdfGenerator from '@/components/resume/ResumePdfGenerator';

const ResumeTemplatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedTemplate, setSelectedTemplate] = useState('template1');
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchResumeData = async () => {
      if (!id) return;
      
      try {
        // Use the getResumeById function instead of getResumes
        const resume = await getResumeById(id);
        if (resume) {
          console.log("Resume data loaded successfully:", resume);
          // Log experience data to check
          console.log("Experience data:", resume.experiences);
          
          setResumeData(resume);
          // 이미 선택된 템플릿이 있다면 그것을 사용
          if (resume.selectedTemplate) {
            setSelectedTemplate(resume.selectedTemplate);
          }
        } else {
          toast.error("이력서를 찾을 수 없습니다.");
          navigate('/resume');
        }
      } catch (error) {
        console.error("Failed to fetch resume data:", error);
        toast.error("이력서 데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchResumeData();
  }, [id, navigate]);

  // 기본 템플릿만 남기기
  const templates = [
    {
      id: 'template1',
      name: '기본 템플릿',
      description: '깔끔하고 전문적인 디자인',
    }
  ];

  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplate(templateId);
    
    if (resumeData && id) {
      try {
        // 템플릿 정보를 이력서 데이터에 저장
        await updateResume(id, { 
          ...resumeData, 
          selectedTemplate: templateId 
        });
        toast.success("템플릿이 선택되었습니다.");
      } catch (error) {
        console.error("템플릿 선택 저장 실패:", error);
        toast.error("템플릿 선택을 저장하는데 실패했습니다.");
      }
    }
  };

  const handleSaveAndReturn = async () => {
    if (resumeData && id) {
      try {
        // 선택한 템플릿을 이력서 데이터와 함께 저장
        await updateResume(id, { 
          ...resumeData, 
          selectedTemplate: selectedTemplate 
        });
        localStorage.setItem("hasResumes", "true");
        toast.success("템플릿이 저장되었습니다.");
        navigate('/resume');
      } catch (error) {
        console.error("템플릿 저장 실패:", error);
        toast.error("템플릿 저장에 실패했습니다.");
      }
    } else {
      localStorage.setItem("hasResumes", "true");
      navigate('/resume');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="템플릿 선택" />
      <div className="max-w-[800px] mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6">이력서 템플릿을 선택해주세요</h2>
        
        <div className="grid grid-cols-1 gap-6 mb-8">
          {templates.map((template) => (
            <Card 
              key={template.id} 
              className={`cursor-pointer hover:shadow-lg transition-shadow ${
                selectedTemplate === template.id ? 'border-2 border-blue-500' : ''
              }`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                <p className="text-gray-600 mb-4">{template.description}</p>
                <Button 
                  className={selectedTemplate === template.id ? 'bg-blue-500' : 'w-full'}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  {selectedTemplate === template.id ? '선택됨' : '선택하기'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {resumeData && (
          <>
            <div className="mb-3">
              <h3 className="text-xl font-bold mb-2">미리보기</h3>
              <div 
                className="border rounded-lg bg-white shadow-sm overflow-hidden" 
                id="resume-template-preview"
                ref={previewRef}
              >
                <ResumeTemplate resumeData={resumeData} templateType={selectedTemplate} />
              </div>
              
              {/* PDF 다운로드 버튼 - 미리보기에서는 제거 */}
              <div className="mt-2">
                <ResumePdfGenerator
                  resumeId={id}
                  resumeData={resumeData}
                  hideDownload={true}
                />
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => navigate('/resume')}>
                취소
              </Button>
              <Button onClick={handleSaveAndReturn}>
                저장하기
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResumeTemplatePage;
