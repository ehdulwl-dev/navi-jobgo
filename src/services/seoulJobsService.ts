
import axios from 'axios';
import { getSeoulApiKey, syncSeoulJobs } from './supabaseClient';
import { Job } from '../components/JobList';

// Seoul Open API endpoint - using a CORS proxy
const CORS_PROXY = 'https://corsproxy.io/?';
const SEOUL_API_URL = 'http://openapi.seoul.go.kr:8088';

// Interface for Seoul API response
interface SeoulApiResponse {
  JobList: {
    list_total_count: number;
    RESULT: {
      CODE: string;
      MESSAGE: string;
    };
    row: Array<{
      JO_SJ: string;         // 구인제목
      JO_REGIST_NO: string;  // 구인등록번호
      CMPNY_NM: string;      // 회사명
      BSSH_ADRES: string;    // 사업장주소
      RCRIT_NMPR: string;    // 모집인원
      ACDMCR_CMMN: string;   // 학력
      EMPLYM_STLE: string;   // 고용형태
      WORK_PARAR: string;    // 임금
      RCEPT_CLOS_NM: string; // 접수마감일
      JO_DETHOME_URL: string;// 상세페이지
    }>;
  };
}

// Function to convert Seoul API data to our Job format
const convertToJobFormat = (seoulJob: any): Job => {
  // Extract location (district) from address if possible
  const locationMatch = seoulJob.BSSH_ADRES?.match(/서울특별시\s+([^\s]+구)/);
  const location = locationMatch ? locationMatch[0] : '서울';
  
  // Determine employment type
  let employmentType = '정규직';
  if (seoulJob.EMPLYM_STLE.includes('시간')) {
    employmentType = '파트타임';
  } else if (seoulJob.EMPLYM_STLE.includes('계약')) {
    employmentType = '계약직';
  } else if (seoulJob.EMPLYM_STLE.includes('기간제')) {
    employmentType = '기간제';
  }
  
  // Determine deadline
  const deadline = seoulJob.RCEPT_CLOS_NM === '접수마감일까지' 
    ? '상시채용'
    : seoulJob.RCEPT_CLOS_NM;
  
  // Generate a highlight if deadline is close (within 3 days)
  let highlight = '';
  if (deadline !== '상시채용') {
    try {
      const deadlineDate = new Date(deadline);
      const today = new Date();
      const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft <= 3 && daysLeft > 0) {
        highlight = `D-${daysLeft}`;
      }
    } catch (e) {
      // If date parsing fails, don't set a highlight
    }
  }

  // Create a job object with the Seoul API data
  return {
    id: seoulJob.JO_REGIST_NO,
    title: seoulJob.JO_SJ,
    company: seoulJob.CMPNY_NM,
    location: location,
    deadline: deadline,
    employmentType: employmentType,
    category: '일반',  // Default category
    isFavorite: false,
    description: `모집인원: ${seoulJob.RCRIT_NMPR}\n학력: ${seoulJob.ACDMCR_CMMN}\n고용형태: ${seoulJob.EMPLYM_STLE}\n임금: ${seoulJob.WORK_PARAR}`,
    highlight: highlight,
    detailUrl: seoulJob.JO_DETHOME_URL,
  };
};

// Function to fetch job data from Seoul API
export const fetchSeoulJobs = async (startIndex = 1, endIndex = 10): Promise<Job[]> => {
  try {
    // Get API key
    const apiKey = await getSeoulApiKey();
    
    if (!apiKey) {
      console.error('Failed to retrieve Seoul API key');
      return [];
    }
    
    // Make request to Seoul Open API via CORS proxy
    const encodedUrl = encodeURIComponent(`${SEOUL_API_URL}/${apiKey}/json/JobList/${startIndex}/${endIndex}/`);
    const proxyUrl = `${CORS_PROXY}${encodedUrl}`;
    
    console.log('Fetching Seoul jobs from:', proxyUrl);
    
    const response = await axios.get<SeoulApiResponse>(proxyUrl);
    
    // Check if request was successful
    if (response.data?.JobList?.RESULT?.CODE === 'INFO-000') {
      console.log('Successfully fetched Seoul jobs:', response.data.JobList.row.length);
      
      // Sync with Supabase database
      await syncSeoulJobs(response.data.JobList.row);
      
      // Convert Seoul API data to our Job format
      return response.data.JobList.row.map(convertToJobFormat);
    } else {
      console.error('Seoul API error:', response.data?.JobList?.RESULT);
      return [];
    }
  } catch (error) {
    console.error('Error fetching Seoul jobs:', error);
    return [];
  }
};
