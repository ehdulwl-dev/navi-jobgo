import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PenTool, FileText, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

interface ApplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: string;
  company: string;
  onCreateCoverLetter: () => void;
}

const ApplyDialog: React.FC<ApplyDialogProps> = ({
  open,
  onOpenChange,
  jobTitle,
  company,
  onCreateCoverLetter,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      toast.success("이력서 파일이 선택되었습니다.");
    }
  };

  const handleApplyWithFile = () => {
    if (selectedFile) {
      toast.success("지원이 완료되었습니다!");
      onOpenChange(false);
    } else {
      toast.error("이력서 파일을 선택해주세요.");
    }
  };

  const handleMethodSelect = (method: string) => {
    switch (method) {
      case "document":
        setShowDocumentUpload(true);
        break;
      case "sms":
        toast.success("문자 지원이 완료되었습니다.");
        onOpenChange(false);
        break;
      case "phone":
        toast.success("전화 지원이 완료되었습니다.");
        onOpenChange(false);
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{jobTitle} 지원하기</DialogTitle>
          <DialogDescription>
            {company}에 지원하는 방법을 선택해주세요.
          </DialogDescription>
        </DialogHeader>

        {!showDocumentUpload ? (
          <div className="grid gap-4 py-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 h-14 text-base"
              onClick={() => handleMethodSelect("document")}
            >
              <FileText className="w-5 h-5" />
              서류 지원
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 h-14 text-base"
              onClick={() => handleMethodSelect("sms")}
            >
              <Mail className="w-5 h-5" />
              문자 지원
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 h-14 text-base"
              onClick={() => handleMethodSelect("phone")}
            >
              <Phone className="w-5 h-5" />
              전화 지원
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="resume">이력서 파일 업로드</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="bg-gray-50"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApplyWithFile}
                >
                  제출
                </Button>
              </div>
            </div>

            <Separator />

            <div className="grid gap-2">
              <Label>AI 자기소개서 작성</Label>
              <Button
                className="w-full bg-[#FFE376] hover:bg-[#FFE376] text-black"
                onClick={onCreateCoverLetter}
              >
                <img
                  src="/buttons/Plus.svg"
                  alt="AI로 자기소개서 작성"
                  className="w-5 h-5"
                />
                자기소개서 생성하기
              </Button>
              <p className="text-sm text-muted-foreground"></p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ApplyDialog;
