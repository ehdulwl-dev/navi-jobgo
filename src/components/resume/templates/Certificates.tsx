
import React from 'react';
import { ResumeData } from '@/services/resume/types';

interface CertificatesProps {
  resumeData: ResumeData;
  templateType?: string;
}

const Certificates: React.FC<CertificatesProps> = ({ resumeData, templateType = 'default' }) => {
  // Check if there's certificate data to display
  const hasCertificateData = resumeData.certificates && 
    resumeData.certificates.length > 0 && 
    resumeData.certificates.some(cert => cert.name && cert.name.trim() !== '');

  if (!hasCertificateData) {
    return null;
  }

  // Default template certificates section
  if (templateType === 'default' || templateType === 'template1') {
    return (
      <div className="mb-6 break-inside-avoid">
        <h2 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">자격증</h2>
        <div className="space-y-3">
          {resumeData.certificates && resumeData.certificates.map((cert, index) => (
            cert.name && cert.name.trim() !== '' && (
              <div key={index} className="break-inside-avoid">
                <p className="font-semibold">{cert.name}</p>
                <p className="text-gray-600">
                  {[cert.grade, cert.organization, cert.issueDate]
                    .filter(item => item && item.trim() !== '')
                    .join(' | ')}
                </p>
              </div>
            )
          ))}
        </div>
      </div>
    );
  }

  // Modern template certificates section
  return (
    <div className="break-inside-avoid">
      <h2 className="text-xl font-bold mb-4 border-b-2 border-blue-500 pb-2">자격증</h2>
      <div className="space-y-2">
        {resumeData.certificates && resumeData.certificates.map((cert, index) => (
          cert.name && cert.name.trim() !== '' && (
            <div key={index} className="mb-2 break-inside-avoid">
              <p className="font-semibold">{cert.name}</p>
              <p className="text-gray-600 text-sm">
                {[cert.grade, cert.organization, cert.issueDate]
                  .filter(item => item && item.trim() !== '')
                  .join(' | ')}
              </p>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default Certificates;
