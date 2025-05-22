
import React, { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { SignupFormValues } from "./types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PreferencesStepProps {
  form: UseFormReturn<SignupFormValues>;
}

const PreferencesStep: React.FC<PreferencesStepProps> = ({ form }) => {
  // Define the options for each category
  const jobTypes = [
    { value: "외식·음료", label: "외식·음료" },
    { value: "매장관리·판매", label: "매장관리·판매" },
    { value: "서비스", label: "서비스" },
    { value: "사무직", label: "사무직" },
    { value: "고객상담·리서치·영업", label: "고객상담·리서치·영업" },
    { value: "생산·건설·노무", label: "생산·건설·노무" },
    { value: "IT·기술", label: "IT·기술" },
    { value: "디자인", label: "디자인" },
    { value: "운전·배달", label: "운전·배달" },
    { value: "병원·간호·연구", label: "병원·간호·연구" },
    { value: "교육·강사", label: "교육·강사" },
    { value: "보안·경비·경호", label: "보안·경비·경호" },
  ].sort((a, b) => {
    const getFirstConsonant = (str: string) => {
      const code = str.charCodeAt(0) - 44032;
      if (code < 0 || code > 11171) return str.charAt(0);
      return String.fromCharCode(Math.floor(code / 588) + 4352);
    };
    return getFirstConsonant(a.label).localeCompare(getFirstConsonant(b.label));
  });

  const locations = [
    "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구",
    "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구",
    "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"
  ];

  const workTimes = [
    "오전 파트", "오후 파트", "저녁 파트", "새벽 파트", "풀타임(8시간 이상)"
  ];

  const personalityTraits = [
    "성실해요", "책임감 강해요", "긍정적이에요", "꼼꼼해요", "적극적이에요",
    "위기대처를 잘해요", "공감을 잘해요", "인내심이 강해요", "친절해요", "근무시간을 잘지켜요"
  ];

  // Initialize form values from localStorage when component mounts
  useEffect(() => {
    const loadFromLocalStorage = (key: string) => {
      const value = localStorage.getItem(`signup_${key}`);
      if (value) {
        try {
          return JSON.parse(value);
        } catch (e) {
          return [];
        }
      }
      return [];
    };

    form.setValue('preferjob', loadFromLocalStorage('preferjob'));
    form.setValue('preferlocate', loadFromLocalStorage('preferlocate'));
    form.setValue('prefertime', loadFromLocalStorage('prefertime'));
    form.setValue('personality', loadFromLocalStorage('personality'));
  }, [form]);

  // Helper function to update localStorage with array values
  const updateLocalStorage = (name: string, value: string[]) => {
    localStorage.setItem(`signup_${name}`, JSON.stringify(value));
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="preferjob"
        render={({ field }) => (
          <FormItem>
            <FormLabel>희망 직종</FormLabel>
            <FormControl>
              <ScrollArea className="h-[200px] border rounded-md p-4">
                <ToggleGroup
                  type="multiple"
                  className="flex flex-wrap gap-2"
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    updateLocalStorage('preferjob', value);
                  }}
                >
                  {jobTypes.map((job) => (
                    <ToggleGroupItem
                      key={job.value}
                      value={job.value}
                      variant="outline"
                      className="data-[state=on]:bg-app-blue data-[state=on]:text-white"
                    >
                      {job.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </ScrollArea>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="preferlocate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>희망 근무지</FormLabel>
            <FormControl>
              <ScrollArea className="h-[200px] border rounded-md p-4">
                <ToggleGroup
                  type="multiple"
                  className="flex flex-wrap gap-2"
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    updateLocalStorage('preferlocate', value);
                  }}
                >
                  {locations.map((location) => (
                    <ToggleGroupItem
                      key={location}
                      value={location}
                      variant="outline"
                      className="data-[state=on]:bg-app-blue data-[state=on]:text-white"
                    >
                      {location}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </ScrollArea>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="prefertime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>희망 근무 시간</FormLabel>
            <FormControl>
              <ToggleGroup
                type="multiple"
                className="flex flex-wrap gap-2"
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  updateLocalStorage('prefertime', value);
                }}
              >
                {workTimes.map((time) => (
                  <ToggleGroupItem
                    key={time}
                    value={time}
                    variant="outline"
                    className="data-[state=on]:bg-app-blue data-[state=on]:text-white"
                  >
                    {time}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="personality"
        render={({ field }) => (
          <FormItem>
            <FormLabel>나의 강점</FormLabel>
            <FormControl>
              <ScrollArea className="h-[200px] border rounded-md p-4">
                <ToggleGroup
                  type="multiple"
                  className="flex flex-wrap gap-2"
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    updateLocalStorage('personality', value);
                  }}
                >
                  {personalityTraits.map((trait) => (
                    <ToggleGroupItem
                      key={trait}
                      value={trait}
                      variant="outline"
                      className="data-[state=on]:bg-app-blue data-[state=on]:text-white"
                    >
                      {trait}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </ScrollArea>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PreferencesStep;
