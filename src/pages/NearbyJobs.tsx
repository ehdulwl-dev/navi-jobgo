
import React, { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getJobsByGu } from "../services/jobs/fetchService";
import JobCard from "../components/JobCard";
import BottomNavigation from "../components/BottomNavigation";
import Header from "@/components/Header";
import { useUser } from "@/contexts/UserContext"; 
import { supabase } from "@/integrations/supabase/client";
import { getDdayStatus } from "@/utils/jobDateUtils";

const NearbyJobs = () => {
  const { user } = useUser();
  const [locationText, setLocationText] = useState("희망 근무 지역 정보 없음");

  useEffect(() => {
    const fetchPreferredLocation = async () => {
      if (!user?.email) return;

      const { data, error } = await supabase
        .from("TB_USER")
        .select("preferlocate")
        .eq("email", user.email)
        .single();

      if (data?.preferlocate) {
        setLocationText(data.preferlocate);
      }
    };

    fetchPreferredLocation();
  }, [user]);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs", "gu", locationText],
    queryFn: () => getJobsByGu(locationText),
    enabled: locationText !== "희망 근무 지역 정보 없음",
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="집과 가까운 모집 공고" />

      {/* Location Section */}
      <div className="bg-white p-4 mb-4 flex items-center">
        <MapPin className="text-app-blue mr-2" size={20} />
        <span>희망 근무 지역: "{locationText}"</span>
      </div>

      {/* Main Content */}
      <main className="px-4 py-6">
        {isLoading ? (
          <p className="text-center py-4">로딩 중...</p>
        ) : jobs && jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title}
                company={job.company}
                location={job.location}
                category={job.category}
                highlight={getDdayStatus(job.receipt_close)}
                deadline={job.receipt_close ? new Date(job.receipt_close) : null}
              />
            ))}
          </div>
        ) : (
          <p className="text-center py-4">해당 조건의 구직 공고가 없습니다.</p>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default NearbyJobs;
