import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";

interface CoverLetterSection {
  question: string;
  answer: string;
}

interface CoverLetter {
  id?: string;
  company: string;
  position: string;
  title?: string;
  sections: CoverLetterSection[];
  date?: string;
  keywords?: string[];
}

const CoverLetterEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [sections, setSections] = useState<CoverLetterSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load the cover letter data when component mounts
    const loadCoverLetter = () => {
      try {
        setIsLoading(true);
        
        // Check if we're editing a temporary (newly generated) cover letter
        if (id === 'temp') {
          const editingLetter = localStorage.getItem("editingCoverLetter");
          const generatedLetter = localStorage.getItem("generatedCoverLetter");
          
          if (editingLetter) {
            // Use the editing letter if available
            const parsed = JSON.parse(editingLetter);
            setCoverLetter({
              ...parsed,
              date: parsed.date || new Date().toISOString()
            });
            setSections(parsed.sections || []);
          } else if (generatedLetter) {
            // Fall back to the generated letter if editing is not available
            const parsed = JSON.parse(generatedLetter);
            setCoverLetter({
              ...parsed,
              date: parsed.date || new Date().toISOString()
            });
            setSections(parsed.sections || []);
          } else {
            toast.error("수정할 자기소개서를 찾을 수 없습니다.");
            navigate("/cover-letter");
            return;
          }
        } else {
          // We're editing a saved cover letter
          const savedLetters = localStorage.getItem("savedCoverLetters");
          if (!savedLetters) {
            toast.error("저장된 자기소개서를 찾을 수 없습니다.");
            navigate("/cover-letter");
            return;
          }
          
          const allLetters = JSON.parse(savedLetters);
          const letter = allLetters.find((l: CoverLetter) => l.id === id);
          
          if (!letter) {
            toast.error("해당 자기소개서를 찾을 수 없습니다.");
            navigate("/cover-letter");
            return;
          }
          
          setCoverLetter(letter);
          setSections(letter.sections || []);
        }
      } catch (error) {
        console.error("Error loading cover letter:", error);
        toast.error("자기소개서 로딩 중 오류가 발생했습니다.");
        navigate("/cover-letter");
      } finally {
        setIsLoading(false);
      }
    };

    loadCoverLetter();
  }, [id, navigate]);

  const handleAnswerChange = (index: number, newAnswer: string) => {
    const newSections = [...sections];
    if (newSections[index]) {
      newSections[index] = {
        ...newSections[index],
        answer: newAnswer,
      };
      setSections(newSections);
    }
  };

  const handleSave = () => {
    if (!coverLetter) return;

    try {
      // Create updated cover letter with edited sections
      const updatedLetter = {
        ...coverLetter,
        sections: sections,
        lastModified: new Date().toISOString(),
      };
      
      // If this is a temporary letter (from preview/generated)
      if (id === 'temp') {
        // Update the generated cover letter
        localStorage.setItem("generatedCoverLetter", JSON.stringify(updatedLetter));
        
        // Clear the temp editing state
        localStorage.removeItem("editingCoverLetter");
        
        // Go back to the preview
        toast.success("자기소개서가 수정되었습니다.");
        navigate("/cover-letter/preview");
        return;
      }
      
      // Otherwise, this is a saved letter we're updating
      const savedLetters = localStorage.getItem("savedCoverLetters");
      let allLetters = savedLetters ? JSON.parse(savedLetters) : [];

      // Replace the existing letter with the updated one
      allLetters = allLetters.map((letter: CoverLetter) => 
        letter.id === id ? updatedLetter : letter
      );

      localStorage.setItem("savedCoverLetters", JSON.stringify(allLetters));
      
      toast.success("자기소개서가 수정되었습니다.");
      navigate("/cover-letter");
    } catch (error) {
      console.error("Error saving cover letter:", error);
      toast.error("저장 중 오류가 발생했습니다.");
    }
  };

  // 텍스트에서 별표(**) 제거 함수
  const removeStars = (text: string): string => {
    return text ? text.replace(/\*\*/g, '') : '';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!coverLetter) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">자기소개서를 찾을 수 없습니다.</p>
        <Button onClick={() => navigate("/cover-letter")}>
          자기소개서 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="자기소개서 수정" />

      <main className="px-4 py-6">
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block">회사명</label>
                <Input
                  value={coverLetter.company}
                  readOnly
                  className="mt-2 bg-gray-50"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block">채용 직무</label>
                <Input
                  value={coverLetter.position}
                  readOnly
                  className="mt-2 bg-gray-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">
                  질문 {index + 1}. {section.question}
                </h3>
                <Textarea
                  value={removeStars(section.answer)}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className="min-h-[200px] mt-2"
                  placeholder="답변을 입력해주세요..."
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <Button
            onClick={handleSave}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
          >
            수정 완료
          </Button>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default CoverLetterEdit;
