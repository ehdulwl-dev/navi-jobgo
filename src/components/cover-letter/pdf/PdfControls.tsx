
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, ZoomIn, ZoomOut } from "lucide-react";

interface PdfControlsProps {
  isGenerating: boolean;
  onGenerate: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  showControls?: boolean;
  hideDownload?: boolean;
}

const PdfControls: React.FC<PdfControlsProps> = ({
  isGenerating,
  onGenerate,
  onZoomIn,
  onZoomOut,
  showControls = true,
  hideDownload = false
}) => {
  return (
    <div className="flex justify-end gap-2 mb-2">
      {showControls && onZoomOut && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomOut}
          className="px-2"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      )}
      
      {showControls && onZoomIn && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomIn}
          className="px-2"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      )}
      
      {!hideDownload && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onGenerate}
          disabled={isGenerating}
          title="자기소개서 PDF 다운로드"
        >
          {isGenerating ? (
            <div className="w-4 h-4 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          ) : (
            <Download size={20} className="text-blue-500" />
          )}
        </Button>
      )}
    </div>
  );
};

export default PdfControls;
