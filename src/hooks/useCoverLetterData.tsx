
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Define and export the CoverLetterData type
export type CoverLetterData = {
  growthStory?: string;
  motivation?: string;
  personality?: string;
  aspirations?: string;
  company?: string;
  position?: string;
  name?: string;
  sections?: Array<{
    question: string;
    answer: string;
  }>;
  [key: string]: any; // Allow for additional dynamic properties
}

const useCoverLetterData = () => {
  const navigate = useNavigate();
  const [coverLetter, setCoverLetter] = useState<CoverLetterData | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadCoverLetterData = async () => {
      try {
        setLoading(true);
        const storedCoverLetter = localStorage.getItem("previewCoverLetter");
        
        if (!storedCoverLetter) {
          toast.error("미리보기할 자기소개서가 없습니다.");
          navigate("/cover-letter");
          return;
        }
        
        try {
          const parsedCoverLetter = JSON.parse(storedCoverLetter);
          console.log("로드된 자기소개서 데이터:", parsedCoverLetter);
          
          // 필수 데이터 검증
          if (!parsedCoverLetter.company || !parsedCoverLetter.position) {
            console.warn("자기소개서에 회사명 또는 직무가 없습니다.");
          }
          
          if (!parsedCoverLetter.sections || !Array.isArray(parsedCoverLetter.sections) || parsedCoverLetter.sections.length === 0) {
            console.warn("자기소개서에 섹션 데이터가 없거나 형식이 잘못되었습니다.");
          } else {
            // 섹션 데이터 유효성 검사
            parsedCoverLetter.sections.forEach((section: any, idx: number) => {
              if (!section.question) {
                console.warn(`섹션 ${idx + 1}에 질문이 없습니다.`);
              }
              if (!section.answer) {
                console.warn(`섹션 ${idx + 1}에 답변이 없습니다.`);
              }
            });
          }
          
          setCoverLetter(parsedCoverLetter);
        } catch (error) {
          console.error("자기소개서 데이터 파싱 오류:", error);
          toast.error("자기소개서 데이터 형식이 올바르지 않습니다.");
          navigate("/cover-letter");
          return;
        }
        
        // 사용자 정보 가져오기
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // 사용자 프로필 정보 가져오기
            const { data: userData, error } = await supabase
              .from('TB_USER')
              .select('id, name')
              .eq('email', user.email)
              .single();
            
            if (userData) {
              if (userData.name) {
                setUserName(userData.name);
                console.log("사용자 이름 로드됨:", userData.name);
              }
              if (userData.id) {
                setUserId(userData.id);
                console.log("사용자 ID 로드됨:", userData.id);
              }
            } else if (coverLetter && coverLetter.name) {
              setUserName(coverLetter.name);
              console.log("자기소개서에서 이름 로드됨:", coverLetter.name);
            } else {
              setUserName("이름");
              console.log("기본 이름 사용됨: 이름");
            }
          } else if (coverLetter && coverLetter.name) {
            setUserName(coverLetter.name);
          } else {
            setUserName("이름");
          }
        } catch (error) {
          console.error("사용자 정보 가져오기 실패:", error);
          // 자기소개서에 이름이 있으면 사용
          if (coverLetter && coverLetter.name) {
            setUserName(coverLetter.name);
          } else {
            setUserName("이름");
          }
        } finally {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading cover letter data:", error);
        toast.error("자기소개서 데이터를 불러오는데 실패했습니다.");
        navigate("/cover-letter");
        setLoading(false);
      }
    };

    loadCoverLetterData();
  }, [navigate]);

  const saveCoverLetter = async () => {
    if (!coverLetter) {
      toast.error("저장할 자기소개서 데이터가 없습니다.");
      return;
    }
    
    try {
      // 로컬 스토리지에 저장
      const savedLetters = localStorage.getItem("savedCoverLetters");
      let allLetters = savedLetters ? JSON.parse(savedLetters) : [];
      
      const newCoverLetter = {
        ...coverLetter,
        name: userName, // 사용자 이름 저장
        id: Date.now().toString(), // 고유 ID 생성
        lastModified: new Date().toISOString(),
        date: new Date().toLocaleDateString('ko-KR', { 
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      };
      
      allLetters.push(newCoverLetter);
      localStorage.setItem("savedCoverLetters", JSON.stringify(allLetters));
      
      // Supabase에도 저장 (로그인한 사용자만)
      if (userId) {
        console.log("자기소개서 Supabase에 저장 중...");
        
        // DB에 TB_CL_WORD 테이블에 저장
        const { data, error } = await supabase
          .from('TB_CL_WORD')
          .insert([
            { 
              userid: userId,
              company: coverLetter.company || "",
              position: coverLetter.position || "",
              keyword1: coverLetter.keyword1 || "",  // 키워드가 있으면 저장
              keyword2: coverLetter.keyword2 || "",
              keyword3: coverLetter.keyword3 || "",
              created_at: new Date().toISOString()
            }
          ])
          .select();
        
        if (error) {
          console.error("자기소개서 Supabase 저장 실패:", error);
          toast.error("자기소개서 저장 중 오류가 발생했습니다.");
        } else {
          console.log("자기소개서 Supabase에 저장됨:", data);
        }
      }

      // 임시 데이터 제거
      localStorage.removeItem("generatedCoverLetter");
      localStorage.removeItem("previewCoverLetter");
      
      toast.success("템플릿이 적용된 자기소개서가 저장되었습니다!");
      navigate("/cover-letter");
    } catch (error) {
      console.error("자기소개서 저장 중 오류:", error);
      toast.error("자기소개서 저장에 실패했습니다.");
    }
  };

  return {
    coverLetter,
    userName,
    loading,
    saveCoverLetter
  };
};

export default useCoverLetterData;
