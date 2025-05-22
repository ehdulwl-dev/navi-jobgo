import { supabase } from '@/integrations/supabase/client';
import { ResumeData } from './types';

export const getUserId = async (userEmail: string): Promise<number> => {
  console.log("이메일:", userEmail);

  const { data: userData, error: userError } = await supabase
    .from("TB_USER")
    .select("id")
    .eq("email", userEmail)
    .single();

  if (userError || !userData) {
    console.error("사용자 조회 실패:", userError?.message);
    throw new Error("사용자 정보를 찾을 수 없습니다.");
  }
  return userData.id;
};

// Function to get all resumes from Supabase
export const getSupabaseResumes = async (userEmail:string): Promise<ResumeData[]> => {

  try {
    
    const userid = await getUserId(userEmail);

    const { data, error } = await supabase
      .from('TB_CV_USER')
      .select('*')
      .eq('userid', userid);
      
    if (error) throw error;
    
    if (data && data.length > 0) {
      // Transform Supabase data to match ResumeData interface
      return data.map(user => ({
        id: user.id.toString(),
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        birthYear: user.birthdate ? new Date(user.birthdate).getFullYear().toString() : '',
        birthMonth: user.birthdate ? (new Date(user.birthdate).getMonth() + 1).toString() : '',
        birthDay: user.birthdate ? new Date(user.birthdate).getDate().toString() : '',
        address: user.address || '',
        highestEducation: '고등학교', // Default value
        experiences: [],
        certificates: [],
        computerSkills: {
          documentCreation: false,
          spreadsheet: false,
          presentation: false,
          accounting: false,
          other: ''
        }
      }));
    }
    
    return [];
  } catch (error) {
    console.log('Error fetching resumes from Supabase:', error);
    throw error;
  }
};

