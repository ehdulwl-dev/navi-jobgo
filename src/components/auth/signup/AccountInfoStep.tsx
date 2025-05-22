
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SignupFormValues } from "./types";

interface AccountInfoStepProps {
  form: UseFormReturn<SignupFormValues>;
  isCustomDomain: boolean;
  handleEmailDomainChange: (value: string) => void;
}

const EMAIL_DOMAINS = [
  "naver.com",
  "gmail.com",
  "kakao.com", 
  "daum.net",
  "nate.com",
  "custom"
];

const AccountInfoStep: React.FC<AccountInfoStepProps> = ({ 
  form, 
  isCustomDomain, 
  handleEmailDomainChange 
}) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>이메일</FormLabel>
            <div className="flex gap-2 items-center">
              <FormControl>
                <Input 
                  type="text" 
                  placeholder="이메일 아이디" 
                  required 
                  {...field} 
                  onChange={(e) => {
                    field.onChange(e);
                    localStorage.setItem('signup_email', e.target.value);
                  }}
                />
              </FormControl>
              <span className="text-base">@</span>
              <Select 
                value={form.watch('emailDomain')} 
                onValueChange={handleEmailDomainChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="도메인 선택" />
                </SelectTrigger>
                <SelectContent>
                  {EMAIL_DOMAINS.map(domain => (
                    <SelectItem key={domain} value={domain}>
                      {domain === 'custom' ? '직접 입력' : domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isCustomDomain && (
              <FormField
                control={form.control}
                name="customDomain"
                render={({ field }) => (
                  <FormControl>
                    <Input 
                      className="mt-2" 
                      placeholder="도메인을 직접 입력해주세요" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        localStorage.setItem('signup_customDomain', e.target.value);
                      }}
                    />
                  </FormControl>
                )}
              />
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>비밀번호</FormLabel>
            <FormControl>
              <Input 
                type="password" 
                placeholder="비밀번호를 입력해주세요" 
                required 
                {...field} 
                onChange={(e) => {
                  field.onChange(e);
                  localStorage.setItem('signup_password', e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>비밀번호 확인</FormLabel>
            <FormControl>
              <Input 
                type="password" 
                placeholder="비밀번호를 다시 입력해주세요" 
                required 
                {...field} 
                onChange={(e) => {
                  field.onChange(e);
                  localStorage.setItem('signup_confirmPassword', e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AccountInfoStep;
