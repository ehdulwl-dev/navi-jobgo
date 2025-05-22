import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Download,
  Plus,
  Pencil,
  Trash,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import BottomNavigation from "../components/BottomNavigation";
import Header from "../components/Header";
import CoverLetterTemplate from "../components/cover-letter/CoverLetterTemplate";
import { useCoverLetterPdfGenerator } from "../components/cover-letter/pdf/useCoverLetterPdfGenerator";
import { useUser } from "@/contexts/UserContext";
import { useJobKeywords } from "@/hooks/useJobKeywords";
import { supabase } from "@/integrations/supabase/client";

interface CoverLetter {
  id: string;
  company: string;
  position: string;
  title: string;
  date: string;
  name?: string;
  template?: {
    id: string;
    name: string;
    type: string;
  };
  sections: Array<{
    question: string;
    answer: string;
  }>;
}

const CoverLetter = () => {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [showEmptyState, setShowEmptyState] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isGenerating, generatePDF } = useCoverLetterPdfGenerator();
  const { user } = useUser();
  const { keywords } = useJobKeywords();

  useEffect(() => {
    const fetchCoverLetters = async () => {
      try {
        setIsLoading(true);
        
        if (!user?.email) {
          // If no user is logged in, get data from localStorage as a fallback
          const savedLetters = localStorage.getItem("savedCoverLetters");
          if (savedLetters) {
            const parsedLetters = JSON.parse(savedLetters);
            setCoverLetters(parsedLetters);
            setShowEmptyState(parsedLetters.length === 0);
          }
          setIsLoading(false);
          return;
        }

        // Step 1: Get the user ID from TB_USER table based on email
        const { data: userData, error: userError } = await supabase
          .from('TB_USER')
          .select('id')
          .eq('email', user.email)
          .single();

        if (userError) {
          console.error("Error fetching user ID:", userError);
          toast.error("사용자 정보를 가져오는데 실패했습니다.");
          
          // Fallback to localStorage if user data can't be fetched
          const savedLetters = localStorage.getItem("savedCoverLetters");
          if (savedLetters) {
            const parsedLetters = JSON.parse(savedLetters);
            setCoverLetters(parsedLetters);
            setShowEmptyState(parsedLetters.length === 0);
          }
          setIsLoading(false);
          return;
        }

        if (!userData?.id) {
          console.log("No user ID found for email:", user.email);
          setIsLoading(false);
          return;
        }

        console.log("Fetching cover letters for user ID:", userData.id);

        // Step 2: Get cover letter data from TB_CL_WORD based on user ID
        const { data: clWordData, error: clWordError } = await supabase
          .from('TB_CL_WORD')
          .select('id, company, position, created_at')
          .eq('userid', userData.id);

        if (clWordError) {
          console.error("Error fetching cover letter data:", clWordError);
          toast.error("자기소개서 목록을 가져오는데 실패했습니다.");
          setIsLoading(false);
          return;
        }

        if (!clWordData || clWordData.length === 0) {
          console.log("No cover letter data found for user ID:", userData.id);
          setShowEmptyState(true);
          setIsLoading(false);
          return;
        }

        // Step 3: Transform the data into the required format
        const transformedData = clWordData.map(item => {
          // Format date to YYYY-MM-DD
          const formattedDate = item.created_at 
            ? new Date(item.created_at).toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
              })
            : new Date().toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
              });

          return {
            id: item.id.toString(),
            company: item.company || "회사명 없음",
            position: item.position || "직무 없음",
            title: `${item.company || "회사명 없음"} - ${item.position || "직무 없음"}`,
            date: formattedDate,
            sections: [] // Empty sections as we don't have this data in TB_CL_WORD
          };
        });

        console.log("Transformed cover letter data:", transformedData);
        setCoverLetters(transformedData);
        setShowEmptyState(transformedData.length === 0);
        
        // Also save to localStorage for offline access
        localStorage.setItem("savedCoverLetters", JSON.stringify(transformedData));
      } catch (error) {
        console.error("Error in fetching cover letter data:", error);
        toast.error("데이터 로딩 중 오류가 발생했습니다.");
        
        // Fallback to localStorage
        const savedLetters = localStorage.getItem("savedCoverLetters");
        if (savedLetters) {
          const parsedLetters = JSON.parse(savedLetters);
          setCoverLetters(parsedLetters);
          setShowEmptyState(parsedLetters.length === 0);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoverLetters();
  }, [user]);

  const handleCreateAICoverLetter = () => {
    navigate("/cover-letter/ai-create");
  };

  const handleEditCoverLetter = (id: string) => {
    // Add logic to fetch the letter if needed, or directly navigate to the edit page
    navigate(`/cover-letter/edit/${id}`);
  };

  const handleDeleteCoverLetter = async (id: string) => {
    try {
      // If user is logged in, also delete from Supabase
      if (user?.email) {
        const { data: userData } = await supabase
          .from('TB_USER')
          .select('id')
          .eq('email', user.email)
          .single();
        
        if (userData?.id) {
          const { error } = await supabase
            .from('TB_CL_WORD')
            .delete()
            .eq('id', id)
            .eq('userid', userData.id);
          
          if (error) {
            console.error("Error deleting cover letter from Supabase:", error);
            toast.error("서버에서 자기소개서 삭제 중 오류가 발생했습니다.");
            return;
          }
        }
      }

      // Update local state
      setCoverLetters((prev) => {
        const updatedLetters = prev.filter((letter) => letter.id !== id);
        localStorage.setItem("savedCoverLetters", JSON.stringify(updatedLetters));
        
        if (updatedLetters.length === 0) {
          setShowEmptyState(true);
        }
        
        return updatedLetters;
      });

      toast.success("자기소개서가 삭제되었습니다.");
    } catch (error) {
      console.error("Error deleting cover letter:", error);
      toast.error("자기소개서 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleDownloadPDF = async (letter: CoverLetter) => {
    setPdfGenerating(letter.id);
    
    try {
      await generatePDF(letter, letter.name || "이름");
    } finally {
      setPdfGenerating(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="자기소개서" />

      {/* Main Content */}
      <main className="px-4 py-6">
        <section className="bg-white px-4 py-6 flex flex-col items-start text-left mb-6 rounded-lg shadow-sm">
          <p className="text-xl font-bold leading-relaxed text-gray-900">
            {user ? (
              <>
                더 성장하는 나, <br />
                나의 관심 직무는
              </>
            ) : (
              <>
                더 성장하는 나, <br />
                나의 관심 직무를 찾아봐요
              </>
            )}
          </p>
          {user && (
            <div className="mt-2 flex flex-wrap justify-end gap-2 text-app-blue font-bold text-2xl">
              {keywords.map((keyword, index) => (
                <span key={index}>#{keyword}</span>
              ))}
            </div>
          )}
        </section>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : showEmptyState ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-500 mb-10">작성된 자기소개서가 없습니다.</p>
            <Button
              onClick={handleCreateAICoverLetter}
              className="bg-[#FFE376] hover:bg-[#FFE376] text-black rounded-full py-3 px-6 flex items-center gap-2"
            >
              <img
                src="/buttons/Plus.svg"
                alt="AI로 자기소개서 작성"
                className="w-5 h-5"
              />
              <span className="font-bold">AI로 자기소개서 작성</span>
            </Button>
          </div>
        ) : (
          <div>
            {coverLetters.map((letter) => (
              <Card key={letter.id} className="mb-4">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-500">
                        {letter.position}
                      </div>
                      <h3 className="font-semibold text-lg">{letter.company}</h3>
                      {letter.template && (
                        <div className="text-xs text-blue-500 mt-1">
                          템플릿: {letter.template.name}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDownloadPDF(letter)}
                        disabled={pdfGenerating === letter.id}
                      >
                        {pdfGenerating === letter.id ? (
                          <div className="w-4 h-4 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                        ) : (
                          <Download size={20} className="text-blue-500" />
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash size={20} className="text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>자기소개서 삭제</AlertDialogTitle>
                            <AlertDialogDescription>
                              이 자기소개서를 삭제하시겠습니까? 이 작업은 되돌릴
                              수 없습니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() => handleDeleteCoverLetter(letter.id)}
                            >
                              삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{letter.date}</p>
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => handleEditCoverLetter(letter.id)}
                    >
                      <Pencil size={16} />
                      수정
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleCreateAICoverLetter}
                className="bg-[#FFE376] hover:bg-[#FFE376] text-black rounded-full py-3 px-6 flex items-center gap-2"
              >
                <img
                  src="/buttons/Plus.svg"
                  alt="AI로 자기소개서 작성"
                  className="w-5 h-5"
                />
                <span className="font-bold">AI로 자기소개서 작성</span>
              </Button>
            </div>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default CoverLetter;
