
import React from "react";
import { Job } from "../types/job";
import JobCard from "./JobCard";

interface JobCardListProps {
  jobs: Job[];
  onJobCardClick: (jobId: string | number) => void;
  isLoading: boolean;
  showMatchScores?: boolean; // New prop to control match score visibility
}

const JobCardList: React.FC<JobCardListProps> = ({
  jobs,
  onJobCardClick,
  isLoading,
  showMatchScores = false, // Default to not showing match scores
}) => {
  if (isLoading) {
    return <p>로딩 중...</p>;
  }

  const sortedJobs = [...jobs].sort((a, b) => {
    const dateA = a.regDate ? new Date(a.regDate).getTime() : 0;
    const dateB = b.regDate ? new Date(b.regDate).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="space-y-4">
      {sortedJobs.length > 0 ? (
        sortedJobs.map((job) => (
          <JobCard
            key={job.id}
            id={job.id}
            title={job.title}
            company={job.company}
            category={job.category}
            highlight={job.highlight}
            deadline={job.deadline}
            isFavorite={job.isFavorite}
            onClick={() => onJobCardClick(job.id)}
            showMatchScore={showMatchScores} // Pass the prop to each JobCard
          />
        ))
      ) : (
        <p className="text-center text-gray-500 py-4">공고가 없습니다.</p>
      )}
    </div>
  );
};

export default JobCardList;
