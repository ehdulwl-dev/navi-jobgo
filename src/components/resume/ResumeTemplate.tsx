
import React from 'react';
import { ResumeData } from '@/services/resume';
import Header from './templates/Header';
import Education from './templates/Education';
import Experience from './templates/Experience';
import Certificates from './templates/Certificates';
import ComputerSkills from './templates/ComputerSkills';

interface ResumeTemplateProps {
  resumeData: ResumeData;
  templateType?: string;
}

const ResumeTemplate: React.FC<ResumeTemplateProps> = ({ resumeData, templateType = 'default' }) => {
  // Basic template (default and template1)
  if (templateType === 'default' || templateType === 'template1') {
    return (
      <div className="bg-white p-8 max-w-[800px] mx-auto print:p-0">
        <Header resumeData={resumeData} templateType={templateType} />
        <Education resumeData={resumeData} templateType={templateType} />
        <Experience resumeData={resumeData} templateType={templateType} />
        <Certificates resumeData={resumeData} templateType={templateType} />
        <ComputerSkills resumeData={resumeData} templateType={templateType} />
      </div>
    );
  }
  
  // Modern template
  return (
    <div className="bg-white p-8 max-w-[800px] mx-auto print:p-0">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 bg-gray-100 p-6 rounded-lg break-inside-avoid">
          <Header resumeData={resumeData} templateType={templateType} />
          <ComputerSkills resumeData={resumeData} templateType={templateType} />
        </div>
        
        <div className="md:w-2/3">
          <Education resumeData={resumeData} templateType={templateType} />
          <Experience resumeData={resumeData} templateType={templateType} />
          <Certificates resumeData={resumeData} templateType={templateType} />
        </div>
      </div>
    </div>
  );
};

export default ResumeTemplate;
