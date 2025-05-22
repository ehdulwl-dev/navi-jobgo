import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobInfo from "./JobInfo";
import JobDescription from "./JobDescription";
import JobAnalysisTab from "./JobAnalysisTab";
import { Job } from "../../components/JobList";
import { MatchAnalysis } from "../../services/matchingService";
import { JobAnalysisResult } from "../../services/jobs/analysis/types";

interface JobTabsProps {
  job: Job;
  fromFavorites: boolean;
  activeTab: string;
  hasCompletedQuestionnaire: boolean;
  isAnalysisReady: boolean;
  matchAnalysis: MatchAnalysis;
  onTabChange: (value: string) => void;
  onStartAnalysis: () => void;
  jobAnalysis?: JobAnalysisResult | null;
  isAnalyzing: boolean;
}

const JobTabs: React.FC<JobTabsProps> = ({
  job,
  fromFavorites,
  activeTab,
  hasCompletedQuestionnaire,
  isAnalysisReady,
  matchAnalysis,
  onTabChange,
  onStartAnalysis,
  jobAnalysis,
  isAnalyzing,
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4 ">
      <TabsList className="w-full h-12 bg-gray-100 rounded-full p-1">
        <TabsTrigger
          value="info"
          className="flex-1 text-sm h-10 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-full transition"
        >
          공고 정보
        </TabsTrigger>
        {fromFavorites && (
          <TabsTrigger
            value="analysis"
            className="flex-1 text-sm h-10 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-full transition"
          >
            맞춤형 분석
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="info" className="space-y-4">
        <JobInfo job={job} />
        <JobDescription job={job} />
      </TabsContent>

      {fromFavorites && (
        <TabsContent value="analysis">
          <JobAnalysisTab
            jobId={job.id}
            hasCompletedQuestionnaire={hasCompletedQuestionnaire}
            isAnalysisReady={isAnalysisReady}
            matchAnalysis={matchAnalysis}
            onStartAnalysis={onStartAnalysis}
            onBack={() => onTabChange("info")}
            jobAnalysis={jobAnalysis}
            isAnalyzing={isAnalyzing}
          />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default JobTabs;
