
import React from 'react';
import { ResumeData } from '@/services/resume';

interface HeaderProps {
  resumeData: ResumeData;
  templateType?: string;
}

const Header: React.FC<HeaderProps> = ({ resumeData, templateType = 'default' }) => {
  // Default template header
  if (templateType === 'default' || templateType === 'template1') {
    return (
      <div className="border-b-2 border-gray-800 pb-4 mb-6 break-inside-avoid">
        <h1 className="text-3xl font-bold">{resumeData.name}</h1>
        <div className="mt-2 text-gray-600">
          <p>생년월일: {`${resumeData.birthYear || ''}.${resumeData.birthMonth || ''}.${resumeData.birthDay || ''}`}</p>
          <p>이메일: {resumeData.email || ''}</p>
          <p>연락처: {resumeData.phone || ''}</p>
          <p>주소: {resumeData.address || ''}</p>
        </div>
      </div>
    );
  }

  // Modern template header
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold mb-4">{resumeData.name}</h1>
      <div className="space-y-2 text-sm">
        <p>생년월일: {`${resumeData.birthYear || ''}.${resumeData.birthMonth || ''}.${resumeData.birthDay || ''}`}</p>
        <p>이메일: {resumeData.email || ''}</p>
        <p>연락처: {resumeData.phone || ''}</p>
        <p>주소: {resumeData.address || ''}</p>
      </div>
    </div>
  );
};

export default Header;
