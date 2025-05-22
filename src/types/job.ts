// src/types/job.ts

// export interface Job {
//   id: number | string;
//   company: string;
//   title: string;
//   employmentType?: string;
//   location?: string;
//   category?: string;
//   work_address?: string;
//   [key: string]: any;
// }

export interface Job {
  id: number | string;
  company: string;
  title: string;
  employmentType?: string;
  location?: string;
  category?: string;
  work_address?: string;
  reg_date?: string;
  created_at?: string;
  description?: string;
  [key: string]: any;
}

export interface EducationProgram {
  id: string;
  edc_nm: string;
  provider: string;
  edc_begin_de_dt: string;
  edc_end_de_dt: string;
  sttus_nm: string;
}
export interface SeniorJob {
  idx: number;
  company: string;
  title: string;
  description?: string;
  working_hours?: string;
  salary?: string;
  employment_type?: string;
  qualification?: string;
  location?: string;
  application_method?: string;
  documents?: string;
  source?: string;
}
