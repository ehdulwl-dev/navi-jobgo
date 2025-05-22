
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { SeniorAgency, fetchAgenciesByUserLocation } from "@/services/seniorAgencyService";
import { Card, CardContent } from "./ui/card";
import { supabase } from "@/integrations/supabase/client"; // Add this import
import SeniorJobSupportBanner from "./SeniorJobSupportBanner";

const SeniorAgencySection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [agencies, setAgencies] = useState<SeniorAgency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAgencies = async () => {
      setLoading(true);
      try {
        // 사용자 정보가 있으면 사용자 위치 기반 기관을 가져옵니다
        if (user) {
          const { data, error } = await supabase
            .from("TB_USER")
            .select("preferlocate")
            .eq("email", user.email)
            .single();
            
          if (error) {
            console.error("사용자 정보 불러오기 실패:", error);
          } else if (data?.preferlocate) {
            const userAgencies = await fetchAgenciesByUserLocation(data.preferlocate);
            setAgencies(userAgencies);
          }
        } else {
          // 사용자 정보가 없으면 빈 배열로 설정
          setAgencies([]);
        }
      } catch (error) {
        console.error("기관 불러오기 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAgencies();
  }, [user]);

  const handleViewAllClick = () => {
    navigate("/senior-agencies");
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-3">시니어 일자리 지원기관</h2>
        <div className="animate-pulse bg-gray-200 h-40 rounded-lg"></div>
      </div>
    );
  }

  // 사용자 정보가 없거나 매칭되는 기관이 없는 경우
  if (!user || agencies.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-3">시니어 일자리 지원기관</h2>
        <Card className="cursor-pointer" onClick={handleViewAllClick}>
          <CardContent className="p-4 flex flex-col items-center justify-center h-40">
            <p className="text-gray-500 mb-2">
              {user ? "인근 지원기관 정보가 없습니다" : "로그인하여 인근 지원기관을 확인하세요"}
            </p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
              모든 지원기관 보기
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="mb-8">
      <h2 className="self-start mt-12 text-2xl font-bold text-zinc-900 max-md:mt-10 max-md:ml-1">
        시니어 일자리 지원기관
      </h2>
  
      {/* 여백 줄인 배너 */}
  
      <SeniorJobSupportBanner />
  
      <Card className="cursor-pointer hover:shadow-md transition-shadow mt-0.5" onClick={handleViewAllClick}>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3">
            {agencies.slice(0, 3).map((agency) => (
              <div key={agency.id || agency.fclt_cd} className="border-b pb-2 last:border-b-0 last:pb-0">
                <h3 className="font-semibold">{agency.fclt_nm}</h3>
                <p className="text-sm text-gray-600">{agency.fclt_addr}</p>
                {agency.fclt_tel_no && (
                  <p className="text-sm text-blue-600">{agency.fclt_tel_no}</p>
                )}
              </div>
            ))}
            {agencies.length > 3 && (
              <p className="text-center text-sm text-gray-500">
                외 {agencies.length - 3}개 기관이 더 있습니다
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeniorAgencySection;
