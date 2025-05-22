
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ResumeData } from "@/services/resume/types";
import { getResumes } from "@/services/resume";
import { getSupabaseResumeById } from "@/services/resume/supabaseService";


// Format resume data into a text string suitable for analysis
const formatResumeForAnalysis = async (resumeData: ResumeData): Promise<string> => {
  let formattedResume = "";
  
  // Basic personal info
  formattedResume += `이름: ${resumeData.name || ''}\n`;
  
  // Education information
  formattedResume += "학력: ";
  if (resumeData.highestEducation === "대학원" && resumeData.gradSchool) {
    formattedResume += `${resumeData.gradSchool} ${resumeData.gradSchoolMajor || ''} 졸업`;
  } else if (resumeData.highestEducation === "대학교" && resumeData.university) {
    formattedResume += `${resumeData.university} ${resumeData.universityMajor || ''} 졸업`;
  } else if (resumeData.highestEducation === "전문대" && resumeData.college) {
    formattedResume += `${resumeData.college} ${resumeData.collegeMajor || ''} 졸업`;
  } else if (resumeData.highSchool) {
    formattedResume += `${resumeData.highSchool} ${resumeData.highSchoolMajor || ""} 졸업`;
  }
  formattedResume += "\n";
  
  // Work experience
  if (resumeData.experiences && resumeData.experiences.length > 0) {
    formattedResume += "경력:\n";
    resumeData.experiences.forEach((exp, index) => {
      if (exp.companyName) {
        formattedResume += `- ${exp.companyName} ${exp.jobTitle || ""} `;
        if (exp.startYear && exp.startMonth) {
          formattedResume += `(${exp.startYear}.${exp.startMonth} ~ `;
          formattedResume += exp.endYear && exp.endMonth ? `${exp.endYear}.${exp.endMonth})` : "현재)";
        }
        formattedResume += "\n";
        if (exp.responsibilities) {
          formattedResume += `  주요업무: ${exp.responsibilities}\n`;
        }
      }
    });
  }
  
  // Certificates
  if (resumeData.certificates && resumeData.certificates.length > 0) {
    formattedResume += "자격증:\n";
    resumeData.certificates.forEach((cert) => {
      if (cert.name) {
        formattedResume += `- ${cert.name}`;
        if (cert.organization) formattedResume += ` (${cert.organization})`;
        if (cert.issueDate) formattedResume += ` 취득일: ${cert.issueDate}`;
        formattedResume += "\n";
      }
    });
  }
  
  // Computer skills
  if (resumeData.computerSkills) {
    const skills = [];
    if (resumeData.computerSkills.documentCreation) skills.push("문서 작성");
    if (resumeData.computerSkills.spreadsheet) skills.push("스프레드시트");
    if (resumeData.computerSkills.presentation) skills.push("프레젠테이션");
    if (resumeData.computerSkills.accounting) skills.push("회계 프로그램");
    if (resumeData.computerSkills.other) skills.push(resumeData.computerSkills.other);
    
    if (skills.length > 0) {
      formattedResume += `컴퓨터 활용 능력: ${skills.join(", ")}\n`;
    }
  }

  // Additional skills
  if (resumeData.skills) {
    formattedResume += `추가 스킬: ${resumeData.skills}\n`;
  }

  // Driving ability
  if (resumeData.drivingAbility) {
    if (resumeData.drivingAbility.license) {
      formattedResume += "운전면허: 있음\n";
      if (resumeData.drivingAbility.vehicle) {
        formattedResume += "자차 보유: 있음\n";
      }
    }
  }
  
  return formattedResume;
};

// Enhanced function to fetch user TB_USER id from email
const getUserId = async (email: string): Promise<number | null> => {
  try {
    const { data, error } = await supabase
      .from("TB_USER")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error("Error in getUserId:", error);
    return null;
  }
};

// Get resume information for the current user
export const getUserResume = async (userId: string): Promise<string | null> => {
  try {
    // First, check if we have a user email from auth
    const { data: sessionData } = await supabase.auth.getSession();
    const userEmail = sessionData?.session?.user?.email;
    
    if (!userEmail) {
      console.log("No user email found in session, using sample resume data");
      toast.info("로그인한 사용자의 이력서 정보가 없어 샘플 데이터를 사용합니다.");
      return getSampleResumeData();
    }
    
    // Get user's resumes
    const resumes = await getResumes(userEmail);
    
    if (!resumes || resumes.length === 0) {
      console.log("No resumes found for user, using sample resume data");
      toast.info("등록된 이력서가 없어 샘플 데이터를 사용합니다.");
      return getSampleResumeData();
    }
    
    // Use the first resume for now (in the future, we could allow the user to select which resume to use)
    // 수정: const resumeData = resumes[0];
    // 아래 블럭으로 수정됨
    const resumeData = await getSupabaseResumeById(resumes[0].id); 
    
    if (!resumeData) {
      console.log("Resume detail not found, using sample data");
      return getSampleResumeData();
    }
    

    
    // Format the resume data for analysis
    return await formatResumeForAnalysis(resumeData);
    
  } catch (error) {
    console.error("Error fetching user resume:", error);
    toast.error("이력서 정보를 불러오는데 실패했습니다. 샘플 데이터를 사용합니다.");
    return getSampleResumeData();
  }
};

// Sample resume data to use when user resume is not available
const getSampleResumeData = (): string => {
  return `경력: 웹 개발자 (3년), 프론트엔드 개발자 (2년)
기술: React, TypeScript, JavaScript, HTML, CSS
학력: 서울대학교 컴퓨터공학과 졸업
자격증: 정보처리기사`;
};