// Function to get a resume by ID from Supabase
export const getSupabaseResumeById = async (id: string): Promise<ResumeData | null> => {
  try {
    // Get user data from Supabase
    const { data: userData, error: userError } = await supabase
      .from('TB_CV_USER')
      .select('*')
      .eq('id', parseInt(id))
      .single();
      
    if (userError) throw userError;
    
    if (userData) {
      // Fetch education data from TB_CV_EDU
      const { data: eduData, error: eduError } = await supabase
        .from('TB_CV_EDU')
        .select('*')
        .eq('resume_id', parseInt(id));
      
      if (eduError) {
        console.error('Error fetching education data:', eduError);
      }
      
      // Parse education data
      let highSchool = '';
      let highSchoolMajor = '';
      let highSchoolGradYear = '';
      let highSchoolAdmsYear = '';
      let college = '';
      let collegeMajor = '';
      let collegeGradYear = '';
      let collegeAdmsYear = '';
      let university = '';
      let universityMajor = '';
      let universityGradYear = '';
      let universityAdmsYear = '';
      let gradSchool = '';
      let gradSchoolMajor = '';
      let gradSchoolGradYear = '';
      let gradSchoolAdmsYear = '';
      
      let highestEducation = '고등학교'; // Default value
      
      if (eduData && eduData.length > 0) {
        // Determine highest education level
        if (eduData.some(edu => edu.edutype === '대학원')) {
          highestEducation = '대학원';
        } else if (eduData.some(edu => edu.edutype === '대학교')) {
          highestEducation = '대학교';
        } else if (eduData.some(edu => edu.edutype === '전문대')) {
          highestEducation = '전문대';
        }
        
        eduData.forEach(edu => {
          switch(edu.edutype) {
            case '고등학교':
              highSchool = edu.schoolname || '';
              highSchoolMajor = edu.major || '';
              highSchoolGradYear = edu.grdyear ? edu.grdyear.toString() : '';
              highSchoolAdmsYear = edu.admsyear ? edu.admsyear.toString() : '';
              break;
            case '전문대':
              college = edu.schoolname || '';
              collegeMajor = edu.major || '';
              collegeGradYear = edu.grdyear ? edu.grdyear.toString() : '';
              collegeAdmsYear = edu.admsyear ? edu.admsyear.toString() : '';
              break;
            case '대학교':
              university = edu.schoolname || '';
              universityMajor = edu.major || '';
              universityGradYear = edu.grdyear ? edu.grdyear.toString() : '';
              universityAdmsYear = edu.admsyear ? edu.admsyear.toString() : '';
              break;
            case '대학원':
              gradSchool = edu.schoolname || '';
              gradSchoolMajor = edu.major || '';
              gradSchoolGradYear = edu.grdyear ? edu.grdyear.toString() : '';
              gradSchoolAdmsYear = edu.admsyear ? edu.admsyear.toString() : '';
              break;
          }
        });
      }

      // Fetch experience data from TB_CV_EXP
      const { data: expData, error: expError } = await supabase
        .from('TB_CV_EXP')
        .select('*')
        .eq('resume_id', parseInt(id));
      
      if (expError) {
        console.error('Error fetching experience data:', expError);
      }

      // Map and parse experience data from TB_CV_EXP to match our ResumeData structure
      const experiences = expData && expData.length > 0 
        ? expData.map(exp => ({
            companyName: exp.company || '',
            jobTitle: exp.position || '',
            customJobTitle: '', // Not stored in DB, using empty string as default
            contractType: exp.employment_type || '',
            employmentStatus: exp.status || '',
            startYear: exp.enterdate ? new Date(exp.enterdate).getFullYear().toString() : '',
            startMonth: exp.enterdate ? (new Date(exp.enterdate).getMonth() + 1).toString() : '',
            endYear: exp.retiredate ? new Date(exp.retiredate).getFullYear().toString() : '',
            endMonth: exp.retiredate ? (new Date(exp.retiredate).getMonth() + 1).toString() : '',
            responsibilities: exp.achievement || ''
          }))
        : [{
            companyName: '',
            jobTitle: '',
            customJobTitle: '',
            contractType: '',
            employmentStatus: '',
            startYear: '',
            startMonth: '',
            endYear: '',
            endMonth: '',
            responsibilities: '',
          }];

      // Fetch certificate data
      const { data: certData, error: certError } = await supabase
        .from('TB_CV_CRTF')
        .select('*')
        .eq('resume_id', parseInt(id));
      
      if (certError) {
        console.error('Error fetching certificate data:', certError);
      }

      // Parse certificate data
      const certificates = certData ? certData.map(cert => ({
        name: cert.crtfname || '',
        grade: cert.grade || '',
        organization: cert.organization || '',
        issueDate: cert.issueddate || ''
      })) : [{
        name: '',
        grade: '',
        organization: '',
        issueDate: '',
      }];

      // Default computer skills
      const defaultComputerSkills = {
        documentCreation: false,
        spreadsheet: false,
        presentation: false,
        accounting: false,
        other: '',
      };
      
      // Transform Supabase data to match ResumeData interface
      return {
        id: userData.id.toString(),
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        birthYear: userData.birthdate ? new Date(userData.birthdate).getFullYear().toString() : '',
        birthMonth: userData.birthdate ? (new Date(userData.birthdate).getMonth() + 1).toString() : '',
        birthDay: userData.birthdate ? new Date(userData.birthdate).getDate().toString() : '',
        address: userData.address || '',
        highestEducation, // Use the value determined above
        experiences, // Keep the existing implementation
        certificates, // Keep the existing implementation
        computerSkills: defaultComputerSkills, // Keep the existing implementation
        // Education data with admission years added
        highSchool,
        highSchoolMajor,
        highSchoolGradYear,
        highSchoolAdmsYear,
        college,
        collegeMajor,
        collegeGradYear,
        collegeAdmsYear,
        university,
        universityMajor,
        universityGradYear,
        universityAdmsYear,
        gradSchool,
        gradSchoolMajor,
        gradSchoolGradYear,
        gradSchoolAdmsYear,
        // Additional form fields with default values
        postcode: '',
        addressDetail: '',
        isVeteran: userData.veteran || false,
        veteranDocument: null,
        isDisabled: userData.disability || false,
        disabilityDocument: null,
        isVulnerable: userData.vulnerable || false,
        vulnerableDocument: null,
      };
    }
    
    return null;
  } catch (error) {
    console.log('Error fetching resume by ID from Supabase:', error);
    throw error;
  }
};

