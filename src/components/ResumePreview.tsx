import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "./ui/card";
import { PencilLine } from "lucide-react";
import { Button } from "./ui/button";
import { createResume, ResumeData, updateResume } from '../services/resume';
import { toast } from 'sonner';
import { useUser } from "@/contexts/UserContext";

interface ResumePreviewProps {
  formData: ResumeData;
  onEdit: () => void;
  onSubmit: (e?: React.FormEvent) => void;
  isEditing?: boolean;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ 
  formData, 
  onEdit, 
  onSubmit,
  isEditing = false 
}) => {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleSave = async () => {
    try {
      toast.loading(isEditing ? '이력서를 수정하는 중...' : '이력서를 저장하는 중...');
      
      let savedResume;
      if (isEditing && formData.id) {
        savedResume = await updateResume(formData.id, formData);
      } else {
        // Check if user exists and has email before proceeding
        if (!user || !user.email) {
          toast.dismiss();
          toast.error('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
          return;
        }
        
        savedResume = await createResume(formData, user.email);
      }
      
      toast.dismiss();
      toast.success(isEditing ? '이력서가 수정되었습니다.' : '이력서가 저장되었습니다.');
      setTimeout(() => {
        navigate(`/resume/template/${savedResume.id}`);
      }, 1000);
    } catch (error) {
      toast.dismiss();
      toast.error(isEditing ? '이력서 수정에 실패했습니다.' : '이력서 저장에 실패했습니다. 나중에 다시 시도해주세요.');
      console.error('Error saving resume:', error);
    }
  };

  const formatComputerSkills = () => {
    const skills = [];
    if (formData.computerSkills?.documentCreation) skills.push("문서 작성");
    if (formData.computerSkills?.spreadsheet) skills.push("스프레드시트");
    if (formData.computerSkills?.presentation) skills.push("프레젠테이션");
    if (formData.computerSkills?.accounting) skills.push("회계 프로그램");
    if (formData.computerSkills?.other) skills.push(formData.computerSkills.other);
    return skills.join(", ");
  };

  // 비어있는지 확인하는 헬퍼 함수
  const hasUniversityData = formData.university && formData.university.trim() !== '';
  const hasCollegeData = formData.college && formData.college.trim() !== '';
  const hasHighSchoolData = formData.highSchool && formData.highSchool.trim() !== '';
  const hasEducationData = hasUniversityData || hasCollegeData || hasHighSchoolData;
  
  const hasExperienceData = formData.experiences && formData.experiences.length > 0 && 
    formData.experiences.some(exp => exp.companyName && exp.companyName.trim() !== '');
  
  const hasCertificateData = formData.certificates && formData.certificates.length > 0 && 
    formData.certificates.some(cert => cert.name && cert.name.trim() !== '');
  
  const computerSkills = formatComputerSkills();
  const hasComputerSkills = computerSkills !== '';

  // 생년월일이 완전히 입력되었는지 확인
  const hasBirthDate = formData.birthYear && formData.birthMonth && formData.birthDay;

  return (
    <Card className="max-w-[800px] mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <img 
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/9f50b1e03a1fea690ea1c5626170f7597a96442e" 
              className="w-[61px] h-[50px] mb-2.5" 
              alt="Logo" 
            />
            <h2 className="text-2xl font-bold">{isEditing ? '이력서 수정' : '내 이력서'}</h2>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={onEdit}
          >
            <PencilLine className="w-4 h-4" />
            {isEditing ? '계속 수정하기' : '수정하기'}
          </Button>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-lg font-semibold mb-4">기본정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">성함</label>
                <p>{formData.name || ''}</p>
              </div>
              {hasBirthDate && (
                <div>
                  <label className="text-sm text-gray-500">생년월일</label>
                  <p>{`${formData.birthYear}.${formData.birthMonth}.${formData.birthDay}`}</p>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-500">이메일</label>
                <p>{formData.email || ''}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">휴대전화</label>
                <p>{formData.phone || ''}</p>
              </div>
              {formData.address && formData.address.trim() !== '' && (
                <div className="col-span-2">
                  <label className="text-sm text-gray-500">주소</label>
                  <p>{formData.address}</p>
                </div>
              )}
            </div>
          </section>

          {hasEducationData && (
            <section>
              <h3 className="text-lg font-semibold mb-4">학력사항</h3>
              {formData.highestEducation !== "해당없음" && (
                <div className="space-y-4">
                  {hasUniversityData && (
                    <div>
                      <p className="font-medium">{formData.university}</p>
                      <p className="text-sm text-gray-600">
                        {formData.universityMajor ? formData.universityMajor : ''}
                        {formData.universityMajor && formData.universityGradYear ? ' | ' : ''}
                        {formData.universityGradYear ? `${formData.universityGradYear}년 졸업` : ''}
                      </p>
                    </div>
                  )}
                  {hasCollegeData && (
                    <div>
                      <p className="font-medium">{formData.college}</p>
                      <p className="text-sm text-gray-600">
                        {formData.collegeMajor ? formData.collegeMajor : ''}
                        {formData.collegeMajor && formData.collegeGradYear ? ' | ' : ''}
                        {formData.collegeGradYear ? `${formData.collegeGradYear}년 졸업` : ''}
                      </p>
                    </div>
                  )}
                  {hasHighSchoolData && (
                    <div>
                      <p className="font-medium">{formData.highSchool}</p>
                      {formData.highSchoolGradYear && (
                        <p className="text-sm text-gray-600">
                          {`${formData.highSchoolGradYear}년 졸업`}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {hasExperienceData && (
            <section>
              <h3 className="text-lg font-semibold mb-4">경력사항</h3>
              <div className="space-y-4">
                {formData.experiences.map((exp: any, index: number) => (
                  exp.companyName && exp.companyName.trim() !== '' && (
                    <div key={index} className="border rounded-lg p-4">
                      <p className="font-medium">{exp.companyName}</p>
                      <p className="text-sm text-gray-600">
                        {exp.jobTitle === "직접 입력" ? exp.customJobTitle : exp.jobTitle || ''}
                        {((exp.jobTitle === "직접 입력" ? exp.customJobTitle : exp.jobTitle) && exp.contractType) ? ' | ' : ''}
                        {exp.contractType || ''}
                      </p>
                      {(exp.startYear || exp.startMonth || exp.endYear || exp.endMonth) && (
                        <p className="text-sm text-gray-600">
                          {exp.startYear && exp.startMonth ? `${exp.startYear}.${exp.startMonth}` : ''}
                          {(exp.startYear || exp.startMonth) && (exp.endYear || exp.endMonth) ? ' - ' : ''}
                          {exp.endYear && exp.endMonth ? `${exp.endYear}.${exp.endMonth}` : ''}
                        </p>
                      )}
                      {exp.responsibilities && <p className="mt-2">{exp.responsibilities}</p>}
                    </div>
                  )
                ))}
              </div>
            </section>
          )}

          {hasCertificateData && (
            <section>
              <h3 className="text-lg font-semibold mb-4">자격증</h3>
              <div className="space-y-4">
                {formData.certificates.map((cert: any, index: number) => (
                  cert.name && cert.name.trim() !== '' && (
                    <div key={index}>
                      <p className="font-medium">{cert.name}</p>
                      <p className="text-sm text-gray-600">
                        {[cert.grade, cert.organization, cert.issueDate]
                          .filter(item => item && item.trim() !== '')
                          .join(' | ')}
                      </p>
                    </div>
                  )
                ))}
              </div>
            </section>
          )}

          {hasComputerSkills && (
            <section>
              <h3 className="text-lg font-semibold mb-4">컴퓨터 활용 능력</h3>
              <p>{computerSkills}</p>
            </section>
          )}

          <div className="flex justify-end space-x-4 mt-8">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              {isEditing ? '수정 완료' : '저장'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumePreview;
