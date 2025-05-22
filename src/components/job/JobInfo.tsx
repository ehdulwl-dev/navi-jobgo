
import React from "react";
import { Job } from "../../types/job";

interface JobInfoProps {
  job: Job;
}

const JobInfo: React.FC<JobInfoProps> = ({ job }) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
      <div className="space-y-6">
        <div className="border-b pb-4">
          <div className="flex items-start gap-2 mb-4">
            <img
              src={
                job.companyLogo ||
                "/lovable-uploads/0e956dd8-196b-4a92-9db1-39d0d2144f98.png"
              }
              alt={job.company}
              className="w-12 h-12 rounded-lg"
            />
            <div>
              <h1 className="text-xl font-bold">{job.title}</h1>
              <p className="text-gray-600">{job.company}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">경력</p>
              <p>{job.career_required || "무관"}</p>
            </div>
            <div>
              <p className="text-gray-500">급여</p>
              <p>{job.wage || "협의 후 결정"}</p>
            </div>
            <div>
              <p className="text-gray-500">학력</p>
              <p>{job.education_required || "무관"}</p>
            </div>
            <div>
              <p className="text-gray-500">근무지역</p>
              <p>{job.location || "미정"}</p>
            </div>
            <div>
              <p className="text-gray-500">근무형태</p>
              <p>{job.employment_type || "미정"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobInfo;
