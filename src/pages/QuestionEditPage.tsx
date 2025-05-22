
import React, { useState } from "react";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Progress } from "@/components/ui/progress";

const DEFAULT_QUESTIONS = [
  "지원 동기에 대하여 말씀해주세요.",
  "관련 경험 또는 유사 활동을 말씀해주세요.",
  "직무 관련 강점에 대해 말씀해주세요.",
];

const QuestionEditPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<string[]>(
    location.state?.questions || DEFAULT_QUESTIONS
  );

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) {
      toast.error("최소 1개의 질문이 필요합니다.");
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, ""]);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const handleSave = () => {
    if (questions.some((q) => !q.trim())) {
      toast.error("모든 질문을 입력해주세요.");
      return;
    }
    
    // Create new answers array matching the length of questions
    const answers = location.state?.answers || [];
    const newAnswers = questions.map((_, i) => answers[i] || "");
    
    navigate("/cover-letter/ai-create", {
      state: { 
        ...location.state, 
        questions,
        answers: newAnswers
      },
    });
  };

  return (
    <div className="max-w-none w-[412px] h-[917px] flex flex-col bg-white mx-auto">
      <div className="sticky top-0 z-10 bg-white ">
        <Header title="자기소개서" />
        <div className="text-xl font-normal px-4 pt-6 ">
          <div>자기소개서에 강점 쏙!</div>
          <div>NAVI가 도와드릴게요</div>
        </div>
        <Progress value={33} className="w-full h-1 mt-4" />
      </div>

      <main className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={question}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
                placeholder="질문을 입력해주세요"
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveQuestion(index)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={handleAddQuestion}
        >
          <Plus size={16} className="mr-2" />
          추가
        </Button>

        <Button
          className="w-full mt-4 bg-yellow-400 hover:bg-yellow-500 text-black"
          onClick={handleSave}
        >
          수정 완료
        </Button>
      </main>
    </div>
  );
};

export default QuestionEditPage;
