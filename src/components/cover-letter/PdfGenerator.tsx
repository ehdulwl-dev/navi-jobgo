
import React from "react";
import { CoverLetterData } from "@/hooks/useCoverLetterData";
import { useCoverLetterPdfGenerator } from "./pdf/useCoverLetterPdfGenerator";
import PdfControls from "./pdf/PdfControls";

interface PdfGeneratorProps {
  contentRef: React.RefObject<HTMLDivElement>;
  coverLetter: CoverLetterData;
  userName?: string;
  zoomLevel?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  hideDownload?: boolean;
}

const PdfGenerator: React.FC<PdfGeneratorProps> = ({
  contentRef,
  coverLetter,
  userName = "이름",
  zoomLevel = 1,
  onZoomIn,
  onZoomOut,
  hideDownload = false
}) => {
  const { isGenerating, generatePDF } = useCoverLetterPdfGenerator();

  const handleGeneratePDF = async () => {
    await generatePDF(coverLetter, userName);
  };

  return (
    <PdfControls
      isGenerating={isGenerating}
      onGenerate={handleGeneratePDF}
      onZoomIn={onZoomIn}
      onZoomOut={onZoomOut}
      showControls={Boolean(onZoomIn && onZoomOut)}
      hideDownload={hideDownload}
    />
  );
};

export default PdfGenerator;
