
export interface ResumeData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  address: string;
  highestEducation: string;
  university?: string;
  universityMajor?: string;
  universityGPA?: string;
  universityGradYear?: string;
  universityAdmsYear?: string;
  college?: string;
  collegeMajor?: string;
  collegeGPA?: string;
  collegeGradYear?: string;
  collegeAdmsYear?: string;
  highSchool?: string;
  highSchoolMajor?: string;
  highSchoolGradYear?: string;
  highSchoolAdmsYear?: string;
  gradSchool?: string;
  gradSchoolMajor?: string;
  gradSchoolGPA?: string;
  gradSchoolGradYear?: string;
  gradSchoolAdmsYear?: string;
  experiences: Array<{
    companyName: string;
    jobTitle: string;
    customJobTitle: string;
    contractType: string;
    employmentStatus: string; 
    startYear: string;
    startMonth: string;
    endYear: string;
    endMonth: string;
    responsibilities: string;
  }>;
  certificates: Array<{
    name: string;
    grade: string;
    organization: string;
    issueDate: string;
  }>;
  computerSkills: {
    documentCreation: boolean;
    spreadsheet: boolean;
    presentation: boolean;
    accounting: boolean;
    other: string;
  };
  selectedTemplate?: string;
  // These fields are in the form but not in the database schema
  postcode?: string;
  addressDetail?: string;
  isVeteran?: boolean;
  veteranType?: string;
  veteranDocument?: any;
  isDisabled?: boolean;
  disabilityType?: string;
  disabilityDocument?: any;
  isVulnerable?: boolean;
  vulnerableType?: string;
  vulnerableDocument?: any;
  company1?: string;
  position1?: string;
  period1?: string;
  description1?: string;
  company2?: string;
  position2?: string;
  period2?: string;
  description2?: string;
  skills?: string;
  drivingAbility?: {
    license: boolean;
    vehicle: boolean;
  };
}
