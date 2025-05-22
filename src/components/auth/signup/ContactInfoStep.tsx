
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SignupFormValues } from "./types";
import { PostcodeSearch } from "@/components/PostcodeSearch";

interface ContactInfoStepProps {
  form: UseFormReturn<SignupFormValues>;
  handleAddressComplete: (data: any) => void;
}

const ContactInfoStep: React.FC<ContactInfoStepProps> = ({ form, handleAddressComplete }) => {
  // Handle phone number input to allow only numbers and max 11 digits
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 11) {
      form.setValue('phone', value);
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>전화번호</FormLabel>
            <FormControl>
              <Input 
                placeholder="숫자만 입력하세요 (최대 11자리)" 
                {...field}
                onChange={handlePhoneChange}
                maxLength={11}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>주소</FormLabel>
            <div className="flex gap-2">
              <FormControl className="flex-grow">
                <Input placeholder="주소" {...field} readOnly />
              </FormControl>
              <PostcodeSearch onComplete={handleAddressComplete} />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="addressDetail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>상세 주소</FormLabel>
            <FormControl>
              <Input placeholder="상세 주소" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ContactInfoStep;
