
import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { Trash2, CalendarIcon } from "lucide-react";
import { FormDataType } from "@/types/resume";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";

interface SkillsFormProps {
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
  updateCertificate: (index: number, field: string, value: string) => void;
  addCertificate: () => void;
  deleteCertificate: (index: number) => void;
  handlePrevious: () => void;
  handleNext: () => void;
}

export const SkillsForm: React.FC<SkillsFormProps> = ({
  formData,
  setFormData,
  updateCertificate,
  addCertificate,
  deleteCertificate,
  handlePrevious,
  handleNext,
}) => {
  const handleDateChange = (index: number, date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, "yyyy.MM.dd");
      updateCertificate(index, "issueDate", formattedDate);
    }
  };

  const parseDate = (dateString: string): Date | undefined => {
    try {
      if (!dateString) return undefined;
      return parse(dateString, "yyyy.MM.dd", new Date());
    } catch (e) {
      return undefined;
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <h3 className="font-medium text-lg mb-4">자격증</h3>
          {formData.certificates.map((certificate: any, index: number) => (
            <div key={index} className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="flex items-center space-x-2 font-bold">
                  자격증 {index + 1}
                </h4>
                {formData.certificates.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCertificate(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`certificateName${index}`}>자격증명</Label>
                  <Input
                    id={`certificateName${index}`}
                    value={certificate.name}
                    onChange={(e) =>
                      updateCertificate(index, "name", e.target.value)
                    }
                    placeholder="자격증 이름"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`certificateGrade${index}`}>등급</Label>
                  <Input
                    id={`certificateGrade${index}`}
                    value={certificate.grade}
                    onChange={(e) =>
                      updateCertificate(index, "grade", e.target.value)
                    }
                    placeholder="등급/점수"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`certificateOrganization${index}`}>
                    발행기관
                  </Label>
                  <Input
                    id={`certificateOrganization${index}`}
                    value={certificate.organization}
                    onChange={(e) =>
                      updateCertificate(index, "organization", e.target.value)
                    }
                    placeholder="발행기관"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`certificateIssueDate${index}`}>취득일</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id={`certificateIssueDate${index}`}
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !certificate.issueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {certificate.issueDate ? (
                          certificate.issueDate
                        ) : (
                          <span>날짜를 선택하세요</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={parseDate(certificate.issueDate)}
                        onSelect={(date) => handleDateChange(index, date)}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {index < formData.certificates.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addCertificate}
            className="w-full mt-4"
          >
            + 자격증 추가
          </Button>

          <div className="border-t pt-6">
            <h3 className="font-medium text-lg mb-4">컴퓨터 활용 능력</h3>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="documentCreation"
                  checked={formData.computerSkills.documentCreation}
                  onCheckedChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      computerSkills: {
                        ...prev.computerSkills,
                        documentCreation: !prev.computerSkills.documentCreation,
                      },
                    }))
                  }
                />
                <Label htmlFor="documentCreation">
                  문서 작성 (한글, MS워드 등)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="spreadsheet"
                  checked={formData.computerSkills.spreadsheet}
                  onCheckedChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      computerSkills: {
                        ...prev.computerSkills,
                        spreadsheet: !prev.computerSkills.spreadsheet,
                      },
                    }))
                  }
                />
                <Label htmlFor="spreadsheet">스프레드시트 (엑셀 등)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="presentation"
                  checked={formData.computerSkills.presentation}
                  onCheckedChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      computerSkills: {
                        ...prev.computerSkills,
                        presentation: !prev.computerSkills.presentation,
                      },
                    }))
                  }
                />
                <Label htmlFor="presentation">
                  프레젠테이션 (파워포인트 등)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="accounting"
                  checked={formData.computerSkills.accounting}
                  onCheckedChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      computerSkills: {
                        ...prev.computerSkills,
                        accounting: !prev.computerSkills.accounting,
                      },
                    }))
                  }
                />
                <Label htmlFor="accounting">회계 프로그램</Label>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="otherSkill"
                    checked={!!formData.computerSkills.other}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        computerSkills: {
                          ...prev.computerSkills,
                          other: checked ? " " : "",
                        },
                      }))
                    }
                  />
                  <Label htmlFor="otherSkill">기타</Label>
                </div>

                {formData.computerSkills.other !== "" && (
                  <Input
                    value={formData.computerSkills.other}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        computerSkills: {
                          ...prev.computerSkills,
                          other: e.target.value,
                        },
                      }))
                    }
                    placeholder="기타 컴퓨터 활용 능력을 입력하세요"
                    className="mt-2"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between space-x-4 mt-6">
            <Button onClick={handlePrevious} variant="outline">
              이전
            </Button>
            <Button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700"
            >
              다음
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
