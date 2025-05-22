
import React, { useEffect } from "react";
import { Form } from "@/components/ui/form";
import PersonalInfoStep from "./signup/PersonalInfoStep";
import ContactInfoStep from "./signup/ContactInfoStep";
import AccountInfoStep from "./signup/AccountInfoStep";
import PreferencesStep from "./signup/PreferencesStep";
import FormHeader from "./signup/FormHeader";
import ProgressIndicator from "./signup/ProgressIndicator";
import FormNavigationButtons from "./signup/FormNavigationButtons";
import { useSignupForm } from "./signup/useSignupForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface SignupFormProps {
  onBack: () => void;
}

const SignupForm = ({ onBack }: SignupFormProps) => {
  const {
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
  } = useSignupForm();

  // 개별 폼 필드를 localStorage에 저장
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name) {
        localStorage.setItem(`signup_${name}`, value[name]?.toString() || '');
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // 컴포넌트 언마운트 시 모든 폼 데이터를 localStorage에서 제거
  useEffect(() => {
    return () => {
      clearSignupData();
    };
  }, [clearSignupData]);

  const renderStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "'나비잡고'에 처음 가입하시나요?";
      case 2:
        return "추가 정보를 입력해주세요";
      case 3:
        return "계정 정보를 입력해주세요";
      case 4:
        return "선호 정보를 입력해주세요";
      default:
        return "회원가입";
    }
  };

  const renderStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return "이제 여러분의 이력서를 도와드릴게요.";
      case 2:
        return "연락처와 주소를 입력해주세요.";
      case 3:
        return "로그인에 사용할 이메일과 비밀번호를 입력해주세요.";
      case 4:
        return "취업 선호도를 알려주시면 더 나은 추천을 해드릴 수 있어요.";
      default:
        return "";
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep form={form} />;
      case 2:
        return <ContactInfoStep form={form} handleAddressComplete={handleAddressComplete} />;
      case 3:
        return (
          <AccountInfoStep 
            form={form} 
            isCustomDomain={isCustomDomain} 
            handleEmailDomainChange={handleEmailDomainChange} 
          />
        );
      case 4:
        return <PreferencesStep form={form} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <FormHeader 
        title={renderStepTitle()} 
        subtitle={renderStepSubtitle()} 
      />

      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

      <Form {...form}>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {renderStepContent()}

          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs ml-2">{error}</AlertDescription>
            </Alert>
          )}

          <FormNavigationButtons 
            prevStep={currentStep === 1 ? onBack : prevStep}
            nextStep={nextStep}
            currentStep={currentStep}
            totalSteps={totalSteps}
            isLoading={isLoading}
            onSubmit={onSubmit}
            loadingElement={
              <div className="flex items-center justify-center">
                <LoadingSpinner text="" className="h-5 w-5 text-white" />
                <span className="ml-2">처리 중...</span>
              </div>
            }
          />
        </form>
      </Form>
    </div>
  );
};

export default SignupForm;
