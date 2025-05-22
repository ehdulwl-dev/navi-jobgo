import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Mic,
  MicOff,
  RefreshCw,
  Volume2,
  Loader2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import BottomNavigation from "../components/BottomNavigation";
import { useSpeechSynthesis } from "react-speech-kit";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";

interface Keyword {
  id: string;
  text: string;
  selected: boolean;
  color: BadgeVariant;
}

const INITIAL_KEYWORDS: Keyword[] = [
  { id: "1", text: "위기 대처 능력", selected: false, color: "default" },
  { id: "2", text: "의사소통 능력", selected: false, color: "secondary" },
  { id: "3", text: "협업 능력", selected: false, color: "default" },
  { id: "4", text: "문제해결 능력", selected: false, color: "secondary" },
  { id: "5", text: "도전정신", selected: false, color: "outline" },
  { id: "6", text: "책임감", selected: false, color: "destructive" },
  { id: "7", text: "성실함", selected: false, color: "default" },
  { id: "8", text: "리더십", selected: false, color: "secondary" },
  { id: "9", text: "창의성", selected: false, color: "outline" },
  { id: "10", text: "전문성", selected: false, color: "destructive" },
];

const DEFAULT_QUESTIONS = [
  "지원 동기와 입사 후 포부를 말씀해주세요.",
  "직무와 관련된 경험 또는 활동을 말씀해주세요.",
  "나의 강점과 약점에 대해 말씀해주세요.",
];

const MAX_REFRESH_COUNT = 3;

const CoverLetterAIForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { speak, cancel, speaking } = useSpeechSynthesis();

  const jobData = (location.state as any) || {};
  const initialQuestions = jobData.questions || DEFAULT_QUESTIONS;
  const initialAnswers = jobData.answers || [];

  const [company, setCompany] = useState(jobData.company || "");
  const [position, setPosition] = useState(jobData.position || "");
  const [questions, setQuestions] = useState<string[]>(initialQuestions);
  const [answers, setAnswers] = useState<string[]>(
    initialQuestions.map((_, i) => initialAnswers[i] || "")
  );
  const [keywords, setKeywords] = useState<Keyword[]>(
    jobData.keywords || INITIAL_KEYWORDS
  );
  const [isRecording, setIsRecording] = useState<boolean[]>(
    initialQuestions.map(() => false)
  );
  const [refreshCount, setRefreshCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const recognitionRefs = useRef<(SpeechRecognition | null)[]>(
    Array(initialQuestions.length).fill(null)
  );

  const handleKeywordClick = (id: string) => {
    const selectedCount = keywords.filter((k) => k.selected).length;

    setKeywords((prevKeywords) =>
      prevKeywords.map((keyword) => {
        if (keyword.id === id) {
          if (keyword.selected) {
            return { ...keyword, selected: false };
          } else if (selectedCount < 3) {
            return { ...keyword, selected: true };
          }
          return keyword;
        }
        return keyword;
      })
    );
  };

  const handleRefreshKeywords = () => {
    if (refreshCount >= MAX_REFRESH_COUNT) {
      toast.error(
        `키워드는 최대 ${MAX_REFRESH_COUNT}회까지만 새로고침이 가능합니다.`
      );
      return;
    }

    const shuffledKeywords = [...INITIAL_KEYWORDS]
      .sort(() => Math.random() - 0.5)
      .map((keyword, index) => {
        const colors: Array<
          "default" | "secondary" | "outline" | "destructive"
        > = ["default", "secondary", "outline", "destructive"];
        return {
          ...keyword,
          selected: false,
          color: colors[index % colors.length],
        };
      });

    setKeywords(shuffledKeywords);
    setRefreshCount((prev) => prev + 1);
    toast.success(`키워드 새로고침 (${refreshCount + 1}/${MAX_REFRESH_COUNT})`);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const toggleRecording = (index: number) => {
    stopAllRecordings();

    const newRecordingState = Array(questions.length).fill(false);

    if (!isRecording[index]) {
      newRecordingState[index] = true;
      startRecording(index);
    }

    setIsRecording(newRecordingState);
  };

  const startRecording = (index: number) => {
    try {
      // SpeechRecognition 초기화 개선
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognitionAPI) {
        toast.error("음성 인식이 지원되지 않는 브라우저입니다.");
        return;
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.lang = "ko-KR";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // 음성 인식 결과 처리 개선
        const currentTranscript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        
        console.log("음성 인식 결과:", currentTranscript);
        handleAnswerChange(index, currentTranscript);
      };

      recognition.onend = () => {
        console.log("음성 인식이 종료되었습니다.");
        setIsRecording((prev) => {
          const newState = [...prev];
          newState[index] = false;
          return newState;
        });
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("음성 인식 오류:", event.error);
        toast.error(`음성 인식 오류: ${event.error}`);
        setIsRecording((prev) => {
          const newState = [...prev];
          newState[index] = false;
          return newState;
        });
      };

      // 음성 인식 시작
      recognition.start();
      recognitionRefs.current[index] = recognition;
      toast.success("음성 인식을 시작합니다. 말씀해주세요.");
      console.log("음성 인식이 시작되었습니다.");
    } catch (error) {
      console.error("음성 인식 시작 오류:", error);
      toast.error("음성 인식 시작 중 오류가 발생했습니다.");
      setIsRecording((prev) => {
        const newState = [...prev];
        newState[index] = false;
        return newState;
      });
    }
  };

  const stopAllRecordings = () => {
    recognitionRefs.current.forEach((recognition, index) => {
      if (recognition) {
        try {
          recognition.stop();
          console.log(`음성 인식 ${index}번 강제 종료`);
        } catch (error) {
          console.error(`음성 인식 종료 오류 (${index}번):`, error);
        }
        recognitionRefs.current[index] = null;
      }
    });
  };

  // Updated function to save questions and answers to TB_CL_UQUE table
  const saveQuestionAnswersToDB = async () => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("User not logged in, skipping DB save");
        return;
      }
      
      // Make sure to convert user.id to a number if it's a string
      const userId = parseInt(user.id, 10);
      
      if (isNaN(userId)) {
        console.error("Invalid user ID format:", user.id);
        return;
      }
      
      // Save each question-answer pair
      for (let i = 0; i < questions.length; i++) {
        if (questions[i] && answers[i]) {
          const { data, error } = await supabase
            .from('TB_CL_UQUE')
            .insert({
              question: questions[i],
              answer: answers[i],
              action: 'create',
              userid: userId
            });

          if (error) {
            console.error(`Error saving Q&A pair ${i+1}:`, error);
          } else {
            console.log(`Saved Q&A pair ${i+1} to DB:`, data);
          }
        }
      }
      
      // Also save selected keywords
      const selectedKeywords = keywords
        .filter(k => k.selected)
        .map(k => k.text);
      
      if (selectedKeywords.length > 0) {
        const { error } = await supabase
          .from('TB_CL_WORD')
          .insert({
            keyword1: selectedKeywords[0] || null,
            keyword2: selectedKeywords[1] || null,
            keyword3: selectedKeywords[2] || null,
            userid: userId
          });
          
        if (error) {
          console.error("Error saving keywords:", error);
        }
      }
    } catch (error) {
      console.error("Error saving to database:", error);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!company.trim()) {
      toast.error("회사명을 입력해주세요.");
      return;
    }

    if (!position.trim()) {
      toast.error("채용 직무를 입력해주세요.");
      return;
    }

    if (answers.every((a) => !a.trim())) {
      toast.error("적어도 하나의 질문에 답변을 입력해주세요.");
      return;
    }

    const selectedKeywords = keywords
      .filter((k) => k.selected)
      .map((k) => k.text);

    if (selectedKeywords.length === 0) {
      toast.error("강조하고 싶은 단어를 선택해주세요.");
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading("자기소개서 생성 중입니다...");

    try {
      // Save the questions and answers to TB_CL_UQUE table
      await saveQuestionAnswersToDB();
      
      console.log("Calling generate-cover-letter function with:", {
        company,
        position,
        questions: questions.length,
        answers: answers.length,
        keywords: selectedKeywords,
      });

      const response = await supabase.functions.invoke(
        "generate-cover-letter",
        {
          body: {
            company,
            position,
            questions,
            answers,
            keywords: selectedKeywords,
          },
        }
      );

      if (response.error) {
        console.error("Supabase function error:", response.error);
        throw new Error(response.error.message || "함수 호출에 실패했습니다.");
      }

      if (!response.data) {
        throw new Error("응답 데이터가 없습니다.");
      }

      if (!response.data.success) {
        throw new Error(
          response.data.error || "자기소개서 생성에 실패했습니다."
        );
      }

      toast.dismiss(toastId);
      toast.success("자기소개서가 생성되었습니다!");

      localStorage.setItem("hasCoverLetters", "true");

      // Save generated content to localStorage for now
      localStorage.setItem(
        "generatedCoverLetter",
        JSON.stringify(response.data.coverLetter)
      );

      // Navigate to the cover letter page
      navigate("/cover-letter/preview");
    } catch (error) {
      console.error("Error generating cover letter:", error);
      toast.dismiss(toastId);
      toast.error(
        `자기소개서 생성에 실패했습니다: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditQuestions = () => {
    navigate("/cover-letter/questions/edit", {
      state: {
        company,
        position,
        questions,
        answers,
        keywords,
      },
    });
  };

  useEffect(() => {
    // 컴포넌트 언마운트 시 모든 음성 인식 종료
    return () => {
      stopAllRecordings();
    };
  }, []);

  const handleSpeak = (text: string) => {
    if (speaking) {
      cancel();
    } else {
      speak({ text });
    }
  };

  // 브라우저 음성인식 지원 여부 확인
  useEffect(() => {
    const checkSpeechRecognitionSupport = () => {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognitionAPI) {
        console.error("이 브라우저는 음성 인식을 지원하지 않습니다.");
        toast.error("이 브라우저는 음성 인식을 지원하지 않습니다.");
      } else {
        console.log("음성 인식 기능이 지원됩니다.");
      }
    };
    
    checkSpeechRecognitionSupport();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-white ">
        <Header title="자기소개서" />
        <div className="text-xl font-normal px-4 pt-6 ">
          <div>자기소개서에 강점 쏙!</div>
          <div>NAVI가 도와드릴게요</div>
        </div>
        <Progress value={33} className="w-full h-1 mt-4" />
      </div>

      <main className="px-4 py-6">
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block">회사명</label>
                <Input
                  placeholder="회사명을 입력하세요"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block">채용 직무</label>
                <Input
                  placeholder="채용 직무 내용"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <div className="flex items-center mb-4">
            <h3 className="text-sm text-start font-bold mr-2">
              강조하고 싶은 단어를 선택해주세요.(최대 3개)
            </h3>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 rounded-md bg-white border border-gray-200 hover:bg-gray-100"
              onClick={() =>
                handleSpeak("강조하고 싶은 단어를 선택해주세요. 최대 3개")
              }
            >
              <Volume2 size={14} className="text-blue-500" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 justify-start">
            {keywords.map((keyword) => (
              <Badge
                key={keyword.id}
                variant={keyword.selected ? "default" : keyword.color}
                className={`text-xs py-1 px-2 cursor-pointer transition-colors border rounded-full ${
                  keyword.selected
                    ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
                onClick={() => handleKeywordClick(keyword.id)}
              >
                {keyword.text}
              </Badge>
            ))}
          </div>
          <div className="text-center text-xs text-red-500 mt-2 flex justify-center items-center">
            <span className="mr-2">
              단어 새로고침 ({refreshCount}/{MAX_REFRESH_COUNT})
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshKeywords}
              disabled={refreshCount >= MAX_REFRESH_COUNT}
            >
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <h3 className="text-sm font-bold text-black mr-2">
                      {question}
                    </h3>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6 rounded-md bg-white border border-gray-200 hover:bg-gray-100"
                      onClick={() => handleSpeak(question)}
                    >
                      <Volume2 size={14} className="text-blue-500" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="100자 이내로 입력하세요"
                    value={answers[index]}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    maxLength={100}
                    className="resize-none pr-10"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className={isRecording[index] ? "bg-red-100" : ""}
                    onClick={() => toggleRecording(index)}
                  >
                    {isRecording[index] ? (
                      <MicOff size={20} className="text-red-500" />
                    ) : (
                      <Mic size={20} className="text-blue-500" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-3 mt-8 mb-20">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleEditQuestions}
          >
            질문 수정
          </Button>
          <Button
            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black"
            onClick={handleGenerateCoverLetter}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                생성 중...
              </>
            ) : (
              "자기소개서 생성"
            )}
          </Button>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default CoverLetterAIForm;
