
import { useUser } from "@/contexts/UserContext";
import { ResumeData } from './types';
import { 
  getMockResumes, 
  getMockResumeById, 
  createMockResume, 
  updateMockResume, 
  deleteMockResume 
} from './mockService';
import { 
  getSupabaseResumes, 
  getSupabaseResumeById, 
  createSupabaseResume, 
  updateSupabaseResume, 
  deleteSupabaseResume 
} from './supabaseService';

// Export the ResumeData interface for other modules to use
export type { ResumeData };

// Main service functions that combine the Supabase and mock implementations
export const getResumes = async (userEmail:string): Promise<ResumeData[]> => {
  try {
    if (!userEmail) {
      throw new Error("User email is required to fetch resumes");
    }
    // Try to get data from Supabase first
    return await getSupabaseResumes(userEmail);
  } catch (error) {
    console.log('Using mock data for resumes:', error);
    // Return mock data if the API is not available
    return getMockResumes();
  }
};

export const getResumeById = async (id: string): Promise<ResumeData | null> => {
  try {
    console.log('id:::'+id);
    // Try to get data from Supabase first
    return await getSupabaseResumeById(id);
  } catch (error) {
    console.log('Using mock data for resume by id:', error);
    // Return mock data if the API is not available
    return getMockResumeById(id);
  }
};

export const createResume = async (data: ResumeData, userEmail:string): Promise<ResumeData> => {
  try {
    if (!userEmail) {
      throw new Error("User email is required to create a resume");
    }
    // Try to save to Supabase first
    return await createSupabaseResume(data, userEmail);
  } catch (error) {
    console.log('Using mock storage for resume creation:', error);
    // Save to mock storage if the API is not available
    return createMockResume(data);
  }
};

export const updateResume = async (id: string, data: ResumeData): Promise<ResumeData> => {
  try {
    // Try to update in Supabase first
    return await updateSupabaseResume(id, data);
  } catch (error) {
    console.log('Using mock storage for resume update:', error);
    // Update in mock storage if the API is not available
    return updateMockResume(id, data);
  }
};

export const deleteResume = async (id: string): Promise<void> => {
  try {
    // Try to delete from Supabase first
    await deleteSupabaseResume(id);
  } catch (error) {
    console.log('Using mock storage for resume deletion:', error);
    // Delete from mock storage if the API is not available
    deleteMockResume(id);
  }
};
