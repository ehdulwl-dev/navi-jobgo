
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { SignupFormValues } from "./types";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "./validationSchema";
import { getStoredFormData, clearSignupData } from "./storageUtils";
import { supabase } from "@/integrations/supabase/client";

export const useSignupForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const totalSteps = 4;

  const form = useForm<SignupFormValues>({
    defaultValues: getStoredFormData(),
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = useCallback(async () => {
    // 모든 폼 데이터 가져오기
    const data = form.getValues();
    
    // 제출 전 폼 유효성 검사
    const isValid = await form.trigger();
    if (!isValid) {
      setError("모든 필수 항목을 입력해주세요.");
      return;
    }
    
    // 전체 이메일 주소 구성
    const fullEmail = `${data.email}@${isCustomDomain ? data.customDomain : data.emailDomain}`;
    
    // 주소 필드 결합
    const fullAddress = data.addressDetail 
      ? `${data.address} ${data.addressDetail}`
      : data.address;

    // 생년월일을 YYYY-MM-DD 형식으로 포맷
    let birthdate = null;
    if (data.birthYear && data.birthMonth && data.birthDay) {
      birthdate = `${data.birthYear}-${data.birthMonth}-${data.birthDay}`;
    }
    
    try {
      setIsLoading(true);
      setError(null);

      // 1. Supabase Auth에서 사용자 생성
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: fullEmail,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
          // 이메일 확인을 비활성화하여 즉시 가입할 수 있도록 함
          emailRedirectTo: undefined,
        }
      });

      console.log("authData:", authData);
      console.log("authError:", authError);

      if (authError) {
        // 자세한 오류 메시지 처리
        let errorMessage = authError.message;
        if (errorMessage.includes("User already registered")) {
          errorMessage = "이미 등록된 이메일입니다. 로그인을 시도해보세요.";
        }
        console.error("인증 오류:", authError);
        throw new Error(errorMessage);
      }
      
      console.log("인증 데이터:", authData);
      
      if (!authData.user) {
        throw new Error("유저 생성 실패");
      }

      try {
        // 2. TB_USER 테이블에 사용자 데이터 삽입
        const { error: userError } = await supabase
          .from('TB_USER')
          .insert({
            name: data.name,
            gender: data.gender,
            birthdate: birthdate,
            phone: data.phone,
            address: fullAddress,
            email: fullEmail,
            preferjob: data.preferjob?.join(', ') || null,
            preferlocate: data.preferlocate?.join(', ') || null,
            prefertime: data.prefertime?.join(', ') || null,
            personality: data.personality?.join(', ') || null
          });

        if (userError) {
          console.error("TB_USER에 삽입 중 오류:", userError);
          throw new Error("사용자 정보 저장 중 오류가 발생했습니다");
        }
        
        console.log("사용자가 TB_USER에 성공적으로 등록됨");
        
        // localStorage에서 폼 데이터 삭제
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('signup_')) {
            localStorage.removeItem(key);
          }
        });

        // 성공 메시지 표시
        toast.success("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
        
        // 로그인 페이지로 리디렉션
        navigate("/LoginPage", {
          state: { reset: true },
          replace: true,
        });
        
      } catch (error: any) {
        console.error("registerUser 오류:", error);
        throw error;
      }
    } catch (err: any) {
      setError(err.message || "회원가입 중 오류가 발생했습니다.");
      console.error("회원가입 오류:", err);
    } finally {
      setIsLoading(false);
    }
  }, [form, isCustomDomain, navigate]);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prevStep => prevStep + 1);
    } else if (currentStep === totalSteps) {
      onSubmit();
    }
  }, [currentStep, totalSteps, onSubmit]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prevStep => prevStep - 1);
    }
  }, [currentStep]);

  const handleAddressComplete = useCallback((data: any) => {
    form.setValue('address', data.roadAddress || data.jibunAddress || '', { shouldValidate: true });
    localStorage.setItem('signup_address', data.roadAddress || data.jibunAddress || '');
  }, [form]);

  const handleEmailDomainChange = useCallback((value: string) => {
    setIsCustomDomain(value === 'custom');
    form.setValue('emailDomain', value);
    localStorage.setItem('signup_emailDomain', value);
  }, [form]);

  return {
    form,
    error,
    isLoading,
    currentStep,
    totalSteps,
    isCustomDomain,
    nextStep,
    prevStep,
    handleAddressComplete,
    handleEmailDomainChange,
    clearSignupData,
    onSubmit,
  };
};
