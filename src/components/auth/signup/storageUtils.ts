
export const getStoredFormData = () => {
  try {
    // Check for each individual field in localStorage
    const name = localStorage.getItem('signup_name') || "";
    const gender = localStorage.getItem('signup_gender') || "";
    const birthYear = localStorage.getItem('signup_birthYear') || "";
    const birthMonth = localStorage.getItem('signup_birthMonth') || "";
    const birthDay = localStorage.getItem('signup_birthDay') || "";
    const phone = localStorage.getItem('signup_phone') || "";
    const address = localStorage.getItem('signup_address') || "";
    const addressDetail = localStorage.getItem('signup_addressDetail') || "";
    const email = localStorage.getItem('signup_email') || "";
    const emailDomain = localStorage.getItem('signup_emailDomain') || "naver.com";
    const customDomain = localStorage.getItem('signup_customDomain') || "";
    const password = localStorage.getItem('signup_password') || "";
    const confirmPassword = localStorage.getItem('signup_confirmPassword') || "";
    
    // Parse array values from localStorage
    const getArrayFromStorage = (key: string) => {
      const value = localStorage.getItem(`signup_${key}`);
      if (value) {
        try {
          return JSON.parse(value);
        } catch (e) {
          return [];
        }
      }
      return [];
    };

    const preferjob = getArrayFromStorage('preferjob');
    const preferlocate = getArrayFromStorage('preferlocate');
    const prefertime = getArrayFromStorage('prefertime');
    const personality = getArrayFromStorage('personality');
    
    return {
      name,
      gender,
      birthYear,
      birthMonth,
      birthDay,
      phone,
      address,
      addressDetail,
      email,
      emailDomain,
      customDomain,
      password,
      confirmPassword,
      preferjob,
      preferlocate,
      prefertime,
      personality,
    };
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  
  return {
    name: "",
    gender: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    phone: "",
    address: "",
    addressDetail: "",
    email: "",
    emailDomain: "naver.com",
    customDomain: "",
    password: "",
    confirmPassword: "",
    preferjob: [],
    preferlocate: [],
    prefertime: [],
    personality: [],
  };
};

export const clearSignupData = () => {
  const formKeys = [
    'name', 'gender', 'birthYear', 'birthMonth', 'birthDay',
    'phone', 'address', 'addressDetail', 'email', 'emailDomain',
    'customDomain', 'password', 'confirmPassword',
    'preferjob', 'preferlocate', 'prefertime', 'personality'
  ];
  
  formKeys.forEach(key => {
    localStorage.removeItem(`signup_${key}`);
  });
};
