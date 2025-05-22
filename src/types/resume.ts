
export type ExperienceType = {
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
};

export type FormDataType = {
  name: string;
  email: string;
  phone: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  postcode: string;
  address: string;
  addressDetail: string;
  isVeteran: boolean;
  veteranType: string;
  veteranDocument: any;
  isDisabled: boolean;
  disabilityType: string;
  disabilityDocument: any;
  isVulnerable: boolean;
  vulnerableType: string;
  vulnerableDocument: any;
  highestEducation: string;
  highSchool: string;
  highSchoolMajor: string;
  highSchoolGradYear: string;
  highSchoolAdmsYear: string;
  college: string;
  collegeMajor: string;
  collegeGPA: string;
  collegeGradYear: string;
  collegeAdmsYear: string;
  university: string;
  universityMajor: string;
  universityGPA: string;
  universityGradYear: string;
  universityAdmsYear: string;
  gradSchool: string;
  gradSchoolMajor: string;
  gradSchoolGPA: string;
  gradSchoolGradYear: string;
  gradSchoolAdmsYear: string;
  company1: string;
  position1: string;
  period1: string;
  description1: string;
  company2: string;
  position2: string;
  period2: string;
  description2: string;
  skills: string;
  experiences: ExperienceType[];
  certificates: Array<{
    name: string;
    grade: string;
    issueDate: string;
    organization: string;
  }>;
  computerSkills: {
    documentCreation: boolean;
    spreadsheet: boolean;
    presentation: boolean;
    accounting: boolean;
    other: string;
  };
  drivingAbility: {
    license: boolean;
    vehicle: boolean;
  };
  id?: string;
};

export type FormErrorsType = {
  name: boolean;
  email: boolean;
  phone: boolean;
  birthYear: boolean;
  birthMonth: boolean;
  birthDay: boolean;
  address: boolean;
  [key: string]: boolean;
};
