import React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Award, Accessibility, HandHeart, Upload, Loader2 } from "lucide-react";
import { PostcodeSearch } from "../PostcodeSearch";

interface PersonalInfoFormProps {
  formData: any;
  formErrors: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleCheckboxChange: (name: string) => void;
  handleFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => void;
  handleAddressComplete: (data: any) => void;
  handleNext: () => void;
  isLoading?: boolean;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  formData,
  formErrors,
  handleChange,
  handleSelectChange,
  handleCheckboxChange,
  handleFileChange,
  handleAddressComplete,
  handleNext,
  isLoading = false,
}) => {
  // Generate years in ascending order from 1940 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1940 + 1 },
    (_, i) => 1940 + i
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">사용자 정보를 불러오는 중...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="block text-sm font-bold text-black"
              >
                이름 <span className="text-red-500 text-xs">필수</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="이름을 입력하세요"
                value={formData.name}
                onChange={handleChange}
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && (
                <p className="text-red-500 text-xs">이름을 입력해주세요</p>
              )}
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="block text-sm font-bold text-black"
              >
                이메일 <span className="text-red-500 text-xs">필수</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="이메일을 입력하세요"
                value={formData.email}
                onChange={handleChange}
                className={formErrors.email ? "border-red-500" : ""}
              />
              {formErrors.email && (
                <p className="text-red-500 text-xs">이메일을 입력해주세요</p>
              )}
            </div>

            {/* Phone field */}
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="block text-sm font-bold text-black"
              >
                연락처 <span className="text-red-500 text-xs">필수</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                placeholder="연락처를 입력하세요"
                value={formData.phone}
                onChange={handleChange}
                className={formErrors.phone ? "border-red-500" : ""}
              />
              {formErrors.phone && (
                <p className="text-red-500 text-xs">연락처를 입력해주세요</p>
              )}
            </div>

            {/* Birth date fields */}
            <div className="space-y-2">
              <Label className="block text-sm font-bold text-black">
                생년월일 <span className="text-red-500 text-xs">필수</span>
              </Label>
              <div className="grid grid-cols-3 gap-4">
                <Select
                  value={formData.birthYear}
                  onValueChange={(value) =>
                    handleSelectChange("birthYear", value)
                  }
                >
                  <SelectTrigger
                    className={formErrors.birthYear ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="년도" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}년
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={formData.birthMonth}
                  onValueChange={(value) =>
                    handleSelectChange("birthMonth", value)
                  }
                >
                  <SelectTrigger
                    className={formErrors.birthMonth ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="월" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {month}월
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={formData.birthDay}
                  onValueChange={(value) =>
                    handleSelectChange("birthDay", value)
                  }
                >
                  <SelectTrigger
                    className={formErrors.birthDay ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="일" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}일
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(formErrors.birthYear ||
                formErrors.birthMonth ||
                formErrors.birthDay) && (
                <p className="text-red-500 text-xs">생년월일을 입력해주세요</p>
              )}
            </div>

            {/* Address fields */}
            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="block text-sm font-bold text-black"
              >
                주소 <span className="text-red-500 text-xs">필수</span>
              </Label>
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_120px] gap-2">
                  <Input
                    id="postcode"
                    name="postcode"
                    placeholder="우편번호"
                    value={formData.postcode}
                    readOnly
                    className={formErrors.address ? "border-red-500" : ""}
                  />
                  <PostcodeSearch onComplete={handleAddressComplete} />
                </div>
                <Input
                  id="address"
                  name="address"
                  placeholder="도로명 주소"
                  value={formData.address}
                  readOnly
                  className={formErrors.address ? "border-red-500" : ""}
                />
                <Input
                  id="addressDetail"
                  name="addressDetail"
                  placeholder="상세 주소를 입력하세요"
                  value={formData.addressDetail}
                  onChange={handleChange}
                />
              </div>
              {formErrors.address && (
                <p className="text-red-500 text-xs">주소를 입력해주세요</p>
              )}
            </div>
          </div>

          {/* Special status sections */}
          <div className="space-y-6 pt-4 border-t">
            {/* Veteran status */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isVeteran"
                  checked={formData.isVeteran}
                  onCheckedChange={() => handleCheckboxChange("isVeteran")}
                />
                <Label htmlFor="isVeteran" className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  보훈 대상
                </Label>
              </div>
              {formData.isVeteran && (
                <div className="mt-2 space-y-2">
                  <Select
                    value={formData.veteranType}
                    onValueChange={(value) =>
                      handleSelectChange("veteranType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="보훈 종류 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="독립유공자">독립유공자</SelectItem>
                      <SelectItem value="국가유공자">국가유공자</SelectItem>
                      <SelectItem value="보훈보상대상자">
                        보훈보상대상자
                      </SelectItem>
                      <SelectItem value="특수임무유공자">
                        특수임무유공자
                      </SelectItem>
                      <SelectItem value="5.18민주유공자">
                        5.18민주유공자
                      </SelectItem>
                      <SelectItem value="고엽제후유의증">
                        고엽제후유의증
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      onChange={(e) => handleFileChange(e, "veteranDocument")}
                      className="hidden"
                      id="veteranDocument"
                    />
                    <Label
                      htmlFor="veteranDocument"
                      className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4" />
                      증빙서류 첨부
                    </Label>
                    {formData.veteranDocument && (
                      <span className="text-sm text-gray-600">
                        {formData.veteranDocument.name}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Disability status */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDisabled"
                  checked={formData.isDisabled}
                  onCheckedChange={() => handleCheckboxChange("isDisabled")}
                />
                <Label htmlFor="isDisabled" className="flex items-center gap-1">
                  <Accessibility className="w-4 h-4" />
                  장애 여부
                </Label>
              </div>
              {formData.isDisabled && (
                <div className="mt-2 space-y-2">
                  <Select
                    value={formData.disabilityType}
                    onValueChange={(value) =>
                      handleSelectChange("disabilityType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="장애 종류 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="지체장애">지체장애</SelectItem>
                      <SelectItem value="시각장애">시각장애</SelectItem>
                      <SelectItem value="청각장애">청각장애</SelectItem>
                      <SelectItem value="언어장애">언어장애</SelectItem>
                      <SelectItem value="지적장애">지적장애</SelectItem>
                      <SelectItem value="자폐성장애">자폐성장애</SelectItem>
                      <SelectItem value="정신장애">정신장애</SelectItem>
                      <SelectItem value="신장장애">신장장애</SelectItem>
                      <SelectItem value="심장장애">심장장애</SelectItem>
                      <SelectItem value="호흡기장애">호흡기장애</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      onChange={(e) =>
                        handleFileChange(e, "disabilityDocument")
                      }
                      className="hidden"
                      id="disabilityDocument"
                    />
                    <Label
                      htmlFor="disabilityDocument"
                      className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4" />
                      증빙서류 첨부
                    </Label>
                    {formData.disabilityDocument && (
                      <span className="text-sm text-gray-600">
                        {formData.disabilityDocument.name}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Vulnerable status */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isVulnerable"
                  checked={formData.isVulnerable}
                  onCheckedChange={() => handleCheckboxChange("isVulnerable")}
                />
                <Label
                  htmlFor="isVulnerable"
                  className="flex items-center gap-1"
                >
                  <HandHeart className="w-4 h-4" />
                  취약계층 여부
                </Label>
              </div>
              {formData.isVulnerable && (
                <div className="mt-2 space-y-2">
                  <Select
                    value={formData.vulnerableType}
                    onValueChange={(value) =>
                      handleSelectChange("vulnerableType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="취약계층 종류 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="기초생활수급자">
                        기초생활수급자
                      </SelectItem>
                      <SelectItem value="차상위계층">차상위계층</SelectItem>
                      <SelectItem value="한부모가족">한부모가족</SelectItem>
                      <SelectItem value="북한이탈주민">북한이탈주민</SelectItem>
                      <SelectItem value="결혼이민자">결혼이민자</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      onChange={(e) =>
                        handleFileChange(e, "vulnerableDocument")
                      }
                      className="hidden"
                      id="vulnerableDocument"
                    />
                    <Label
                      htmlFor="vulnerableDocument"
                      className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4" />
                      증빙서류 첨부
                    </Label>
                    {formData.vulnerableDocument && (
                      <span className="text-sm text-gray-600">
                        {formData.vulnerableDocument.name}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  불러오는 중...
                </>
              ) : (
                '다음'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
