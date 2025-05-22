
import React from 'react';
import { ResumeData } from '@/services/resume';
import { usePdfGenerator } from './pdf/usePdfGenerator';
import PdfControls from './pdf/PdfControls';

interface ResumePdfGeneratorProps {
  resumeId: string;
  resumeData: ResumeData;
  showControls?: boolean;
  zoomLevel?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  hideDownload?: boolean;
}

const ResumePdfGenerator: React.FC<ResumePdfGeneratorProps> = ({
  resumeData,
  showControls = true,
  onZoomIn,
  onZoomOut,
  hideDownload = false
}) => {
  const { isGenerating, generatePDF } = usePdfGenerator(resumeData);

  return (
    <PdfControls
      isGenerating={isGenerating}
      onGenerate={generatePDF}
      onZoomIn={onZoomIn}
      onZoomOut={onZoomOut}
      showControls={showControls}
      hideDownload={hideDownload}
    />
  );
};

export default ResumePdfGenerator;
