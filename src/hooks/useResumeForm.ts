import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FormDataType, FormErrorsType } from "@/types/resume";
import { createResume, updateResume, getResumeById } from "@/services/resume";
import { getCurrentUserProfile } from "@/services/user/profile";
import { useUser } from "@/contexts/UserContext";


const initialFormData: FormDataType = {
  name: "",
  email: "",
  phone: "",
  birthYear: "",
  birthMonth: "",
  birthDay: "",
  postcode: "",
  address: "",
  addressDetail: "",

  isVeteran: false,
  veteranType: "",
  veteranDocument: null,
  isDisabled: false,
  disabilityType: "",
  disabilityDocument: null,
  isVulnerable: false,
  vulnerableType: "",
  vulnerableDocument: null,

  highestEducation: "대학교",
  highSchool: "",
  highSchoolMajor: "",
  highSchoolGradYear: "",
  highSchoolAdmsYear: "",
  college: "",
  collegeMajor: "",
  collegeGPA: "",
  collegeGradYear: "",
  collegeAdmsYear: "",
  university: "",
  universityMajor: "",
  universityGPA: "",
  universityGradYear: "",
  universityAdmsYear: "",
  gradSchool: "",
  gradSchoolMajor: "",
  gradSchoolGPA: "",
  gradSchoolGradYear: "",
  gradSchoolAdmsYear: "",

  company1: "",
  position1: "",
  period1: "",
  description1: "",
  company2: "",
  position2: "",
  period2: "",
  description2: "",

  skills: "",

  experiences: [
    {
      companyName: "",
      jobTitle: "",
      customJobTitle: "",
      contractType: "",
      employmentStatus: "", 
      startYear: "",
      startMonth: "",
      endYear: "",
      endMonth: "",
      responsibilities: "",
    },
  ],

  certificates: [
    {
      name: "",
      grade: "",
      issueDate: "",
      organization: "",
    },
  ],

  computerSkills: {
    documentCreation: false,
    spreadsheet: false,
    presentation: false,
    accounting: false,
    other: "",
  },

  drivingAbility: {
    license: false,
    vehicle: false,
  },
};

const initialFormErrors: FormErrorsType = {
  name: false,
  email: false,
  phone: false,
  birthYear: false,
  birthMonth: false,
  birthDay: false,
  address: false,
};

