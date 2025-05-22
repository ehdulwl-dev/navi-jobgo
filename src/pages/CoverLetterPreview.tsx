
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import BottomNavigation from "../components/BottomNavigation";
import Header from "../components/Header";
import { Copy, CheckSquare, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";


interface CoverLetterSection {
  question: string;
  answer: string;
}

interface CoverLetter {
  company: string;
  position: string;
  sections: CoverLetterSection[];
  keywords: string[];
  date: string;
}

const getUser = async (email: string): Promise<string | null> => {
    const { data, error } = await supabase
      .from("TB_USER")
      .select("id")
      .eq("email", email)
      .single();

    if (error) {
      console.error("📛 사용자 희망 지역 조회 실패:", error.message);
      return null;
    }

    return data?.id || null;
  };

const CoverLetterPreview = () => {
  const navigate = useNavigate();
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [copied, setCopied] = useState<boolean[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const storedCoverLetter = localStorage.getItem("generatedCoverLetter");

    if (!storedCoverLetter) {
      toast.error("생성된 자기소개서가 없습니다.");
      navigate("/cover-letter");
      return;
    }

    try {
      const parsedCoverLetter = JSON.parse(storedCoverLetter);
      console.log("Parsed cover letter:", parsedCoverLetter);
      
      // 유효성 검사: sections가 질문에 답변이 제대로 매핑되었는지 확인
      if (!parsedCoverLetter.sections || !Array.isArray(parsedCoverLetter.sections)) {
        throw new Error("자기소개서 섹션 데이터가 유효하지 않습니다.");
      }
      
      setCoverLetter(parsedCoverLetter);
      setCopied(new Array(parsedCoverLetter.sections.length).fill(false));
    } catch (error) {
      console.error("Error parsing cover letter data:", error);
      toast.error("자기소개서 데이터를 불러오는데 실패했습니다.");
      navigate("/cover-letter");
    }
  }, [navigate]);

  // 별표(**) 제거 함수
  const removeStars = (text: string): string => {
    return text ? text.replace(/\*\*/g, '') : '';
  };

  const handleCopyToClipboard = (text: string, index: number) => {
    if (!text) return;
    
    const cleanText = removeStars(text);
    navigator.clipboard.writeText(cleanText).then(
      () => {
        const newCopied = [...copied];
        newCopied[index] = true;
        setCopied(newCopied);

        toast.success("클립보드에 복사되었습니다!");

        setTimeout(() => {
          setCopied((prev) => {
            const newCopied = [...prev];
            newCopied[index] = false;
            return newCopied;
          });
        }, 3000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast.error("복사에 실패했습니다.");
      }
    );
  };

  // 자기소개서 수정 버튼 핸들러
  const handleEditCoverLetter = () => {
    if (!coverLetter) return;
    
    // 현재 자기소개서를 localStorage에 임시 저장
    localStorage.setItem("editingCoverLetter", JSON.stringify(coverLetter));
    
    // 수정 페이지로 이동
    navigate("/cover-letter/edit/temp");
  };
  
  // 자기소개서 저장 버튼 핸들러 - 수정됨
  const handleSaveCoverLetter = async () => {
    if (!coverLetter) return;
    
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData || !sessionData.session) {
          console.error("로그인된 사용자가 없습니다.");
          return;
        }
    
        const user = sessionData.session.user;
    
    try {
      setIsSaving(true);
      // DB에 질문과 답변 저장
      const toastId = toast.loading("자기소개서 저장 중...");

      const userId = await getUser(user.email);
      
      // 모든 섹션을 TB_CL_UQUE 테이블에 저장
      if (coverLetter.sections && coverLetter.sections.length > 0) {
        for (let i = 0; i < coverLetter.sections.length; i++) {
          const section = coverLetter.sections[i];
          const cleanAnswer = removeStars(section.answer);
          
          const { error } = await supabase
            .from('TB_CL_UQUE')
            .insert({
              question: section.question,
              answer: cleanAnswer,
              action: 'create',
              userid:  userId
            });
            
          if (error) {
            console.error(`Error inserting section ${i}:`, error);
            toast.error(`섹션 ${i+1} 저장 중 오류가 발생했습니다.`);
          }
        }
      }

      if (coverLetter.keywords && coverLetter.keywords.length > 0) {
        const { error } = await supabase
          .from('TB_CL_WORD')
          .insert({
            company: coverLetter.company,
            position: coverLetter.position,
            keyword1: coverLetter.keywords[0] || null,
            keyword2: coverLetter.keywords[1] || null,
            keyword3: coverLetter.keywords[2] || null,
            userid: userId
        });

        if (error) {
          toast.error(`키워드 저장 중 오류가 발생했습니다.`);
        }
      }
      
      
      toast.dismiss(toastId);
      toast.success("자기소개서가 성공적으로 저장되었습니다!");
      
      // 템플릿 선택 페이지로 이동
      navigate("/cover-letter/template-select");
    } catch (error) {
      console.error("Error saving cover letter:", error);
      toast.error("자기소개서 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  if (!coverLetter) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-white">
        <Header title="자기소개서" />
        <div className="text-xl font-normal px-4 pt-2">
          <div>생성된 자기소개서</div>
          <div className="text-sm text-gray-500 mt-2">
            {coverLetter.company} - {coverLetter.position}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {formatDate(coverLetter.date)} 생성
          </div>
        </div>
      </div>

      <main className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="mb-4">
          <div className="text-sm font-semibold mb-2">강조된 키워드:</div>
          <div className="flex flex-wrap gap-2">
            {coverLetter.keywords.map((keyword, idx) => (
              <span
                key={idx}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {coverLetter.sections.map((section, idx) => (
            <Card key={idx}>
              <CardContent className="p-4">
                <div className="font-semibold text-sm mb-2">
                  질문 {idx + 1}. {section.question}
                </div>
                <div className="bg-gray-50 p-3 rounded-md text-sm mt-2 whitespace-pre-line">
                  {section.answer ? removeStars(section.answer) : '답변이 생성되지 않았습니다.'}
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                    onClick={() => handleCopyToClipboard(section.answer, idx)}
                    disabled={!section.answer}
                  >
                    {copied[idx] ? (
                      <>
                        <CheckSquare size={16} className="mr-1 text-green-500" />
                        복사됨
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="mr-1" />
                        복사하기
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleEditCoverLetter}
          >
            <Pencil size={16} className="mr-2" />
            자기소개서 수정하기
          </Button>
          
          <Button
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
            onClick={handleSaveCoverLetter}
            disabled={isSaving}
          >
            {isSaving ? "저장 중..." : "자기소개서 저장하기"}
          </Button>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default CoverLetterPreview;
