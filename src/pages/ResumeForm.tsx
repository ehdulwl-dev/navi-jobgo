
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { PersonalInfoForm } from "../components/resume/PersonalInfoForm";
import { EducationForm } from "../components/resume/EducationForm";
import { ExperienceForm } from "../components/resume/ExperienceForm";
import { SkillsForm } from "../components/resume/SkillsForm";
import ResumePreview from "../components/ResumePreview";
import Header from "@/components/Header";
import { useResumeForm } from "@/hooks/useResumeForm";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

const ResumeForm: React.FC = () => {
  const navigate = useNavigate();
  const {
    isEditing,
    activeTab,
    showPreview,
    isLoading: formIsLoading,
    formData,
    formErrors,
    handleChange,
    handleSelectChange,
    handleAddressComplete,
    handleCheckboxChange,
    handleFileChange,
    handleTabChange,
    handleSubmit,
    handleNext,
    handlePrevious,
    addNewExperience,
    deleteExperience,
    handleExperienceChange,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    setShowPreview,
    setFormData, // Make sure this is properly destructured from useResumeForm
  } = useResumeForm();
  
  // Check if the user is authenticated
  const { user } = useUser();
  const [userLoading, setUserLoading] = React.useState(true);
  
  // Effect to simulate the loading of user data
  React.useEffect(() => {
    // Short timeout to make sure user state is settled
    const timer = setTimeout(() => {
      setUserLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [user]);

  // 로딩 상태 처리 개선
  if (formIsLoading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (showPreview) {
    return (
      <ResumePreview
        formData={formData}
        onEdit={() => setShowPreview(false)}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    );
  }

  // 사용자 로그인 유도 함수
  const handleLoginPrompt = () => {
    toast.warning("이력서를 저장하려면 로그인이 필요합니다.");
    navigate("/LoginPage");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={isEditing ? "이력서 수정" : "이력서 작성"} />
      
      {/* Show a warning if the user is not logged in */}
      {!user && (
        <div className="max-w-[800px] mx-auto px-6 pt-4">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-sm flex-grow">로그인이 필요한 기능입니다. 이력서를 저장하려면 먼저 로그인해주세요.</p>
              <button 
                onClick={handleLoginPrompt}
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                로그인하기
              </button>
            </div>
          </div>
        </div>
      )}

      <Tabs
        defaultValue="personal"
        value={activeTab}
        onValueChange={handleTabChange}
        className="max-w-[800px] mx-auto px-6 py-8"
      >
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="personal" className="text-sm">
            기본 정보
          </TabsTrigger>
          <TabsTrigger value="education" className="text-sm">
            학력 사항
          </TabsTrigger>
          <TabsTrigger value="experience" className="text-sm">
            경력 사항
          </TabsTrigger>
          <TabsTrigger value="skills" className="text-sm">
            자격증 & 기타
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <PersonalInfoForm
            formData={formData}
            formErrors={formErrors}
            handleChange={handleChange}
            handleSelectChange={handleSelectChange}
            handleCheckboxChange={handleCheckboxChange}
            handleFileChange={handleFileChange}
            handleAddressComplete={handleAddressComplete}
            handleNext={handleNext}
            isLoading={formIsLoading}
          />
        </TabsContent>

        <TabsContent value="education">
          <EducationForm
            formData={formData}
            handleChange={handleChange}
            handleSelectChange={handleSelectChange}
            handlePrevious={handlePrevious}
            handleNext={handleNext}
          />
        </TabsContent>

        <TabsContent value="experience">
          <ExperienceForm
            formData={formData}
            handleExperienceChange={handleExperienceChange}
            addNewExperience={addNewExperience}
            deleteExperience={deleteExperience}
            handlePrevious={handlePrevious}
            handleNext={handleNext}
          />
        </TabsContent>

        <TabsContent value="skills">
          <SkillsForm
            formData={formData}
            setFormData={setFormData}
            updateCertificate={updateCertificate}
            addCertificate={addCertificate}
            deleteCertificate={deleteCertificate}
            handlePrevious={handlePrevious}
            handleNext={handleNext}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResumeForm;