// Function to create a resume in Supabase
export const createSupabaseResume = async (data: ResumeData, userEmail: string): Promise<ResumeData> => {
  try {
    // Use 1 as a temporary userid since we don't have real auth yet
    const userid = await getUserId(userEmail);
    
    const { data: newUser, error:userError } = await supabase
      .from('TB_CV_USER')
      .insert({
        userid: userid, // Add required userid field
        name: data.name,
        email: data.email,
        phone: data.phone,
        birthdate: `${data.birthYear}-${data.birthMonth}-${data.birthDay}`,
        address: data.address
      })
      .select()
      .single();
      
    if (userError || !newUser) throw userError;

    const resumeId = newUser.id;

    // 2. 학력 정보 저장 (대학, 대학원, 고등학교 등)
    const eduRows = [];

    if (data.highSchool) {
      eduRows.push({
        userid: userid,
        resume_id: resumeId,
        edutype: '고등학교',
        schoolname: data.highSchool,
        major: data.highSchoolMajor || '',
        grdyear: data.highSchoolGradYear || '',
        admsyear: data.highSchoolAdmsYear || ''
      });
    }

    if (data.college) {
      eduRows.push({
        userid: userid,
        resume_id: resumeId,
        edutype: '전문대',
        schoolname: data.college,
        major: data.collegeMajor || '',
        grdyear: data.collegeGradYear || '',
        admsyear: data.collegeAdmsYear || ''
      });
    }

    if (data.university) {
      eduRows.push({
        userid: userid,
        resume_id: resumeId,
        edutype: '대학교',
        schoolname: data.university,
        major: data.universityMajor || '',
        grdyear: data.universityGradYear || '',
        admsyear: data.universityAdmsYear || ''
      });
    }

    if (data.gradSchool) {
      eduRows.push({
        userid: userid,
        resume_id: resumeId,
        edutype: '대학원',
        schoolname: data.gradSchool,
        major: data.gradSchoolMajor || '',
        grdyear: data.gradSchoolGradYear || '',
        admsyear: data.gradSchoolAdmsYear || ''
      });
    }

    if (eduRows.length > 0) {
      const { error: eduError } = await supabase.from('TB_CV_EDU').insert(eduRows);
      if (eduError) throw eduError;
    }
    
     // 3. 경력 정보 저장
     if (data.experiences.length > 0) {
      const expRows = data.experiences.map(exp => ({
        userid: userid,
        resume_id: resumeId,
        company: exp.companyName,
        position: exp.jobTitle,
        employment_type: exp.contractType,
        status: exp.employmentStatus,
        enterdate: `${exp.startYear}-${exp.startMonth}-01`,
        retiredate: `${exp.endYear}-${exp.endMonth}-01`,
        achievement: exp.responsibilities
      }));

      const { error: expError } = await supabase.from('TB_CV_EXP').insert(expRows);
      if (expError) throw expError;
    }

    // 4. 자격증 정보 저장
    if (data.certificates.length > 0) {
      // Fix: Convert userid to number type to match the DB schema requirement
      const certRows = data.certificates.map(cert => ({
        userid: userid, // Use userId as a number instead of string
        resume_id: resumeId,
        crtfname: cert.name,
        grade: cert.grade,
        organization: cert.organization,
        issueddate: cert.issueDate
      }));

      const { error: certError } = await supabase.from('TB_CV_CRTF').insert(certRows);
      if (certError) throw certError;
    }

    return {
      ...data,
      id: resumeId.toString()
    };
  } catch (error) {
    console.log('Error creating resume in Supabase:', error);
    throw error;
  }
};

