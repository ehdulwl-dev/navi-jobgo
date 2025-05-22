import React from 'react';
import { Edit2, Trash, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ResumePdfGenerator from './resume/ResumePdfGenerator';
import { ResumeData } from '@/services/resume';

interface ResumeCardProps {
  title: string;
  date: string;
  resumeData: ResumeData;
  onDelete?: () => void;
  onEdit?: () => void;
}

const ResumeCard: React.FC<ResumeCardProps> = ({
  title,
  date,
  resumeData,
  onDelete,
  onEdit,
}) => {
  // 템플릿 이름을 결정하는 함수
  const getTemplateName = () => {
    if (!resumeData.selectedTemplate || resumeData.selectedTemplate === 'template1') {
      return '기본 템플릿';
    } else if (resumeData.selectedTemplate === 'template2') {
      return '현대적 템플릿';
    }
    return '기본 템플릿';
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-gray-500">{date}</p>
            <p className="text-xs text-blue-500 mt-1">
              템플릿: {getTemplateName()}
            </p>
          </div>
          <div className="flex gap-2">
            {resumeData && resumeData.id && (
              <ResumePdfGenerator 
                resumeId={resumeData.id} 
                resumeData={resumeData} 
                showControls={false}
              />
            )}
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash size={20} className="text-red-500" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>이력서 삭제</AlertDialogTitle>
                    <AlertDialogDescription>
                      이 이력서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-500 hover:bg-red-600"
                      onClick={onDelete}
                    >
                      삭제
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        
        {onEdit && (
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center"
              onClick={onEdit}
            >
              <Edit2 size={16} className="mr-1" />
              이력서 수정
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeCard;
