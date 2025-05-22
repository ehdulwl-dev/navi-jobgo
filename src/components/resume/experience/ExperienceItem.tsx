
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { ExperienceItemProps, ExperienceItemType } from "./types";

export const ExperienceItem: React.FC<ExperienceItemProps> = ({
  experience,
  index,
  jobTitles,
  contractTypes,
  years,
  months,
  handleExperienceChange,
  deleteExperience,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="block text-sm font-bold text-black">
          경력 {index + 1}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteExperience(index)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`companyName${index}`}>회사명</Label>
          <Input
            id={`companyName${index}`}
            value={experience.companyName}
            onChange={(e) =>
              handleExperienceChange(
                index,
                "companyName",
                e.target.value
              )
            }
            placeholder="회사명"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`jobTitle${index}`}>직무</Label>
            <Select
              value={experience.jobTitle}
              onValueChange={(value) =>
                handleExperienceChange(index, "jobTitle", value)
              }
            >
              <SelectTrigger id={`jobTitle${index}`}>
                <SelectValue placeholder="직무 선택" />
              </SelectTrigger>
              <SelectContent>
                {jobTitles.map((title) => (
                  <SelectItem key={title} value={title}>
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {experience.jobTitle === "직접 입력" && (
            <div className="space-y-2">
              <Label htmlFor={`customJobTitle${index}`}>
                직접 입력
              </Label>
              <Input
                id={`customJobTitle${index}`}
                value={experience.customJobTitle}
                onChange={(e) =>
                  handleExperienceChange(
                    index,
                    "customJobTitle",
                    e.target.value
                  )
                }
                placeholder="직무명 입력"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor={`contractType${index}`}>고용형태</Label>
            <Select
              value={experience.contractType}
              onValueChange={(value) => {
                handleExperienceChange(index, "contractType", value);
                // Also update employmentStatus to match contractType for compatibility
                handleExperienceChange(index, "employmentStatus", value);
              }}
            >
              <SelectTrigger id={`contractType${index}`}>
                <SelectValue placeholder="고용형태 선택" />
              </SelectTrigger>
              <SelectContent>
                {contractTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Hidden input for employmentStatus to ensure it's always present in the form data */}
        <input 
          type="hidden" 
          value={experience.employmentStatus || experience.contractType || ""} 
          onChange={(e) => 
            handleExperienceChange(index, "employmentStatus", e.target.value)
          } 
        />

        <WorkPeriodSection 
          experience={experience}
          index={index}
          years={years}
          months={months}
          handleExperienceChange={handleExperienceChange}
        />

        <div className="space-y-2">
          <Label htmlFor={`responsibilities${index}`}>담당업무</Label>
          <Input
            id={`responsibilities${index}`}
            value={experience.responsibilities}
            onChange={(e) =>
              handleExperienceChange(
                index,
                "responsibilities",
                e.target.value
              )
            }
            placeholder="담당 업무 내용을 입력하세요"
          />
        </div>
      </div>
    </div>
  );
};

interface WorkPeriodSectionProps {
  experience: ExperienceItemType;
  index: number;
  years: number[];
  months: number[];
  handleExperienceChange: (index: number, field: string, value: string) => void;
}

const WorkPeriodSection: React.FC<WorkPeriodSectionProps> = ({ 
  experience, 
  index, 
  years, 
  months, 
  handleExperienceChange 
}) => {
  return (
    <div className="space-y-2">
      <Label>근무기간</Label>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={experience.startYear}
            onValueChange={(value) =>
              handleExperienceChange(index, "startYear", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="년도" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem
                  key={`start-year-${year}`}
                  value={year.toString()}
                >
                  {year}년
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={experience.startMonth}
            onValueChange={(value) =>
              handleExperienceChange(index, "startMonth", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="월" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem
                  key={`start-month-${month}`}
                  value={month.toString()}
                >
                  {month}월
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={experience.endYear}
            onValueChange={(value) =>
              handleExperienceChange(index, "endYear", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="년도" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem
                  key={`end-year-${year}`}
                  value={year.toString()}
                >
                  {year}년
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={experience.endMonth}
            onValueChange={(value) =>
              handleExperienceChange(index, "endMonth", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="월" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem
                  key={`end-month-${month}`}
                  value={month.toString()}
                >
                  {month}월
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
