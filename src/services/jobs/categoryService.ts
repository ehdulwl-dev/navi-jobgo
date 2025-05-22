
import { Job } from "@/types/job";
import { fetchJobs } from "./fetchService";
import { getFavoriteJobIds } from "./favoriteService";

// Get jobs by type (part-time, nearby, etc.)
export const getJobsByType = async (type: string): Promise<Job[]> => {
  const allJobs = await fetchJobs();

  switch (type) {
    case "part-time":
      return allJobs.filter((job) => job.employment_type?.includes("시간제"));
    case "nearby":
      return allJobs.filter((job) => job.location?.includes("서울"));
    default:
      return allJobs;
  }
};

// Get recommendations for a user
export const getRecommendedJobs = async (userId: number): Promise<Job[]> => {
  const allJobs = await fetchJobs();
  return allJobs.slice(0, 3);
};

// Fetch jobs by category
export const fetchJobsByCategory = async (category: string): Promise<Job[]> => {
  try {
    const allJobs = await fetchJobs();
    if (category === "all") {
      return allJobs;
    }
    return allJobs.filter(
      (job) => job.category === category || job.employmentType === category
    );
  } catch (error) {
    console.error("Error fetching jobs by category:", error);
    return [];
  }
};

// Get only favorite jobs (client-side filtering)
export const getFavoriteJobs = async (): Promise<Job[]> => {
  console.log("getFavoriteJobs: Fetching favorite jobs");
  const allJobs = await fetchJobs();
  const favIds = getFavoriteJobIds();
  console.log("getFavoriteJobs: Current favorite IDs:", favIds);
  return allJobs
    .filter((job) => favIds.includes(job.id.toString()))
    .map((job) => ({
      ...job,
      isFavorite: true,
    }));
};
