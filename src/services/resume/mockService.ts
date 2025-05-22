
import { ResumeData } from './types';

// Mock storage for development purposes
let mockResumes: ResumeData[] = [];

// Mock API for development purposes
export const getMockResumes = (): ResumeData[] => {
  return mockResumes;
};

export const getMockResumeById = (id: string): ResumeData | null => {
  const mockResume = mockResumes.find(resume => resume.id === id);
  return mockResume || null;
};

export const createMockResume = (data: ResumeData): ResumeData => {
  const mockId = Date.now().toString();
  const newResume = { ...data, id: mockId };
  mockResumes.push(newResume);
  return newResume;
};

export const updateMockResume = (id: string, data: ResumeData): ResumeData => {
  mockResumes = mockResumes.map(resume => 
    resume.id === id ? { ...data, id } : resume
  );
  return { ...data, id };
};

export const deleteMockResume = (id: string): void => {
  mockResumes = mockResumes.filter(resume => resume.id !== id);
};
