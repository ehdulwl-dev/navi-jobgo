import React from "react";
import { useUserData } from "../hooks/useUserData";
import SeniorJobSupportBanner from "./SeniorJobSupportBanner";
import SeniorAgencySection from "./SeniorAgencySection";
import PersonalizedJobRecommendations from "./PersonalizedJobRecommendations";
import ThemedJobSectionsContainer from "./ThemedJobSectionsContainer";

interface RecommendedJobsSectionProps {
  onJobCardClick: (jobId: string | number) => void;
  userName?: string;
  isLoggedIn?: boolean;
}

const RecommendedJobsSection: React.FC<RecommendedJobsSectionProps> = ({
  onJobCardClick,
  userName,
  isLoggedIn = false,
}) => {
  const { displayName, preferredGu } = useUserData(userName, isLoggedIn);

  return (
    <>
      <section className="mt-4">
        {isLoggedIn && (
          <PersonalizedJobRecommendations 
            displayName={displayName} 
            onJobCardClick={onJobCardClick} 
          />
        )}
      
        <div className="mt-6">
          <SeniorAgencySection />
        </div>
      </section>
      
      <ThemedJobSectionsContainer preferredGu={preferredGu} />

    </>
  );
};

export default RecommendedJobsSection;
