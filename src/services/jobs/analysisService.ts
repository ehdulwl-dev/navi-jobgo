import axios from "axios";
import { supabase } from "@/integrations/supabase/client";
import { JobRequirementsAndPreferences } from "./types";
import { toast } from "sonner";

// Cache to track jobs being analyzed to prevent duplicate API calls
const jobsBeingAnalyzed = new Set<string>();
// Cache to store failed job IDs with timestamps to prevent excessive retries
const failedJobs = new Map<string, number>();
// Time (in ms) to wait before allowing retry for a failed job
const RETRY_COOLDOWN = 60000; // 1 minute
// Cache to store successful job analysis results
const jobAnalysisCache = new Map<string, JobRequirementsAndPreferences>();

// Get the job requirements and preferences
export const getJobRequirementsAndPreferences = async (
  jobId: string | number
): Promise<JobRequirementsAndPreferences | null> => {
  try {
    console.log(`Getting requirements for job ${jobId}`);

    // Check if we have a cached result for this job
    if (jobAnalysisCache.has(jobId.toString())) {
      console.log(`Using cached analysis for job ${jobId}`);
      return jobAnalysisCache.get(
        jobId.toString()
      ) as JobRequirementsAndPreferences;
    }

    // Check if this job recently failed and is in cooldown period
    const lastFailTime = failedJobs.get(jobId.toString());
    if (lastFailTime && Date.now() - lastFailTime < RETRY_COOLDOWN) {
      console.log(`Job ${jobId} failed recently, in cooldown period`);
      return {
        requirements: [
          "최근 분석 시도에 실패했습니다. 잠시 후 다시 시도해주세요.",
        ],
        preferences: [
          "최근 분석 시도에 실패했습니다. 잠시 후 다시 시도해주세요.",
        ],
      };
    }

    // If this job is already being analyzed, return a message
    if (jobsBeingAnalyzed.has(jobId.toString())) {
      console.log(`Job ${jobId} is already being analyzed, returning message`);
      return {
        requirements: ["현재 분석이 진행 중입니다. 잠시만 기다려주세요."],
        preferences: ["현재 분석이 진행 중입니다. 잠시만 기다려주세요."],
      };
    }

    // First check if we already have the data in Supabase
    const { data: job, error } = await supabase
      .from("TB_JOBS")
      .select("requirements, preferences")
      .eq("id", jobId.toString())
      .single();

    if (error) {
      console.error("Error fetching job data:", error);
      return null;
    }

    // Log the raw data received from Supabase
    console.log(
      `Raw requirements data from Supabase for job ${jobId}:`,
      job.requirements
    );
    console.log(
      `Raw preferences data from Supabase for job ${jobId}:`,
      job.preferences
    );

    // If we have requirements and preferences data in the database
    if (job.requirements && job.preferences) {
      try {
        // Try to parse if they are JSON strings
        let requirements: string[];
        let preferences: string[];

        // Handle both string and array formats
        if (typeof job.requirements === "string") {
          console.log(`Parsing requirements string for job ${jobId}`);
          requirements = JSON.parse(job.requirements);
          console.log(`Parsed requirements for job ${jobId}:`, requirements);
        } else if (Array.isArray(job.requirements)) {
          requirements = job.requirements;
          console.log(
            `Requirements already an array for job ${jobId}:`,
            requirements
          );
        } else {
          console.error(
            `Invalid requirements format for job ${jobId}:`,
            job.requirements
          );
          throw new Error("Invalid requirements format");
        }

        if (typeof job.preferences === "string") {
          console.log(`Parsing preferences string for job ${jobId}`);
          preferences = JSON.parse(job.preferences);
          console.log(`Parsed preferences for job ${jobId}:`, preferences);
        } else if (Array.isArray(job.preferences)) {
          preferences = job.preferences;
          console.log(
            `Preferences already an array for job ${jobId}:`,
            preferences
          );
        } else {
          console.error(
            `Invalid preferences format for job ${jobId}:`,
            job.preferences
          );
          throw new Error("Invalid preferences format");
        }

        // Validate that we have valid arrays
        if (Array.isArray(requirements) && Array.isArray(preferences)) {
          // Check if these are error messages or valid data
          if (
            requirements.length > 0 &&
            preferences.length > 0 &&
            !requirements.some((r) => r.includes("오류") || r.includes("실패"))
          ) {
            // Cache the successful result
            const result = { requirements, preferences };
            jobAnalysisCache.set(jobId.toString(), result);

            console.log(`Found valid requirements for job ${jobId}:`, result);
            return result;
          } else {
            console.log(
              "Found error messages in cached requirements, will need fresh analysis"
            );
          }
        } else {
          console.log(
            "Parsed data is not valid arrays, will need fresh analysis"
          );
        }
      } catch (parseError) {
        console.error("Error parsing requirements/preferences:", parseError);
      }
    }

    // If we reach here, we need to analyze the job
    console.log(
      `No valid existing requirements found for job ${jobId}, triggering analysis`
    );
    return await analyzeJobRequirements(jobId);
  } catch (error) {
    console.error("Error getting job requirements:", error);
    return {
      requirements: [
        "공고 분석중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      ],
      preferences: ["기술적 문제로 인해 분석이 완료되지 않았습니다."],
    };
  }
};

// Function to analyze job requirements and preferences
export const analyzeJobRequirements = async (
  jobId: string | number
): Promise<JobRequirementsAndPreferences> => {
  // Add to set of jobs being analyzed
  jobsBeingAnalyzed.add(jobId.toString());

  try {
    console.log(`Analyzing requirements for job ${jobId}`);

    // Call the server endpoint to analyze the job
    const response = await axios.post(
      `/api/jobs/analyze/${jobId}`,
      {},
      {
        timeout: 30000, // 30 seconds timeout
      }
    );

    console.log(`Analysis response for job ${jobId}:`, response.data);

    // If the job was previously failed, remove it from failed jobs
    if (failedJobs.has(jobId.toString())) {
      failedJobs.delete(jobId.toString());
    }

    // Process and validate the response
    let requirements: string[] = [];
    let preferences: string[] = [];

    if (response.data) {
      const responseData = response.data as Record<string, unknown>;
      console.log(`Response data type: ${typeof responseData}`);

      // Handle requirements
      if (
        responseData.requirements &&
        Array.isArray(responseData.requirements)
      ) {
        requirements = responseData.requirements as string[];
        console.log(
          `Requirements from API (array): ${requirements.length} items`
        );
      } else if (
        responseData.requirements &&
        typeof responseData.requirements === "string"
      ) {
        try {
          console.log(
            `Requirements from API (string): ${responseData.requirements}`
          );
          requirements = JSON.parse(responseData.requirements as string);
          console.log(`Parsed requirements: ${requirements.length} items`);
        } catch (e) {
          console.error(`Error parsing requirements string: ${e}`);
          requirements = ["응답 형식이 올바르지 않습니다. 다시 시도해주세요."];
        }
      } else {
        console.error(
          `Invalid requirements data: ${responseData.requirements}`
        );
        requirements = ["응답 형식이 올바르지 않습니다. 다시 시도해주세요."];
      }

      // Handle preferences
      if (responseData.preferences && Array.isArray(responseData.preferences)) {
        preferences = responseData.preferences as string[];
        console.log(
          `Preferences from API (array): ${preferences.length} items`
        );
      } else if (
        responseData.preferences &&
        typeof responseData.preferences === "string"
      ) {
        try {
          console.log(
            `Preferences from API (string): ${responseData.preferences}`
          );
          preferences = JSON.parse(responseData.preferences as string);
          console.log(`Parsed preferences: ${preferences.length} items`);
        } catch (e) {
          console.error(`Error parsing preferences string: ${e}`);
          preferences = ["응답 형식이 올바르지 않습니다. 다시 시도해주세요."];
        }
      } else {
        console.error(`Invalid preferences data: ${responseData.preferences}`);
        preferences = ["응답 형식이 올바르지 않습니다. 다시 시도해주세요."];
      }

      // Ensure they're arrays
      if (!Array.isArray(requirements)) {
        console.error("Requirements is not an array after processing");
        requirements = ["데이터 형식 오류가 발생했습니다."];
      }
      if (!Array.isArray(preferences)) {
        console.error("Preferences is not an array after processing");
        preferences = ["데이터 형식 오류가 발생했습니다."];
      }
    } else {
      console.error("Empty response from API");
      requirements = ["응답이 비어있습니다. 다시 시도해주세요."];
      preferences = ["응답이 비어있습니다. 다시 시도해주세요."];
    }

    const result = { requirements, preferences };

    // Cache the successful result
    if (
      requirements.length > 0 &&
      preferences.length > 0 &&
      !requirements.includes(
        "응답 형식이 올바르지 않습니다. 다시 시도해주세요."
      )
    ) {
      jobAnalysisCache.set(jobId.toString(), result);
      console.log(`Cached analysis for job ${jobId}`);
    }

    return result;
  } catch (error) {
    console.error(`Analysis attempt failed:`, error);
    // Record this job as failed with current timestamp
    failedJobs.set(jobId.toString(), Date.now());

    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    console.error(`Error details: ${errorMessage}`);

    // Show toast notification for debugging purposes
    // toast.error(`분석 오류: ${errorMessage.substring(0, 50)}${errorMessage.length > 50 ? '...' : ''}`);

    return {
      requirements: [
        "공고 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      ],
      preferences: ["기술적 문제로 인해 분석이 완료되지 않았습니다."],
    };
  } finally {
    // Remove from set of jobs being analyzed
    jobsBeingAnalyzed.delete(jobId.toString());
  }
};
