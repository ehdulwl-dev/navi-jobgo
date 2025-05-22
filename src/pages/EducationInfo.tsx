import React from "react";
import { ArrowLeft, School } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getEducationData } from "../services/jobService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import BottomNavigation from "../components/BottomNavigation";
import { EducationProgram } from "@/types/job";
import Header from "@/components/Header";

const EducationInfo = () => {
  const { data: educationPrograms, isLoading } = useQuery<EducationProgram[]>({
    queryKey: ["education"],
    queryFn: () => getEducationData(),
  });

  const cn = (...classes: (string | boolean | null | undefined)[]) =>
    classes.filter(Boolean).join(" ");

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="취업 준비 교육 정보" />

      {/* Main Content */}
      <main className="px-4 py-6">
        {isLoading ? (
          <p className="text-center py-4">로딩 중...</p>
        ) : educationPrograms && educationPrograms.length > 0 ? (
          <div className="space-y-4">
            
            {educationPrograms.map((program) => (
              <Card
                key={program.id}
                className={cn(
                  "transition-shadow",
                  program.sttus_nm.includes("마감") && "bg-red-50",
                  program.sttus_nm.includes("모집") && "bg-blue-50"
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 flex-shrink-0 mt-1.5">
                      <School className="text-app-blue w-full h-full" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold leading-snug mb-1">
                        {program.edc_nm}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-500 leading-relaxed">
                        {program.provider}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm leading-relaxed">
                    <div className="mb-1">
                      <p className="font-bold text-gray-700">상태</p>
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          program.sttus_nm.includes("마감")
                            ? "text-red-600"
                            : program.sttus_nm.includes("모집")
                            ? "text-blue-600"
                            : "text-gray-500"
                        )}
                      >
                        {program.sttus_nm}
                      </p>
                    </div>
                    <div className="mb-1">
                      <p className="font-bold text-gray-700">시작일</p>
                      <p>{program.edc_begin_de_dt}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-bold  text-gray-700">종료일</p>
                      <p>{program.edc_end_de_dt}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center py-4">교육 정보가 없습니다.</p>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default EducationInfo;
