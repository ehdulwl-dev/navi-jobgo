
import React from 'react';
import { ResumeData } from '@/services/resume/types';

interface ExperienceProps {
  resumeData: ResumeData;
  templateType?: string;
}

const Experience: React.FC<ExperienceProps> = ({ resumeData, templateType = 'default' }) => {
  // Check if there's experience data to display
  const hasExperienceData = resumeData.experiences && 
    resumeData.experiences.length > 0 && 
    resumeData.experiences.some(exp => exp.companyName && exp.companyName.trim() !== '');

  if (!hasExperienceData) {
    return null;
  }

  // Default template experience section
  if (templateType === 'default' || templateType === 'template1') {
    return (
      <div className="mb-6 break-inside-avoid">
        <h2 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">경력사항</h2>
        <div className="space-y-4">
          {resumeData.experiences && resumeData.experiences.map((exp, index) => (
            exp.companyName && exp.companyName.trim() !== '' && (
              <div key={index} className="break-inside-avoid">
                <p className="font-semibold">{exp.companyName}</p>
                <p className="text-gray-600">
                  {exp.jobTitle === "직접 입력" ? exp.customJobTitle : exp.jobTitle}
                  {exp.contractType && ` | ${exp.contractType}`}
                </p>
                {(exp.startYear || exp.startMonth || exp.endYear || exp.endMonth) && (
                  <p className="text-gray-600">
                    {exp.startYear && exp.startMonth ? `${exp.startYear}.${exp.startMonth}` : ''}
                    {' - '}
                    {exp.endYear && exp.endMonth ? `${exp.endYear}.${exp.endMonth}` : ''}
                  </p>
                )}
                {exp.responsibilities && <p className="mt-1">{exp.responsibilities}</p>}
              </div>
            )
          ))}
        </div>
      </div>
    );
  }

  // Modern template experience section
  return (
    <div className="mb-6 break-inside-avoid">
      <h2 className="text-xl font-bold mb-4 border-b-2 border-blue-500 pb-2">경력사항</h2>
      <div className="space-y-4">
        {resumeData.experiences && resumeData.experiences.map((exp, index) => (
          exp.companyName && exp.companyName.trim() !== '' && (
            <div key={index} className="mb-3 break-inside-avoid">
              <div className="flex justify-between items-start">
                <p className="font-semibold">{exp.companyName}</p>
                {(exp.startYear || exp.startMonth || exp.endYear || exp.endMonth) && (
                  <p className="text-gray-600 text-sm">
                    {exp.startYear && exp.startMonth ? `${exp.startYear}.${exp.startMonth}` : ''}
                    {' - '}
                    {exp.endYear && exp.endMonth ? `${exp.endYear}.${exp.endMonth}` : ''}
                  </p>
                )}
              </div>
              <p className="text-gray-600 text-sm">
                {exp.jobTitle === "직접 입력" ? exp.customJobTitle : exp.jobTitle}
                {exp.contractType && ` | ${exp.contractType}`}
              </p>
              {exp.responsibilities && <p className="mt-1 text-sm">{exp.responsibilities}</p>}
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default Experience;
