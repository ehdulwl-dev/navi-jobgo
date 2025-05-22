
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { ArrowLeft, Phone, MapPin } from "lucide-react";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { SeniorAgency, fetchAllSeniorAgencies, fetchAgenciesByUserLocation } from "@/services/seniorAgencyService";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SeniorAgencies: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [allAgencies, setAllAgencies] = useState<SeniorAgency[]>([]);
  const [nearbyAgencies, setNearbyAgencies] = useState<SeniorAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(user ? "nearby" : "all");

  useEffect(() => {
    const loadAgencies = async () => {
      setLoading(true);
      try {
        // 모든 기관 로드
        const agencies = await fetchAllSeniorAgencies();
        setAllAgencies(agencies);

        // 사용자 정보가 있으면 사용자 위치 기반 기관을 가져옵니다
        if (user) {
          const { data, error } = await supabase
            .from("TB_USER")
            .select("preferlocate")
            .eq("email", user.email)
            .single();
            
          if (!error && data?.preferlocate) {
            const userAgencies = await fetchAgenciesByUserLocation(data.preferlocate);
            setNearbyAgencies(userAgencies);
          }
        }
      } catch (error) {
        console.error("기관 불러오기 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAgencies();
  }, [user]);

  const renderAgencyCard = (agency: SeniorAgency) => (
    <Card key={agency.id || agency.fclt_cd} className="mb-4">
      <CardContent className="p-4">
        <h3 className="font-bold text-lg">{agency.fclt_nm}</h3>
        
        {agency.fclt_kind_nm && (
          <p className="text-sm text-gray-600 mt-1">{agency.fclt_kind_nm} {agency.fclt_kind_dtl_nm || ''}</p>
        )}
        
        {agency.fclt_addr && (
          <div className="flex items-start mt-2">
            <MapPin className="h-4 w-4 mt-0.5 mr-2 text-gray-500" />
            <p className="text-sm">{agency.fclt_addr}</p>
          </div>
        )}
        
        {agency.fclt_tel_no && (
          <div className="flex items-center mt-2">
            <Phone className="h-4 w-4 mr-2 text-gray-500" />
            <p className="text-sm">{agency.fclt_tel_no}</p>
          </div>
        )}
        
        {agency.jrsd_sgg_nm && (
          <p className="text-sm text-gray-500 mt-2">관할: {agency.jrsd_sgg_nm}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Header title="시니어 일자리 지원기관" />
      
      <main className="px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            {user && (
              <TabsTrigger value="nearby">내 지역 기관</TabsTrigger>
            )}
            <TabsTrigger value="all" className={user ? '' : 'col-span-2'}>
              전체 기관
            </TabsTrigger>
          </TabsList>
          
          {user && (
            <TabsContent value="nearby">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-gray-200 h-36 rounded-lg"></div>
                  ))}
                </div>
              ) : nearbyAgencies.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">내 지역에 등록된 지원기관이 없습니다</p>
                  <Button onClick={() => setActiveTab("all")}>전체 기관 보기</Button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    내 지역({user ? '설정한 선호지역' : ''})과 일치하는 {nearbyAgencies.length}개의 지원기관입니다
                  </p>
                  {nearbyAgencies.map(renderAgencyCard)}
                </div>
              )}
            </TabsContent>
          )}
          
          <TabsContent value="all">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-36 rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  총 {allAgencies.length}개의 시니어 일자리 지원기관이 있습니다
                </p>
                {allAgencies.map(renderAgencyCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default SeniorAgencies;
