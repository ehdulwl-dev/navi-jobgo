
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getSeniorHireJobs } from "@/services/jobs/fetchService";
import JobCard from "@/components/JobCard";
import BottomNavigation from "@/components/BottomNavigation";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Job, SeniorJob } from "../types/job";
import { convertSeniorJobToJob } from "@/utils/convertSeniorJob";

const SeniorHireJobs = () => {
  const { data: rawJobs = [], isLoading } = useQuery({
    queryKey: ["seniorHireJobsPage"],
    queryFn: getSeniorHireJobs,
  });

  // Store both the raw senior jobs and the converted jobs
  const seniorJobs: SeniorJob[] = rawJobs;
  const jobs: Job[] = rawJobs.map(convertSeniorJobToJob);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white py-4 px-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center">
          <Link to="/index" className="mr-4">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold">시니어 맞춤 일자리</h1>
        </div>
      </header>

      <main className="px-4 py-6">
        {isLoading ? (
          <p className="text-center py-4">로딩 중...</p>
        ) : jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job, i) => {
              // Use the original seniorJob data for properties not in the Job type
              const seniorJob = seniorJobs[i];
              
              return (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  company={job.company}
                  location={seniorJob.location ?? "-"}
                  category={seniorJob.qualification ?? ""}
                  highlight={seniorJob.salary ?? ""}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-center py-4">공고가 없습니다.</p>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default SeniorHireJobs;
