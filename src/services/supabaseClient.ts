import { createClient } from "@supabase/supabase-js";
import { EducationProgram, SeniorJob } from "@/types/job";

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Seoul Open API key
export const SEOUL_API_KEY = "43667249786d79653839584d757553";

// Function to get the Seoul API key
export const getSeoulApiKey = async () => {
  return SEOUL_API_KEY;
};

// 시니어 특화일자리
export const getSeniorHireJobs = async () => {
  const { data, error } = await supabase.from("TB_SENIOR_HIRE").select("*");

  if (error) {
    console.error("❌ 시니어 공고 불러오기 실패:", error.message);
    throw error;
  }

  return data;
};

const getDdayFromDate = (dateStr?: string): string => {
  if (!dateStr) return "확인 필요";
  const today = new Date();
  const deadline = new Date(dateStr);
  const diff = Math.floor(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff > 0 ? `D-${diff}` : diff === 0 ? "D-DAY" : "마감";
};

// TB_JOBS table functions
export interface JobDBEntry {
  id?: number;
  regist_no?: number;
  company_name?: string;
  job_title?: string;
  summary?: string;
  job_type_code?: string;
  job_type_name?: string;
  number_of_openings?: number;
  education_code?: string;
  education_name?: string;
  employment_type_code?: string;
  employment_type_name?: string;
  work_location?: string;
  subway_nearby?: string;
  job_description?: string;
  career_code?: string;
  career_name?: string;
  salary?: string;
  holiday?: string;
  work_hours_per_week?: number;
  insurance?: string;
  closing_date?: string;
  apply_method?: string;
  documents_required?: string;
  contact_name?: string;
  contact_phone?: string;
  institution?: string;
  company_address?: string;
  registration_date?: string;
}

// Function to fetch jobs from TB_JOBS table
export const fetchJobsFromDB = async () => {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("TB_JOBS")
    .select("*")
    .gte("receipt_close", today)
    .order("receipt_close", { ascending: true});

  if (error) {
    console.error("Error fetching jobs from database:", error);
    return null;
  }

  return data;
};

// Function to insert job data into TB_JOBS
export const insertJobToDB = async (job: JobDBEntry) => {
  const { data, error } = await supabase.from("TB_JOBS").insert([job]);

  if (error) {
    console.error("Error inserting job to database:", error);
    return null;
  }

  return data;
};

// Function to sync Seoul API jobs with Supabase
export const syncSeoulJobs = async (jobs: any[]) => {
  if (!jobs || jobs.length === 0) return;

  const jobEntries = jobs.map((job) => ({
    regist_no: parseInt(job.JO_REGIST_NO),
    company_name: job.CMPNY_NM,
    job_title: job.JO_SJ,
    work_location: job.BSSH_ADRES,
    number_of_openings: parseInt(job.RCRIT_NMPR) || 0,
    education_name: job.ACDMCR_CMMN,
    employment_type_name: job.EMPLYM_STLE,
    salary: job.WORK_PARAR,
    closing_date:
      job.RCEPT_CLOS_NM === "접수마감일까지" ? null : job.RCEPT_CLOS_NM,
    job_description: `모집인원: ${job.RCRIT_NMPR}\n학력: ${job.ACDMCR_CMMN}\n고용형태: ${job.EMPLYM_STLE}\n임금: ${job.WORK_PARAR}`,
    registration_date: new Date().toISOString().split("T")[0],
  }));

  for (const jobEntry of jobEntries) {
    // Check if job already exists
    const { data: existingJobs } = await supabase
      .from("TB_JOBS")
      .select("id")
      .eq("regist_no", jobEntry.regist_no);

    // Only insert if job doesn't exist
    if (!existingJobs || existingJobs.length === 0) {
      await insertJobToDB(jobEntry);
    }
  }
};

export default supabase;
