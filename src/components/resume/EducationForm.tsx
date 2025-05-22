
import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

// This is a component that hasn't been modified yet, just adding console.log to debug
export const EducationForm = ({ formData, handleChange, handleSelectChange, handlePrevious, handleNext }) => {
  // Add debug logging
  console.log('Education form data:', formData);
  
  // Create arrays for years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());

  return (
    <Card>
      <CardContent className="pt-6">
        <form className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">학력 사항을 입력하세요</h2>
          
          {/* 최종학력 선택 */}
          <div className="space-y-2">
            <Label htmlFor="highestEducation">최종학력</Label>
            <Select 
              value={formData.highestEducation} 
              onValueChange={(value) => handleSelectChange('highestEducation', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="최종학력을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="해당없음">해당없음</SelectItem>
                <SelectItem value="대학원">대학원</SelectItem>
                <SelectItem value="대학교">대학교</SelectItem>
                <SelectItem value="전문대">전문대학교(3년제 이하)</SelectItem>
                <SelectItem value="고등학교">고등학교</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 고등학교 정보 */}
          {formData.highestEducation !== "해당없음" && (
            <div className="p-4 border rounded-md space-y-4">
              <h3 className="font-medium">고등학교</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="highSchool">학교명</Label>
                  <Input
                    id="highSchool"
                    name="highSchool"
                    value={formData.highSchool || ''}
                    onChange={handleChange}
                    placeholder="학교명을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="highSchoolGradYear">졸업년도</Label>
                  <Select 
                    value={formData.highSchoolGradYear || ''} 
                    onValueChange={(value) => handleSelectChange('highSchoolGradYear', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="졸업년도" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="highSchoolAdmsYear">입학년도</Label>
                  <Select 
                    value={formData.highSchoolAdmsYear || ''} 
                    onValueChange={(value) => handleSelectChange('highSchoolAdmsYear', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="입학년도" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* 전문대 정보 - 이름 변경: 대학교(3년제 이하) */}
          {['전문대', '대학교', '대학원'].includes(formData.highestEducation) && (
            <div className="p-4 border rounded-md space-y-4">
              <h3 className="font-medium">전문대학교(3년제 이하)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="college">학교명</Label>
                  <Input
                    id="college"
                    name="college"
                    value={formData.college || ''}
                    onChange={handleChange}
                    placeholder="학교명을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="collegeMajor">전공</Label>
                  <Input
                    id="collegeMajor"
                    name="collegeMajor"
                    value={formData.collegeMajor || ''}
                    onChange={handleChange}
                    placeholder="전공을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="collegeGradYear">졸업년도</Label>
                  <Select 
                    value={formData.collegeGradYear || ''} 
                    onValueChange={(value) => handleSelectChange('collegeGradYear', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="졸업년도" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="collegeAdmsYear">입학년도</Label>
                  <Select 
                    value={formData.collegeAdmsYear || ''} 
                    onValueChange={(value) => handleSelectChange('collegeAdmsYear', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="입학년도" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* 대학교 정보 */}
          {['대학교', '대학원'].includes(formData.highestEducation) && (
            <div className="p-4 border rounded-md space-y-4">
              <h3 className="font-medium">대학교</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="university">학교명</Label>
                  <Input
                    id="university"
                    name="university"
                    value={formData.university || ''}
                    onChange={handleChange}
                    placeholder="학교명을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="universityMajor">전공</Label>
                  <Input
                    id="universityMajor"
                    name="universityMajor"
                    value={formData.universityMajor || ''}
                    onChange={handleChange}
                    placeholder="전공을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="universityGradYear">졸업년도</Label>
                  <Select 
                    value={formData.universityGradYear || ''} 
                    onValueChange={(value) => handleSelectChange('universityGradYear', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="졸업년도" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="universityAdmsYear">입학년도</Label>
                  <Select 
                    value={formData.universityAdmsYear || ''} 
                    onValueChange={(value) => handleSelectChange('universityAdmsYear', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="입학년도" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* 대학원 정보 */}
          {formData.highestEducation === '대학원' && (
            <div className="p-4 border rounded-md space-y-4">
              <h3 className="font-medium">대학원</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gradSchool">학교명</Label>
                  <Input
                    id="gradSchool"
                    name="gradSchool"
                    value={formData.gradSchool || ''}
                    onChange={handleChange}
                    placeholder="학교명을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="gradSchoolMajor">전공</Label>
                  <Input
                    id="gradSchoolMajor"
                    name="gradSchoolMajor"
                    value={formData.gradSchoolMajor || ''}
                    onChange={handleChange}
                    placeholder="전공을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="gradSchoolGradYear">졸업년도</Label>
                  <Select 
                    value={formData.gradSchoolGradYear || ''} 
                    onValueChange={(value) => handleSelectChange('gradSchoolGradYear', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="졸업년도" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="gradSchoolAdmsYear">입학년도</Label>
                  <Select 
                    value={formData.gradSchoolAdmsYear || ''} 
                    onValueChange={(value) => handleSelectChange('gradSchoolAdmsYear', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="입학년도" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button type="button" variant="outline" onClick={handlePrevious}>
              이전
            </Button>
            <Button type="button" onClick={handleNext}>
              다음
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EducationForm;
