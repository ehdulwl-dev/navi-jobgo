
import axios from "axios";
import { Job, EducationProgram } from "@/types/job";
import { fetchJobsFromDB } from "../supabaseClient";
import { extractGu } from "../../utils/locationUtils";
import { getFavoriteJobIds } from "./favoriteService";
import { supabase } from "@/integrations/supabase/client";
import { SeniorJob } from "@/types/job";


export const getPartTimeJobs = async (): Promise<Job[]> => {
  const today = new Date().toISOString().split("T")[0];
  
  const { data, error } = await supabase
    .from("TB_JOBS")
    .select("*")
    .like("employment_type", "%시간%")
    .gte("receipt_close", today)
    .order("receipt_close", { ascending: true});

  if (error) {
    console.error("❌ 파트타임 공고 불러오기 실패:", error.message);
    return [];
  }

  return data as Job[];
};

export const getSeniorHireJobs = async (): Promise<SeniorJob[]> => {
  const { data, error } = await supabase.from("TB_SENIOR_HIRE").select("*");

  if (error) {
    console.error("❌ 시니어 채용 데이터 조회 실패:", error.message);
    return [];
  }

  return data ?? [];
};

const convertDBJobToJobFormat = (raw: any): Job => {
  const locationMatch = raw.work_location?.match(/서울특별시\s*([^\s]+구)/);
  const location = locationMatch
    ? locationMatch[0]
    : raw.company_address || "서울";

  const receiptDate: Date | null = raw.receipt_close
    ? new Date(raw.receipt_close)
    : null;

  let highlight = "";
  if (receiptDate instanceof Date && !isNaN(receiptDate.getTime())) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    receiptDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (receiptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays > 0) {
      highlight = `D-${diffDays}`;
    } else if (diffDays === 0) {
      highlight = "D-DAY";
    } else {
      highlight = "마감";
    }
  }

  return {
    id: raw.id,
    title: raw.title,
    company: raw.company,
    location: raw.location || location,
    deadline: receiptDate ? receiptDate.toISOString() : null,
    category: raw.employment_type,
    employment_type: raw.employment_type,
    education_required: raw.education_required,
    work_time: raw.work_time,
    holiday: raw.holiday,
    wage: raw.wage,
    description: raw.description,
    reg_date: raw.reg_date,
    highlight,
    isFavorite: false,
    receipt_method: raw.receipt_method,
    career_required: raw.career_required,
    manager_org: raw.manager_org,
    manager_phone: raw.manage_phone,
    manager_name: raw.manager_name,
    receiptClose: raw.receipt_close,
    papers_required: raw.papers_required,
    selection_method: raw.selection_method,
    insurance: raw.insurance,
    week_hours: raw.week_hours,
    api_type: raw.api_type,
  };
};

export const fetchJobs = async (): Promise<Job[]> => {
  try {
    const dbJobs = await fetchJobsFromDB();
    if (!dbJobs || dbJobs.length === 0) return [];

    const favoriteIds = getFavoriteJobIds();

    const jobs = dbJobs.map((raw) => {
      const job = convertDBJobToJobFormat(raw);
      return {
        ...job,
        isFavorite: favoriteIds.includes(job.id.toString()),
      };
    });

    return jobs;
  } catch (error) {
    console.error("Supabase 구직 공고 로드 실패:", error);
    return [];
  }
};

// Get jobs by location
export const getJobsByLocation = async (
  desiredLocation: string
): Promise<Job[]> => {
  const allJobs = await fetchJobs();
  return allJobs.filter((job) => job.location?.includes(desiredLocation));
};

// Get jobs by gu district
export const getJobsByGu = async (desiredGu: string): Promise<Job[]> => {
  const allJobs = await fetchJobs();

  console.log('desiredGu:'+desiredGu)

  const filtered = allJobs.filter((job) => {
    const rawAddress = job.work_address || job.location || "";
    const gu = extractGu(rawAddress);

    console.log('rawAddress:'+rawAddress)
    console.log('gu:'+gu)

    return gu === desiredGu;
  });

  return filtered.sort((a, b) => {
    const dateA = new Date(a.reg_date || a.created_at || 0).getTime();
    const dateB = new Date(b.reg_date || b.created_at || 0).getTime();
    return dateB - dateA;
  });
};

// Get a job by ID
export const getJobById = async (id: string | number): Promise<Job | null> => {
  const allJobs = await fetchJobs();
  const job = allJobs.find((job) => job.id.toString() === id.toString());
  return job || null;
};

// Get education data from backend API
export const getEducationData = async (): Promise<EducationProgram[]> => {
  try {
    const { data, error } = await supabase
    .from("TB_EDUCATIONS")
    .select("*");

    if (error) {
      console.error("교육 데이터 조회 실패:", error.message);
      return [];
    }
    return data as EducationProgram[];
  

  } catch (error) {
    console.error("Error fetching education data:", error);
    return [];
  }
};
