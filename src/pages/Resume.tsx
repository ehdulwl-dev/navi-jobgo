import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import BottomNavigation from "../components/BottomNavigation";
import Header from "@/components/Header";
import ResumeCard from "@/components/ResumeCard";
import { getResumes, deleteResume } from "@/services/resume";
import { useUser } from "@/contexts/UserContext";
import { useJobKeywords } from "@/hooks/useJobKeywords";

const Resume = () => {
  const {user} = useUser();
  const [resumes, setResumes] = useState([]);
  const [showEmptyState, setShowEmptyState] = useState(true);
  const navigate = useNavigate();
  const { keywords } = useJobKeywords();
 
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        if (!user) return;

        const resumeData = await getResumes(user.email);
        
        const processedResumeData = resumeData.map(resume => {
          if (!resume.selectedTemplate) {
            return { ...resume, selectedTemplate: 'template1' };
          }
          return resume;
        });
        
        setResumes(processedResumeData);
        setShowEmptyState(processedResumeData.length === 0);
        
        // 디버깅을 위한 로그 추가
        console.log("가져온 이력서 데이터:", processedResumeData);
      } catch (error) {
        console.error("Failed to fetch resumes:", error);
        toast.error("이력서를 불러오는데 실패했습니다.");
      }
    };

    fetchResumes();
  }, [user]);

  const handleCreateResume = () => {
    // 새 이력서 작성 시 데이터 초기화 상태로 이동
    navigate("/resume/create");
  };

  const handleEditResume = (id: string) => {
    // 수정 시 초기화하지 않고 바로 이동
    navigate(`/resume/edit/${id}`);
  };

  const handleDeleteResume = async (id: string) => {
    try {
      await deleteResume(id);
      const updatedResumes = await getResumes(user.email);
      // 삭제 후 다시 템플릿 정보 확인
      const processedResumeData = updatedResumes.map(resume => {
        if (!resume.selectedTemplate) {
          return { ...resume, selectedTemplate: 'template1' };
        }
        return resume;
      });
      setResumes(processedResumeData);
      setShowEmptyState(processedResumeData.length === 0);
      toast.success("이력서가 삭제되었습니다.");
    } catch (error) {
      console.error("Failed to delete resume:", error);
      toast.error("이력서 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="이력서" />

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

        {showEmptyState ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-500 mb-10">작성된 이력서가 없습니다.</p>
            <Button
              onClick={handleCreateResume}
              className="bg-[#FFE376] hover:bg-[#FFE376] text-black rounded-full py-3 px-6 flex items-center gap-2"
            >
              <img
                src="/buttons/Plus.svg"
                alt="이력서 작성하기"
                className="w-5 h-5"
              />
              <span className="font-bold">이력서 작성하기</span>
            </Button>
          </div>
        ) : (
          <div>
            {resumes.map((resume: any) => (
              <div key={resume.id} className="mb-4">
                <ResumeCard
                  title="기본 이력서"
                  date={new Date().toLocaleDateString('ko-KR', { 
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  }) + ' 작성'}
                  resumeData={resume}
                  onDelete={() => handleDeleteResume(resume.id)}
                  onEdit={() => handleEditResume(resume.id)}
                />
              </div>
            ))}

            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleCreateResume}
                className="bg-[#FFE376] hover:bg-[#FFE376] text-black rounded-full py-3 px-6 flex items-center"
              >
                <Plus size={20} className="mr-2" />새 이력서 작성하기
              </Button>
            </div>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Resume;
