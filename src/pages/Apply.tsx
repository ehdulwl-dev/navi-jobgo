
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Job } from '../components/JobList';
import JobList from '../components/JobList';
import BottomNavigation from '../components/BottomNavigation';
import { fetchJobs, toggleFavoriteJob } from '../services/jobService';
import { toast } from 'sonner';

const Apply = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        // Try to fetch jobs from Supabase/Seoul API
        const loadedJobs = await fetchJobs();
        setJobs(loadedJobs);
        toast.success("구직정보가 업데이트 되었습니다.");
      } catch (error) {
        console.error('Failed to load jobs:', error);
        toast.error("구직정보 업데이트에 실패했습니다. 로컬 데이터를 사용합니다.");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const handleToggleFavorite = async (jobId: number) => {
    // Modified to manually update the UI state after toggling favorites
    await toggleFavoriteJob(jobId);
    // Refresh jobs to update UI with latest favorite status
    const updatedJobs = await fetchJobs();
    setJobs(updatedJobs);
  };

  const filteredJobs = searchQuery 
    ? jobs.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (job.category && job.category.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : jobs;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white py-4 px-4">
        <div className="flex items-center mb-4">
          <Link to="/" className="mr-4">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold">지원소개서</h1>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="공고 검색 (제목, 기관명, 지역, 분야)"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        {loading ? (
          <div className="text-center py-10">
            <p>데이터를 불러오는 중...</p>
          </div>
        ) : (
          <JobList 
            jobs={filteredJobs} 
            onToggleFavorite={handleToggleFavorite} 
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Apply;
