
import React from 'react';
import { ResumeData } from '@/services/resume';

interface EducationProps {
  resumeData: ResumeData;
  templateType?: string;
}

const Education: React.FC<EducationProps> = ({ resumeData, templateType = 'default' }) => {
  // Check if there's education data to display
  const hasUniversityData = resumeData.university && resumeData.university.trim() !== '';
  const hasCollegeData = resumeData.college && resumeData.college.trim() !== '';
  const hasHighSchoolData = resumeData.highSchool && resumeData.highSchool.trim() !== '';
  const hasEducationData = hasUniversityData || hasCollegeData || hasHighSchoolData;

  if (!hasEducationData) {
    return null;
  }

  // Function to format education period
  const formatEducationPeriod = (admsYear: string | undefined, gradYear: string | undefined) => {
    if (admsYear && gradYear) {
      return `${admsYear}년 ~ ${gradYear}년`;
    } else if (admsYear) {
      return `${admsYear}년 ~`;
    } else if (gradYear) {
      return `~ ${gradYear}년`;
    }
    return '';
  };

  // Default template education section
  if (templateType === 'default' || templateType === 'template1') {
    return (
      <div className="mb-6 break-inside-avoid">
        <h2 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">학력사항</h2>
        <div className="space-y-3">
          {hasUniversityData && (
            <div className="break-inside-avoid">
              <p className="font-semibold">{resumeData.university}</p>
              <p className="text-gray-600">
                {resumeData.universityMajor} 
                {formatEducationPeriod(resumeData.universityAdmsYear, resumeData.universityGradYear) && 
                  ` | ${formatEducationPeriod(resumeData.universityAdmsYear, resumeData.universityGradYear)}`}
              </p>
            </div>
          )}
          {hasCollegeData && (
            <div className="break-inside-avoid">
              <p className="font-semibold">{resumeData.college}</p>
              <p className="text-gray-600">
                {resumeData.collegeMajor}
                {formatEducationPeriod(resumeData.collegeAdmsYear, resumeData.collegeGradYear) && 
                  ` | ${formatEducationPeriod(resumeData.collegeAdmsYear, resumeData.collegeGradYear)}`}
              </p>
            </div>
          )}
          {hasHighSchoolData && (
            <div className="break-inside-avoid">
              <p className="font-semibold">{resumeData.highSchool}</p>
              <p className="text-gray-600">
                {formatEducationPeriod(resumeData.highSchoolAdmsYear, resumeData.highSchoolGradYear)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Modern template education section
  return (
    <div className="mb-6 break-inside-avoid">
      <h2 className="text-xl font-bold mb-4 border-b-2 border-blue-500 pb-2">학력사항</h2>
      <div className="space-y-3">
        {hasUniversityData && (
          <div className="mb-2 break-inside-avoid">
            <p className="font-semibold">{resumeData.university}</p>
            <p className="text-gray-600 text-sm">
              {resumeData.universityMajor}
              {formatEducationPeriod(resumeData.universityAdmsYear, resumeData.universityGradYear) && 
                ` | ${formatEducationPeriod(resumeData.universityAdmsYear, resumeData.universityGradYear)}`}
            </p>
          </div>
        )}
        {hasCollegeData && (
          <div className="mb-2 break-inside-avoid">
            <p className="font-semibold">{resumeData.college}</p>
            <p className="text-gray-600 text-sm">
              {resumeData.collegeMajor}
              {formatEducationPeriod(resumeData.collegeAdmsYear, resumeData.collegeGradYear) && 
                ` | ${formatEducationPeriod(resumeData.collegeAdmsYear, resumeData.collegeGradYear)}`}
            </p>
          </div>
        )}
        {hasHighSchoolData && (
          <div className="mb-2 break-inside-avoid">
            <p className="font-semibold">{resumeData.highSchool}</p>
            <p className="text-gray-600 text-sm">
              {formatEducationPeriod(resumeData.highSchoolAdmsYear, resumeData.highSchoolGradYear)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Education;
