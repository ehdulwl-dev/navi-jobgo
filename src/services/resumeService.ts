
// This file is kept to maintain backwards compatibility
// All functionality has been moved to src/services/resume/index.ts

import { 
  ResumeData,
  getResumes, 
  getResumeById, 
  createResume, 
  updateResume, 
  deleteResume 
} from './resume';

export type { ResumeData };
export { getResumes, getResumeById, createResume, updateResume, deleteResume };
