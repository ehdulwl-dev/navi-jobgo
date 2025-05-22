
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClarificationQuestion } from "../../services/jobs/analysis/types";

interface QualificationQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: ClarificationQuestion[];
  onComplete: (answers: Array<{question: ClarificationQuestion, answer: boolean}>) => void;
}

const QualificationQuestionDialog: React.FC<QualificationQuestionDialogProps> = ({
  open,
  onOpenChange,
  questions,
  onComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<{question: ClarificationQuestion, answer: boolean}>>([]);
  const [isCompleting, setIsCompleting] = useState(false);

  // Reset state when dialog is opened or when questions change
  useEffect(() => {
    if (open) {
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setIsCompleting(false);
    }
  }, [open, questions]);

  // Early return if there are no questions or dialog is not open
  if (!open || questions.length === 0) {
    return null;
  }

  const handleAnswer = (answer: boolean) => {
    // Prevent multiple submissions
    if (isCompleting) return;

    const currentQuestion = questions[currentQuestionIndex];
    const newAnswers = [...answers, {question: currentQuestion, answer}];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // 모든 질문에 답변 완료
      setIsCompleting(true);
      
      // 다이얼로그 닫기 (먼저 닫고)
      onOpenChange(false);
      
      // 완료 콜백 호출 (닫은 후에 콜백)
      setTimeout(() => {
        onComplete(newAnswers);
      }, 100);
    }
  };

  const handleClose = () => {
    if (!isCompleting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            잠깐,
            <br />몇 가지를 물어볼게요
          </DialogTitle>
          <DialogDescription className="sr-only">
            공고 분석을 위한 추가 질문입니다
          </DialogDescription>
        </DialogHeader>
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="py-6">
          <p className="text-center text-lg mb-8">
            {questions[currentQuestionIndex]?.text || ""}
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => handleAnswer(true)}
              disabled={isCompleting}
              className="w-24 h-24 rounded-2xl bg-blue-100 hover:bg-blue-200 text-blue-600"
            >
              O
            </Button>
            <Button
              onClick={() => handleAnswer(false)}
              disabled={isCompleting}
              className="w-24 h-24 rounded-2xl bg-red-100 hover:bg-red-200 text-red-600"
            >
              X
            </Button>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          {currentQuestionIndex + 1} / {questions.length}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QualificationQuestionDialog;
