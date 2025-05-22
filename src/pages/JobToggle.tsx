import React, { useEffect, useState } from 'react';
import JobToggle from '@/components/JobToggle';
import { fetchJobs, getRecommendedJobs } from '@/services/jobService';
import { Job } from '@/types/job';

const JobBoard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recommended' | 'all'>('recommended');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        if (activeTab === 'all') {
          const allJobs = await fetchJobs(); // axios -> /api/jobs
          setJobs(allJobs);
        } else {
          const recommended = await getRecommendedJobs(1); // 사용자 ID 기반 추천
          setJobs(recommended);
        }
      } catch (error) {
        console.error('공고 불러오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [activeTab]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <JobToggle activeTab={activeTab} setActiveTab={setActiveTab} />

      {loading ? (
        <p className="mt-4 text-center">불러오는 중...</p>
      ) : jobs.length === 0 ? (
        <p className="mt-4 text-center">표시할 공고가 없습니다.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {jobs.map((job) => (
            <li key={job.id} className="p-4 border rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold">{job.title}</h3>
              <p className="text-sm text-gray-600">{job.company} · {job.location}</p>
              <p className="text-sm text-gray-500">{job.deadline}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JobBoard;
