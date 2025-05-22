
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";

export interface SeniorAgency {
  id?: number;
  fclt_cd?: string;
  fclt_nm: string;
  fclt_kind_nm?: string;
  fclt_kind_dtl_nm?: string;
  fclt_addr?: string;
  fclt_tel_no?: string;
  jrsd_sgg_nm?: string;
}

// 모든 시니어 지원기관 목록 가져오기
export const fetchAllSeniorAgencies = async (): Promise<SeniorAgency[]> => {
  try {
    const { data, error } = await supabase
      .from("TB_SENIOR_FCLT")
      .select("*");

    if (error) {
      console.error("시니어 지원기관 불러오기 실패:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("시니어 지원기관 불러오기 오류:", error);
    return [];
  }
};

// 사용자 위치 기반 시니어 지원기관 가져오기
export const fetchAgenciesByUserLocation = async (userLocation?: string): Promise<SeniorAgency[]> => {
  try {
    if (!userLocation) {
      return [];
    }

    // 쉼표로 구분된 여러 지역을 처리
    const locations = userLocation.split(',').map(loc => loc.trim());
    
    // 여러 지역 중 어느 하나라도 일치하는 기관 필터링
    const { data, error } = await supabase
      .from("TB_SENIOR_FCLT")
      .select("*")
      .or(locations.map(loc => `jrsd_sgg_nm.ilike.%${loc}%`).join(','));

    if (error) {
      console.error("사용자 지역 기반 시니어 지원기관 불러오기 실패:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("사용자 지역 기반 시니어 지원기관 불러오기 오류:", error);
    return [];
  }
};
