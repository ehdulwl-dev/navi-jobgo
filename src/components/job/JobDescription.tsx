
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Job } from "../../types/job";

interface JobDescriptionProps {
  job: Job;
}

const JobDescription: React.FC<JobDescriptionProps> = ({ job }) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
      <main className="px-4 py-6 pb-[50px] space-y-8">
        {/* 공고 내용 */}
        <section>
          <h3 className="text-xl font-bold mb-4">공고 내용</h3>
          <div className="bg-gray-50 p-4 rounded-lg text-base leading-relaxed whitespace-pre-line">
            {job.description || "해당 공고에 대한 상세 설명이 없습니다."}
          </div>
        </section>

        {/* 접수 기간 및 방법 */}
        <section>
          <h3 className="text-xl font-bold mb-4">접수 기간 및 방법</h3>
          <ul className="bg-gray-50 p-4 rounded-lg space-y-2 list-disc pl-5 text-base text-gray-800">
            <li>
              <span className="text-black">접수 기간:</span>{" "}
              {job.receipt_close
                ? `~${new Date(job.receipt_close).toLocaleDateString("ko-KR", {
                    month: "2-digit",
                    day: "2-digit",
                    weekday: "short",
                  })}`
                : "채용 시 마감"}
            </li>
            <li>
              <span className="text-black">접수 방법:</span>{" "}
              {job.receipt_method || "미정"}
            </li>
            <li>
              <span className="text-black">이력서 양식:</span>{" "}
              {job.papers_required || "자유 형식"}
            </li>
            <li>
              <span className="text-black">채용 방식:</span>{" "}
              {job.selection_method || "미정"}
            </li>
          </ul>
        </section>

        {/* 지원 자격 */}
        <section>
          <Separator className="my-6" />
          <h3 className="text-xl font-bold mb-4">지원 자격</h3>
          <ul className="bg-gray-50 p-4 rounded-lg space-y-2 list-disc pl-5 text-base text-gray-800">
            <li>
              <span className="text-black">경력:</span>{" "}
              {job.career_required || "무관"}
            </li>
            <li>
              <span className="text-black">학력:</span>{" "}
              {job.education_required || "무관"}
            </li>
          </ul>
        </section>

        {/* 근무 조건 */}
        <section>
          <Separator className="my-6" />
          <h3 className="text-xl font-bold mb-4">근무 조건</h3>
          <ul className="bg-gray-50 p-4 rounded-lg space-y-2 list-disc pl-5 text-base text-gray-800">
            <li>
              <span className="text-black">근무 시간:</span>{" "}
              {job.work_time || "미정"}
            </li>
            <li>
              <span className="text-black">근무일:</span>{" "}
              {job.holiday || "미정"}
            </li>
            <li>
              <span className="text-black">급여:</span> {job.wage || "미정"}
            </li>
            <li>
              <span className="text-black">근무형태:</span>{" "}
              {job.employment_type || "미정"}
            </li>
            {job.insurance && (
              <li>
                <span className="text-black">4대보험:</span> {job.insurance}
              </li>
            )}
            {job.week_hours && (
              <li>
                <span className="text-black">주 근무시간:</span>{" "}
                {job.week_hours}시간
              </li>
            )}
          </ul>
        </section>

        {/* 문의 사항 */}
        <section>
          <Separator className="my-6" />
          <h3 className="text-xl font-bold mb-4">문의 사항</h3>
          <ul className="bg-gray-50 p-4 rounded-lg space-y-2 list-disc pl-5 text-base text-gray-800">
            <li>
              <span className="text-black">담당자:</span>{" "}
              {job.manager_name || "없음"}
            </li>
            <li>
              <span className="text-black">휴대폰:</span>{" "}
              {job.manage_phone || "없음"}
            </li>
            <li>
              <span className="text-black">이메일/기관:</span>{" "}
              {job.manager_org || "없음"}
            </li>
          </ul>
        </section>

        {/* 추가 정보 */}
        <section>
          <Separator className="my-6" />
          <h3 className="text-xl font-bold mb-4">추가 정보</h3>
          <ul className="bg-gray-50 p-4 rounded-lg space-y-2 list-disc pl-5 text-base text-gray-800">
            <li>
              <span className="text-black">등록일:</span>{" "}
              {job.reg_date || "미정"}
            </li>
            <li>
              <span className="text-black">데이터 출처:</span>{" "}
              {job.api_type || "미정"}
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default JobDescription;
