
export interface ExperienceItemType {
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
}

export interface ExperienceFormProps {
  formData: any;
  handleExperienceChange: (index: number, field: string, value: string) => void;
  addNewExperience: () => void;
  deleteExperience: (index: number) => void;
  handlePrevious: () => void;
  handleNext: () => void;
}

export interface ExperienceItemProps {
  experience: ExperienceItemType;
  index: number;
  jobTitles: string[];
  contractTypes: string[];
  years: number[];
  months: number[];
  handleExperienceChange: (index: number, field: string, value: string) => void;
  deleteExperience: (index: number) => void;
}
