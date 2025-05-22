
import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Job } from "../types/job";
import { Button } from "@/components/ui/button";
import BottomNavigation from "../components/BottomNavigation";
import { getFavoriteJobs, toggleFavoriteJob } from "../services/jobService";
import { getJobMatchScore } from "../services/jobs/favoriteService";
import Header from "@/components/Header";
import { toast } from "sonner";

const Favorites = () => {
  const [favoriteJobs, setFavoriteJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/", { state: { activeTab: "all" } });
  };

  // 관심공고 불러오기
  const loadFavoriteJobs = async () => {
    try {
      setLoading(true);
      const favorites = await getFavoriteJobs();
      console.log("Loaded favorite jobs:", favorites.length);
      setFavoriteJobs(favorites);
    } catch (error) {
      console.error("Failed to load favorite jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    loadFavoriteJobs();

    // 리스트 동기화 (별 클릭시 이벤트)
    const handleFavoritesUpdated = (event: Event) => {
      console.log("Favorites tab: favoritesUpdated event received");
      
      const detail = (event as CustomEvent)?.detail;
      const jobId = detail?.jobId;
      const isFavorite = detail?.isFavorite;
      
      // Refresh the data - either reload or update the state directly
      loadFavoriteJobs();
      
      // Show toast notification only if toggled from this screen
      // to avoid duplicate toasts with JobCard
      const fromThisScreen = event.target === window;
      if (fromThisScreen) {
        if (isFavorite) {
          toast.success("관심 공고에 추가되었습니다");
        } else if (isFavorite === false) {
          toast.info("관심 공고에서 제거되었습니다");
        }
      }
    };

    // Listen for analysis completion to update scores
    const handleAnalysisCompleted = (event: Event) => {
      console.log("Analysis completed event received, refreshing job list");
      const { jobId } = (event as CustomEvent).detail;
      
      if (jobId) {
        // If we know which job was analyzed, we could update just that job
        // but for simplicity, we'll refresh all jobs
        loadFavoriteJobs();
      }
    };

    // Global event listeners
    window.addEventListener("favoritesUpdated", handleFavoritesUpdated);
    window.addEventListener("jobAnalysisCompleted", handleAnalysisCompleted);

    return () => {
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdated);
      window.removeEventListener("jobAnalysisCompleted", handleAnalysisCompleted);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadFavoriteJobs();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleToggleFavorite = async (
    jobId: string | number,
    isFavorite: boolean
  ) => {
    try {
      await toggleFavoriteJob(jobId);
      // No need to manually reload, the event listener will handle it
    } catch (error) {
      console.error("관심 공고 토글 실패:", error);
      toast.error("관심 공고 상태 변경 중 오류가 발생했습니다");
      // Force refresh in case of error
      loadFavoriteJobs();
    }
  };

  const handleJobClick = (jobId: string | number) => {
    // Navigate to job detail page with info tab selected by default
    navigate(`/job/${jobId}`, {
      state: { 
        fromFavorites: true,
        activeTab: "info" // Changed from "analysis" to "info" to show info tab by default
      }
    });
  };

  const filteredJobs = searchQuery
    ? favoriteJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (job.location &&
            job.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (job.category &&
            job.category.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : favoriteJobs;

  // Function to get match score for a job
  const getMatchScoreDisplay = (jobId: string | number): string => {
    const score = getJobMatchScore(jobId);
    return score !== null ? `매칭점수 ${Math.round(score)}점` : "매칭점수 준비중";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="관심 공고" />

      <main className="px-4 py-2">
        {loading ? (
          <div className="text-center py-10">
            <p>데이터를 불러오는 중...</p>
          </div>
        ) : favoriteJobs.length > 0 ? (
          <div>
            {filteredJobs.map((job) => (
              <div key={job.id} className="mb-3 relative">
                <div 
                  className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow p-3 pl-12"
                  onClick={() => handleJobClick(job.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {job.title.length > 13
                          ? `${job.title.slice(0, 13)}...`
                          : job.title}
                      </h3>
                      <p className="text-gray-600 text-sm">{job.company}</p>
                    </div>
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-sm font-medium whitespace-nowrap">
                      {getMatchScoreDisplay(job.id)}
                    </div>
                  </div>
                </div>
                <button
                  className="absolute top-1/2 -translate-y-1/2 left-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(job.id, true);
                  }}
                  aria-label="관심 공고에서 제거"
                >
                  <Star
                    size={24}
                    className={cn(
                      "transition-colors",
                      "fill-yellow-400 text-yellow-400"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">저장된 관심 공고가 없습니다.</p>
            <p className="text-gray-500 mt-2">
              홈 또는 지원소개서 페이지에서 별표 아이콘을 클릭하여 관심 공고로
              등록해보세요.
            </p>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Favorites;