// Function to update a resume in Supabase
export const updateSupabaseResume = async (id: string, data: ResumeData): Promise<ResumeData> => {
  try {
    // Convert string id to number for Supabase query
    const numericId = parseInt(id);

    const { data: updatedResume, error } = await supabase
      .from('TB_CV_USER')
      .update({
        name: data.name,
        email: data.email,
        phone: data.phone,
        birthdate: `${data.birthYear}-${data.birthMonth}-${data.birthDay}`,
        address: data.address
      })
      .eq('id', numericId)
      .select()
      .single();
      
    if (error) throw error;
    
    if (updatedResume) {
      // Update education data
      // First, remove existing education records
      const { error: deleteEduError } = await supabase
        .from('TB_CV_EDU')
        .delete()
        .eq('resume_id', numericId);
        
      if (deleteEduError) throw deleteEduError;
      
      // Then insert new education records
      const eduRows = [];
      
      if (data.highestEducation !== "해당없음" && data.highSchool) {
        eduRows.push({
          resume_id: numericId,
          edutype: '고등학교',
          schoolname: data.highSchool,
          major: data.highSchoolMajor || '',
          grdyear: data.highSchoolGradYear || '',
          admsyear: data.highSchoolAdmsYear || ''
        });
      }
      
      if (['전문대', '대학교', '대학원'].includes(data.highestEducation) && data.college) {
        eduRows.push({
          resume_id: numericId,
          edutype: '전문대',
          schoolname: data.college,
          major: data.collegeMajor || '',
          grdyear: data.collegeGradYear || '',
          admsyear: data.collegeAdmsYear || ''
        });
      }
      
      if (['대학교', '대학원'].includes(data.highestEducation) && data.university) {
        eduRows.push({
          resume_id: numericId,
          edutype: '대학교',
          schoolname: data.university,
          major: data.universityMajor || '',
          grdyear: data.universityGradYear || '',
          admsyear: data.universityAdmsYear || ''
        });
      }
      
      if (data.highestEducation === '대학원' && data.gradSchool) {
        eduRows.push({
          resume_id: numericId,
          edutype: '대학원',
          schoolname: data.gradSchool,
          major: data.gradSchoolMajor || '',
          grdyear: data.gradSchoolGradYear || '',
          admsyear: data.gradSchoolAdmsYear || ''
        });
      }
      
      if (eduRows.length > 0) {
        const { error: insertEduError } = await supabase
          .from('TB_CV_EDU')
          .insert(eduRows);
          
        if (insertEduError) throw insertEduError;
      }
      
      // Fetch experience data from TB_CV_EXP
      const { data: expData, error: expError } = await supabase
        .from('TB_CV_EXP')
        .select('*')
        .eq('resume_id', numericId);
      
      if (expError) {
        console.error('Error fetching experience data:', expError);
      }

      // Map and parse experience data from TB_CV_EXP to match our ResumeData structure
      const experiences = expData && expData.length > 0 
        ? expData.map(exp => ({
            companyName: exp.company || '',
            jobTitle: exp.position || '',
            customJobTitle: '', // Not stored in DB, using empty string as default
            contractType: exp.employment_type || '',
            employmentStatus: exp.status || '',
            startYear: exp.enterdate ? new Date(exp.enterdate).getFullYear().toString() : '',
            startMonth: exp.enterdate ? (new Date(exp.enterdate).getMonth() + 1).toString() : '',
            endYear: exp.retiredate ? new Date(exp.retiredate).getFullYear().toString() : '',
            endMonth: exp.retiredate ? (new Date(exp.retiredate).getMonth() + 1).toString() : '',
            responsibilities: exp.achievement || ''
          }))
        : [{
            companyName: '',
            jobTitle: '',
            customJobTitle: '',
            contractType: '',
            employmentStatus: '',
            startYear: '',
            startMonth: '',
            endYear: '',
            endMonth: '',
            responsibilities: '',
          }];

      // Fetch certificate data
      const { data: certData, error: certError } = await supabase
        .from('TB_CV_CRTF')
        .select('*')
        .eq('resume_id', numericId);
      
      if (certError) {
        console.error('Error fetching certificate data:', certError);
      }

      // Parse certificate data
      const certificates = certData ? certData.map(cert => ({
        name: cert.crtfname || '',
        grade: cert.grade || '',
        organization: cert.organization || '',
        issueDate: cert.issueddate || ''
      })) : [{
        name: '',
        grade: '',
        organization: '',
        issueDate: '',
      }];
      
      // Create a complete ResumeData object from the updated data
      const savedResume: ResumeData = {
        id: updatedResume.id.toString(),
        name: updatedResume.name || data.name,
        email: updatedResume.email || data.email,
        phone: updatedResume.phone || data.phone,
        birthYear: data.birthYear,
        birthMonth: data.birthMonth,
        birthDay: data.birthDay,
        address: updatedResume.address || data.address,
        highestEducation: data.highestEducation,
        highSchool: data.highSchool,
        highSchoolMajor: data.highSchoolMajor,
        highSchoolGradYear: data.highSchoolGradYear,
        highSchoolAdmsYear: data.highSchoolAdmsYear,
        college: data.college,
        collegeMajor: data.collegeMajor,
        collegeGradYear: data.collegeGradYear,
        collegeAdmsYear: data.collegeAdmsYear,
        university: data.university,
        universityMajor: data.universityMajor,
        universityGradYear: data.universityGradYear,
        universityAdmsYear: data.universityAdmsYear,
        gradSchool: data.gradSchool,
        gradSchoolMajor: data.gradSchoolMajor,
        gradSchoolGradYear: data.gradSchoolGradYear,
        gradSchoolAdmsYear: data.gradSchoolAdmsYear,
        experiences: experiences,
        certificates: certificates,
        computerSkills: data.computerSkills,
        selectedTemplate: data.selectedTemplate
      };
      return savedResume;
    }
    
    throw new Error('Failed to update resume in Supabase');
  } catch (error) {
    console.log('Error updating resume in Supabase:', error);
    throw error;
  }
};

// Function to delete a resume in Supabase
export const deleteSupabaseResume = async (id: string): Promise<void> => {
  try {
    // Convert string id to number for Supabase query
    const numericId = parseInt(id);
    
    const { error } = await supabase
      .from('TB_CV_USER')
      .delete()
      .eq('id', numericId);
      
    if (error) throw error;
  } catch (error) {
    console.log('Error deleting resume from Supabase:', error);
    throw error;
  }
};
