
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { JobAnalysisResult } from "./types";
import {
  getJobAnalysisFromCache,
  saveJobAnalysisToCache,
  addJobBeingAnalyzed,
  removeJobBeingAnalyzed,
  isJobBeingAnalyzed,
  addFailedJob,
  hasJobFailedRecently,
  createErrorResult,
  removeFailedJob,
} from "./cacheUtils";
import { openai, getSystemPromptByApiType } from "./openAiClient";
import { getUserResume } from "./resumeService";

// Analyze job posting using OpenAI API
export const analyzeJobDirectly = async (
  jobId: string | number
): Promise<JobAnalysisResult> => {
  // Convert jobId to string to ensure consistent type for caching and lookups
  const jobIdStr = String(jobId);

  // Check if analysis is cached in localStorage
  const cachedAnalysis = getJobAnalysisFromCache(jobIdStr);
  if (cachedAnalysis) {
    console.log(`Using cached analysis from localStorage for job ${jobIdStr}`);
    return cachedAnalysis;
  }

  // Check if this job recently failed and is in cooldown period
  if (hasJobFailedRecently(jobIdStr)) {
    console.log(`Job ${jobIdStr} failed recently, in cooldown period`);
    return createErrorResult(
      "최근 분석 시도에 실패했습니다. 잠시 후 다시 시도해주세요."
    );
  }

  // If this job is already being analyzed, return a message
  if (isJobBeingAnalyzed(jobIdStr)) {
    console.log(`Job ${jobIdStr} is already being analyzed, returning message`);
    return createErrorResult("현재 분석이 진행 중입니다. 잠시만 기다려주세요.");
  }

  // Mark job as being analyzed
  addJobBeingAnalyzed(jobIdStr);

  try {
    console.log(`Fetching job data for analysis: ${jobIdStr}`);

    // Fetch job data from Supabase
    const { data: job, error } = await supabase
      .from("TB_JOBS")
      .select(
        "title, description, api_type, career_required, education_required"
      )
      .eq("id", jobIdStr)
      .maybeSingle();

    if (error) {
      console.error("Error fetching job data:", error);
      throw new Error(`공고 정보 조회 실패: ${error.message}`);
    }

    if (!job) {
      console.error(`Job ${jobIdStr} not found in database`);
      throw new Error("공고 내용이 없습니다.");
    }

    console.log("Job data retrieved:", job.title, "API Type:", job.api_type);

    // Get user resume (if available)
    const resumeText = await getUserResume("current-user");
    console.log("Resume text available:", !!resumeText, "Resume:", resumeText);

    // Build prompt for OpenAI based on api_type
    let userMessage = "";
    const apiType = job.api_type || "seoul"; // Default to seoul if api_type is not specified

    if (apiType === "work24") {
      // For work24, combine career and education requirements
      userMessage = `[경력 조건]\n${
        job.career_required || "경력 정보 없음"
      }\n\n[학력 조건]\n${job.education_required || "학력 정보 없음"}`;
    } else {
      // For seoul (default), use the full job description
      userMessage = `[공고 제목]\n${job.title || "제목 없음"}\n\n[공고 내용]\n${
        job.description || "내용 없음"
      }`;
    }

    if (resumeText) {
      userMessage += `\n\n[사용자 이력서 정보]\n${resumeText}`;
    }

    console.log("Sending request to OpenAI API with API type:", apiType);
    console.log("Using prompt for API type:", apiType);

    console.log("[🧠 System Prompt ↓↓↓↓↓↓]", getSystemPromptByApiType(apiType));
    console.log("[📨 User Prompt ↓↓↓↓↓↓]", userMessage);


    // Call OpenAI API with the appropriate system prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: getSystemPromptByApiType(apiType),
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.5,
      max_tokens: 2000,
      top_p: 1,
      response_format: { type: "json_object" },
    });

    console.log("Received response from OpenAI API");

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("OpenAI API 응답이 비어있습니다.");
    }

    try {
      const parsedResponse = JSON.parse(content);
      console.log("Successfully parsed OpenAI response");

      // Validate the response format
      if (
        !parsedResponse.requirements ||
        !parsedResponse.preferences ||
        !Array.isArray(parsedResponse.requirements.items) ||
        !Array.isArray(parsedResponse.preferences.items)
      ) {
        throw new Error("API 응답 형식이 올바르지 않습니다.");
      }

      // Create result object
      const result: JobAnalysisResult = {
        requirements: parsedResponse.requirements,
        preferences: parsedResponse.preferences,
        apiType: apiType, // Store the API type with the result
      };

      // Cache successful result in localStorage
      saveJobAnalysisToCache(jobIdStr, result);

      // Remove from failed jobs if it was there
      removeFailedJob(jobIdStr);

      return result;
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError, content);
      throw new Error("API 응답 파싱 실패");
    }
  } catch (error) {
    console.error("Analysis failed:", error);
    addFailedJob(jobIdStr);
    toast.error(
      `분석 오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
    );
    return createErrorResult(
      "공고 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    );
  } finally {
    // Remove from set of jobs being analyzed
    removeJobBeingAnalyzed(jobIdStr);
  }
};
