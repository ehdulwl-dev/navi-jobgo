import logo from "@/assets/logo/logo_land_eng.png";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BottomNavigation from "../components/BottomNavigation";
import JobCard from "../components/JobCard";
import JobFilters from "../components/JobFilters";
import RecommendedJobsSection from "../components/RecommendedJobsSection";
import { fetchJobs } from "../services/jobService";
import SearchBar from "../components/SearchBar";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import LoginBanner from "@/components/LoginBanner";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const initialTab = location.state?.activeTab || "recommended";
  const [activeTab, setActiveTab] = useState<"recommended" | "all">(initialTab);
  const [userName, setUserName] = useState("");

  const [filters, setFilters] = useState<{
    jobType: string[];
    region: string[];
  }>({
    jobType: [],
    region: [],
  });

  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: jobs = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  });

  useEffect(() => {
    if (user) {
      setUserName(user.name || "");
    }

    const handleFavoritesUpdated = () => {
      console.log("[Index] favoritesUpdated event received, refreshing data");
      refetch();
    };

    window.addEventListener("favoritesUpdated", handleFavoritesUpdated);

    return () => {
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdated);
    };
  }, [refetch, user]);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const handleJobCardClick = (jobId: string | number) => {
    navigate(`/job/${jobId}`);
  };

  const handleFavoriteToggle = (jobId: string | number, isFavorite: boolean) => {
    console.log(`[Index] Job ${jobId} favorite toggled to ${isFavorite}`);
    
    // Force data refresh through React Query
    queryClient.invalidateQueries({ queryKey: ["jobs"] });
  };

  const handleFilterChange = (
    filterType: "jobType" | "region",
    value: string[]
  ) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveTab("all"); // Switch to "all" tab when searching
    toast.success(`"${query}" 검색 결과를 표시합니다`);
  };

  // Filter jobs based on both search query and selected filters
  const filteredJobs = jobs.filter((job) => {
    // Check if job matches filters
    const matchesFilters =
      (filters.jobType.length === 0 ||
        filters.jobType.includes(job.category)) &&
      (filters.region.length === 0 ||
        (job.location && filters.region.some((r) => job.location.includes(r))));

    // Check if job matches search query
    const matchesSearch =
      searchQuery === "" ||
      (job.title &&
        job.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.company &&
        job.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.location &&
        job.location.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilters && matchesSearch;
  });

  const TabButton = ({
    label,
    active,
    onClick,
    iconActive,
    iconInactive,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
    iconActive: string;
    iconInactive: string;
  }) => (
    <button
      onClick={onClick}
      className={`flex flex-1 h-10 px-3 py-1 items-center gap-2 justify-start rounded-full text-lg md:text-base font-bold overflow-hidden ${
        active
          ? "bg-app-blue text-white"
          : "bg-white text-gray-600 border-2 border-gray-300"
      }`}
    >
      <img
        src={active ? iconActive : iconInactive}
        className="w-5 h-5 object-contain"
      />
      <span className="self-stretch my-auto whitespace-nowrap truncate">
        {label}
      </span>
    </button>
  );

  return (
    <div className="bg-white min-h-screen">
      <header className="pt-5 px-5">
        <div className="flex justify-center">
          <a>
            <img
              src={logo}
              className="h-auto object-contain"
              style={{ width: '10rem' }}
              alt="Logo"
            />
          </a>
        </div>

        <div className="mt-6">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="flex mt-6 w-full gap-3 mb-1">
          <TabButton
            label="추천 구직 공고"
            active={activeTab === "recommended"}
            onClick={() => setActiveTab("recommended")}
            iconActive="/buttons/recommend.svg"
            iconInactive="/buttons/recommend-active.svg"
          />
          <TabButton
            label="전체 구직 공고"
            active={activeTab === "all"}
            onClick={() => setActiveTab("all")}
            iconActive="/buttons/building.svg"
            iconInactive="/buttons/building-active.svg"
          />
        </div>

        {/* Only show LoginBanner when on "recommended" tab and user is not logged in */}
        {!user && activeTab === "recommended" && <LoginBanner />}
      </header>

      <main className="px-4 pb-20">
        {activeTab === "recommended" && (
          <>
            <RecommendedJobsSection
              onJobCardClick={handleJobCardClick}
              userName={userName}
              isLoggedIn={!!user}
            />
          </>
        )}

        {activeTab === "all" && (
          <div className="mb-6">
            <JobFilters onFilterChange={handleFilterChange} />
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-4">
              이 공고, 놓치지 마세요!
            </h2>
            <div className="mt-4 space-y-4">
              {isLoading && <div>로딩중...</div>}
              {!isLoading && filteredJobs.length === 0 && (
                <div className="text-center text-gray-500">
                  {searchQuery
                    ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
                    : "표시할 공고가 없습니다."}
                </div>
              )}
              {!isLoading &&
                filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    {...job}
                    onClick={() => handleJobCardClick(job.id)}
                    onFavoriteClick={handleFavoriteToggle}
                  />
                ))}
            </div>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Index;