export const useResumeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const [activeTab, setActiveTab] = useState("personal");
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null);
  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrorsType>(initialFormErrors);
  const { user } = useUser();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setCurrentUser({
          email: data.session.user.email || ''
        });
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser?.email && !isEditing) {
        setIsLoading(true);
        try {
          const userProfile = await getCurrentUserProfile();
          if (userProfile) {
            let birthYear = '';
            let birthMonth = '';
            let birthDay = '';
            
            if (userProfile.birthdate) {
              const date = new Date(userProfile.birthdate);
              birthYear = date.getFullYear().toString();
              birthMonth = (date.getMonth() + 1).toString();
              birthDay = date.getDate().toString();
            }

            setFormData(prev => ({
              ...prev,
              name: userProfile.name || prev.name,
              email: userProfile.email || prev.email,
              phone: userProfile.phone || prev.phone,
              birthYear: birthYear || prev.birthYear,
              birthMonth: birthMonth || prev.birthMonth,
              birthDay: birthDay || prev.birthDay,
              address: userProfile.address || prev.address,
            }));
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          toast.error("사용자 정보를 불러오는데 실패했습니다.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [currentUser, isEditing]);

  useEffect(() => {
    const fetchResumeData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const resumeData = await getResumeById(id);
        if (resumeData) {
          const updatedExperiences = resumeData.experiences.map(exp => ({
            ...exp,
            companyName: exp.companyName || '',
            jobTitle: exp.jobTitle || '',
            customJobTitle: exp.customJobTitle || '',
            contractType: exp.contractType || '',
            employmentStatus: exp.employmentStatus || exp.contractType || '',
            startYear: exp.startYear || '',
            startMonth: exp.startMonth || '',
            endYear: exp.endYear || '',
            endMonth: exp.endMonth || '',
            responsibilities: exp.responsibilities || ''
          }));
          
          setFormData(prevData => ({
            ...prevData,
            ...resumeData,
            experiences: updatedExperiences,
            postcode: resumeData.postcode || prevData.postcode,
            addressDetail: resumeData.addressDetail || prevData.addressDetail,
            isVeteran: resumeData.isVeteran || prevData.isVeteran,
            isDisabled: resumeData.isDisabled || prevData.isDisabled,
            isVulnerable: resumeData.isVulnerable || prevData.isVulnerable,
            id: resumeData.id
          }));
        }
      } catch (error) {
        console.error("Error fetching resume data:", error);
        toast.error("이력서 데이터를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumeData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressComplete = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      postcode: data.zonecode,
      address: data.address,
    }));
    setFormErrors((prev) => ({ ...prev, address: false }));
  };

  const handleCheckboxChange = (name: string) => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
  };

  const validateBasicInfo = () => {
    const errors = {
      name: !formData.name,
      email: !formData.email,
      phone: !formData.phone,
      birthYear: !formData.birthYear,
      birthMonth: !formData.birthMonth,
      birthDay: !formData.birthDay,
      address: !formData.address,
    };

    setFormErrors(errors);
    return !Object.values(errors).some((error) => error);
  };

  const handleTabChange = (value: string) => {
    if (value !== "personal" || validateBasicInfo()) {
      setActiveTab(value);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    try {
      if (!user || !user.email) {
        toast.error("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
        return;
      }
      
      if (isEditing && id) {
        await updateResume(id, formData);
        toast.success("이력서가 성공적으로 수정되었습니다.");
      } else {
        await createResume(formData, user.email);
        toast.success("이력서가 성공적으로 생성되었습니다.");
      }
      navigate("/resume");
    } catch (error) {
      console.error("Error saving resume:", error);
      toast.error("이력서 저장에 실패했습니다.");
    }
  };

  const handleNext = () => {
    if (activeTab === "personal" && !validateBasicInfo()) {
      return;
    }

    switch (activeTab) {
      case "personal":
        setActiveTab("education");
        break;
      case "education":
        setActiveTab("experience");
        break;
      case "experience":
        setActiveTab("skills");
        break;
      case "skills":
        setShowPreview(true);
        break;
      default:
        break;
    }
  };

  const handlePrevious = () => {
    switch (activeTab) {
      case "education":
        setActiveTab("personal");
        break;
      case "experience":
        setActiveTab("education");
        break;
      case "skills":
        setActiveTab("experience");
        break;
      default:
        break;
    }
  };

  const addNewExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        {
          companyName: "",
          jobTitle: "",
          customJobTitle: "",
          contractType: "",
          employmentStatus: "",
          startYear: "",
          startMonth: "",
          endYear: "",
          endMonth: "",
          responsibilities: "",
        },
      ],
    }));
  };

  const deleteExperience = (indexToDelete: number) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter(
        (_, index) => index !== indexToDelete
      ),
    }));
  };

  const handleExperienceChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const addCertificate = () => {
    setFormData((prev) => ({
      ...prev,
      certificates: [
        ...prev.certificates,
        {
          name: "",
          grade: "",
          issueDate: "",
          organization: "",
        },
      ],
    }));
  };

  const updateCertificate = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      certificates: prev.certificates.map((cert, i) =>
        i === index ? { ...cert, [field]: value } : cert
      ),
    }));
  };

  const deleteCertificate = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index),
    }));
  };

  return {
    isEditing,
    activeTab,
    showPreview,
    isLoading,
    formData,
    formErrors,
    handleChange,
    handleSelectChange,
    handleAddressComplete,
    handleCheckboxChange,
    handleFileChange,
    validateBasicInfo,
    handleTabChange,
    handleSubmit,
    handleNext,
    handlePrevious,
    addNewExperience,
    deleteExperience,
    handleExperienceChange,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    setShowPreview,
    setFormData,
  };
};
