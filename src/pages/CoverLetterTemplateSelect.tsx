import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Header from "../components/Header";

interface CoverLetterTemplate {
  id: string;
  name: string;
  type: "modern" | "classic";
  description?: string;
}

const CoverLetterTemplateSelect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>("template1");
  const [coverLetter, setCoverLetter] = useState<any>(null);

  useEffect(() => {
    const storedCoverLetter = localStorage.getItem("generatedCoverLetter");
    
    if (!storedCoverLetter) {
      toast.error("생성된 자기소개서가 없습니다.");
      navigate("/cover-letter");
      return;
    }
    
    setCoverLetter(JSON.parse(storedCoverLetter));
  }, [navigate]);

  // Keep only the default template
  const templates: CoverLetterTemplate[] = [
    {
      id: "template1",
      name: "기본형 템플릿",
      type: "modern",
      description: "깔끔하고 전문적인 기본 템플릿"
    }
  ];

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handlePreview = () => {
    if (!selectedTemplate) {
      toast.error("템플릿을 선택해주세요.");
      return;
    }

    if (!coverLetter) {
      toast.error("자기소개서 데이터가 없습니다.");
      return;
    }

    const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
    
    // Add template information to cover letter
    const updatedCoverLetter = {
      ...coverLetter,
      template: {
        id: selectedTemplate,
        name: selectedTemplateData?.name || "기본 템플릿",
        type: selectedTemplateData?.type || "modern"
      }
    };
    
    localStorage.setItem("previewCoverLetter", JSON.stringify(updatedCoverLetter));
    navigate("/cover-letter/template-preview");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="자기소개서" />
      <div className="max-w-[800px] mx-auto px-6 py-8">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/cover-letter/preview")}
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h2 className="text-2xl font-bold">템플릿 선택</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">원하시는 자기소개서 양식을 선택하세요.</p>

        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            {templates.map((template) => (
              <Card 
                key={template.id}
                className={`cursor-pointer hover:shadow-lg transition-shadow ${
                  selectedTemplate === template.id ? 'border-2 border-blue-500' : ''
                }`}
                onClick={() => handleSelectTemplate(template.id)}
              >
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  <Button 
                    className={selectedTemplate === template.id ? 'bg-blue-500' : 'w-full'}
                    onClick={() => handleSelectTemplate(template.id)}
                  >
                    {selectedTemplate === template.id ? '선택됨' : '선택하기'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Button
          className="w-full mt-6 bg-yellow-400 hover:bg-yellow-500 text-black"
          onClick={handlePreview}
        >
          내 자기소개서 미리보기
        </Button>
      </div>
    </div>
  );
};

export default CoverLetterTemplateSelect;
