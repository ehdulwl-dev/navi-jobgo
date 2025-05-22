
import React from 'react';
import { ResumeData } from '@/services/resume';

interface ComputerSkillsProps {
  resumeData: ResumeData;
  templateType?: string;
}

const ComputerSkills: React.FC<ComputerSkillsProps> = ({ resumeData, templateType = 'default' }) => {
  // Format computer skills as string
  const formatComputerSkills = () => {
    const skills = [];
    if (resumeData.computerSkills?.documentCreation) skills.push("문서 작성");
    if (resumeData.computerSkills?.spreadsheet) skills.push("스프레드시트");
    if (resumeData.computerSkills?.presentation) skills.push("프레젠테이션");
    if (resumeData.computerSkills?.accounting) skills.push("회계 프로그램");
    if (resumeData.computerSkills?.other) skills.push(resumeData.computerSkills.other);
    return skills.join(", ");
  };

  const computerSkills = formatComputerSkills();
  const hasComputerSkills = computerSkills !== '';

  if (!hasComputerSkills) {
    return null;
  }

  // Default template computer skills section
  if (templateType === 'default' || templateType === 'template1') {
    return (
      <div className="break-inside-avoid">
        <h2 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">컴퓨터 활용 능력</h2>
        <p>{computerSkills}</p>
      </div>
    );
  }

  // Modern template computer skills section
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold mb-3 border-b-2 border-blue-500 pb-2">컴퓨터 활용 능력</h2>
      <p className="text-sm">{computerSkills}</p>
    </div>
  );
};

export default ComputerSkills;
