
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Job } from '@/types/job';
import { useUser } from '@/contexts/UserContext';
import { fetchJobs } from '@/services/jobService';
import JobCard from './JobCard';
import { supabase } from '@/integrations/supabase/client';

interface PersonalizedJobRecommendationsProps {
  displayName: string | null;
  onJobCardClick: (jobId: string | number) => void;
}

interface UserPreferences {
  preferjob: string | null;
  preferlocate: string | null;
  prefertime: string | null;
}

const PersonalizedJobRecommendations: React.FC<PersonalizedJobRecommendationsProps> = ({ 
  displayName, 
  onJobCardClick 
}) => {
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useUser();
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    preferjob: null,
    preferlocate: null,
    prefertime: null
  });

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user?.email) return;
      
      try {
        const { data, error } = await supabase
          .from('TB_USER')
          .select('preferjob, preferlocate, prefertime')
          .eq('email', user.email)
          .single();
        
        if (error) {
          console.error('Error fetching user preferences:', error);
          return;
        }
        
        if (data) {
          setUserPreferences({
            preferjob: data.preferjob,
            preferlocate: data.preferlocate,
            prefertime: data.prefertime
          });
        }
      } catch (error) {
        console.error('Error in fetchUserPreferences:', error);
      }
    };

    fetchUserPreferences();
  }, [user?.email]);

  useEffect(() => {
    const getRecommendedJobs = async () => {
      setIsLoading(true);
      try {
        // Fetch all jobs
        const allJobs = await fetchJobs();
        
        // Sort jobs by relevance - first by job title/description match, then by location
        const jobsByRelevance = [...allJobs].sort((a, b) => {
          // Check if job matches preferred job title/description
          const aMatchesJobTitle = userPreferences.preferjob && 
            (a.title?.toLowerCase().includes(userPreferences.preferjob.toLowerCase()) || 
             a.description?.toLowerCase().includes(userPreferences.preferjob.toLowerCase()));
            
          const bMatchesJobTitle = userPreferences.preferjob && 
            (b.title?.toLowerCase().includes(userPreferences.preferjob.toLowerCase()) || 
             b.description?.toLowerCase().includes(userPreferences.preferjob.toLowerCase()));
          
          // Check if job matches preferred location
          const aMatchesLocation = userPreferences.preferlocate && 
            a.location?.includes(userPreferences.preferlocate);
            
          const bMatchesLocation = userPreferences.preferlocate && 
            b.location?.includes(userPreferences.preferlocate);
          
          // Prioritize matches: both matches > job match > location match > no match
          if (aMatchesJobTitle && aMatchesLocation) {
            if (bMatchesJobTitle && bMatchesLocation) return 0;
            return -1;
          }
          
          if (bMatchesJobTitle && bMatchesLocation) return 1;
          
          if (aMatchesJobTitle) {
            if (bMatchesJobTitle) return 0;
            return -1;
          }
          
          if (bMatchesJobTitle) return 1;
          
          if (aMatchesLocation) {
            if (bMatchesLocation) return 0;
            return -1;
          }
          
          if (bMatchesLocation) return 1;
          
          return 0;
        });
        
        // Always show exactly 2 jobs
        setRecommendedJobs(jobsByRelevance.slice(0, 2));
      } catch (error) {
        console.error('Error fetching recommended jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Always fetch jobs regardless of preferences
    getRecommendedJobs();
  }, [userPreferences]);

  if (!displayName) return null;

  return (
    <>
      <h1 className="text-2xl text-gray-800 font-bold leading-10 mt-8">
        {displayName}님을 위한<br />
        추천 구직 공고
      </h1>
      <p className="text-base text-gray-600 leading-8 mt-2">
        내 이력과 적합한 공고를 확인해보세요.
      </p>

      {isLoading ? (
        <div className="mt-4 text-center">불러오는 중...</div>
      ) : recommendedJobs.length > 0 ? (
        <div className="mt-4 space-y-4">
          {recommendedJobs.map((job) => (
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
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 p-4 bg-gray-100 rounded-xl text-center">
          <p>추천 구직 정보를 불러올 수 없습니다.</p>
          <p className="text-sm text-gray-500 mt-2">
            내 프로필에서 희망 정보를 업데이트해보세요.
          </p>
        </div>
      )}
    </>
  );
};

export default PersonalizedJobRecommendations;
