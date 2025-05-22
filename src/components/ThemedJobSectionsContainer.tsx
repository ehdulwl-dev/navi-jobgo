
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ThematicJobSection } from './ThematicJobSection';
import {
  getEducationData,
  getJobsByGu,
  getSeniorHireJobs,
  getPartTimeJobs,
} from "../services/jobs/fetchService";
import { convertSeniorJobToJob } from "../utils/convertSeniorJob";
import { Job, SeniorJob } from "../types/job";
import { getDdayStatus, sortJobsByDeadline } from '../utils/jobDateUtils';

interface ThemedJobSectionsContainerProps {
  preferredGu: string | null;
}

const ThemedJobSectionsContainer: React.FC<ThemedJobSectionsContainerProps> = ({ preferredGu }) => {
  // 교육 프로그램
  const { data: educationPrograms = [], isLoading: isEducationLoading } =
    useQuery({
      queryKey: ["educationPrograms"],
      queryFn: getEducationData,
    });

  // 시니어 맞춤 일자리
  const { data: seniorRawJobs = [], isLoading: isSeniorLoading } = useQuery<
    SeniorJob[]
  >({
    queryKey: ["seniorHireJobs"],
    queryFn: getSeniorHireJobs,
  });

  const seniorJobs = seniorRawJobs.map(convertSeniorJobToJob).slice(0, 2);

  // 파트타임
  const { data: partTimeRaw = [], isLoading: isPartTimeLoading } = useQuery({
    queryKey: ["partTimeJobs"],
    queryFn: getPartTimeJobs,
  });

  // 집 근처 일자리
  const { data: nearbyJobsData = [], isLoading: isNearbyLoading } = useQuery({
    queryKey: ["nearbyJobs", preferredGu],
    queryFn: () => getJobsByGu(preferredGu || ""),
    enabled: !!preferredGu,
  });

  return (
    <>
      <h2 className="self-start mt-12 text-2xl font-bold text-zinc-900 max-md:mt-10 max-md:ml-1">
        테마별 일자리 정보
      </h2>
      <p className="self-start mt-2 text-base text-gray-600 max-md:ml-1">
        관심있는 분야의 일자리 정보를 확인하세요.
      </p>

      <ThematicJobSection
        icon="🔍"
        title="시니어 맞춤 일자리"
        bgColor="bg-sky-100"
        linkToMore="/jobs/senior"
        jobs={seniorJobs}
      />

      {preferredGu && (
        <ThematicJobSection
          icon="🏠"
          title="집과 가까운 모집 공고"
          bgColor="bg-green-50"
          linkToMore="/jobs/nearby"
          jobs={
            isNearbyLoading
              ? []
              : sortJobsByDeadline(nearbyJobsData.map((job) => ({
                  id: job.id, // 실제 job.id 사용
                  title: job.title,
                  company: job.company,
                  deadline: job.receipt_close,
                  dDay: getDdayStatus(job.receipt_close),
                }))).slice(0, 2)
          }
        />
      )}

      <ThematicJobSection
        icon="⏰"
        title="파트 타임 모집 공고"
        bgColor="bg-orange-50"
        linkToMore="/jobs/part-time"
        jobs={
          isPartTimeLoading
            ? []
            : sortJobsByDeadline(partTimeRaw.map((job) => ({
                id: job.id, // 실제 job.id 사용
                title: job.title,
                company: job.company,
                deadline: job.receipt_close,
                dDay: getDdayStatus(job.receipt_close),
              }))).slice(0, 2)
        }
      />

      <ThematicJobSection
        icon="📚"
        title="취업 준비 교육 정보"
        bgColor="bg-pink-50"
        linkToMore="/education"
        hideFavorite={true}
        jobs={
          isEducationLoading
            ? []
            : sortJobsByDeadline(educationPrograms.map((program) => {
                const dDay = getDdayStatus(program.edc_end_de_dt);
                return {
                  id: program.id ?? "", // 실제 program.id 사용
                  title: program.edc_nm || "무제",
                  company: program.provider || "",
                  deadline: program.edc_end_de_dt || "미정",
                  dDay: dDay,
                };
              })).slice(0, 2)
        }
      />
    </>
  );
};

export default ThemedJobSectionsContainer;
