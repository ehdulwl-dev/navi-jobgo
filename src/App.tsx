
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import Apply from "./pages/Apply";
import Resume from "./pages/Resume";
import CoverLetter from "./pages/CoverLetter";
import CoverLetterAIForm from "./pages/CoverLetterAIForm";
import JobDetail from "./pages/JobDetail";
import PartTimeJobs from "./pages/PartTimeJobs";
import NearbyJobs from "./pages/NearbyJobs";
import EducationInfo from "./pages/EducationInfo";
import NotFound from "./pages/NotFound";
import ResumeForm from "./pages/ResumeForm";
import QuestionEditPage from "./pages/QuestionEditPage";
import { Toaster } from "sonner";
import ResumeTemplate from "./pages/ResumeTemplate";
import CoverLetterPreview from "./pages/CoverLetterPreview";
import LoginPage from "./pages/LoginPage";
import LoginHome from "./pages/LoginHome";
import CoverLetterEdit from "./pages/CoverLetterEdit";
import CoverLetterTemplateSelect from "./pages/CoverLetterTemplateSelect";
import CoverLetterTemplatePreview from "./pages/CoverLetterTemplatePreview";
import { UserProvider } from "./contexts/UserContext";
import SeniorHireJobs from "./pages/SeniorHireJobs";
import SeniorAgencies from "./pages/SeniorAgencies"; // 추가된 부분

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <Toaster
            position="top-center"
            duration={2000}
            offset={40}
            richColors
            closeButton
          />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LoginHome />} />
              <Route path="/index" element={<Index />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/apply" element={<Apply />} />
              <Route path="/resume" element={<Resume />} />
              <Route path="/resume/create" element={<ResumeForm />} />
              <Route path="/resume/edit/:id" element={<ResumeForm />} />
              <Route path="/cover-letter" element={<CoverLetter />} />
              <Route path="/LoginPage" element={<LoginPage />} />
              <Route
                path="/cover-letter/ai-create"
                element={<CoverLetterAIForm />}
              />
              <Route
                path="/cover-letter/questions/edit"
                element={<QuestionEditPage />}
              />
              <Route
                path="/cover-letter/preview"
                element={<CoverLetterPreview />}
              />
              <Route
                path="/cover-letter/template-select"
                element={<CoverLetterTemplateSelect />}
              />
              <Route
                path="/cover-letter/template-preview"
                element={<CoverLetterTemplatePreview />}
              />
              <Route path="/job/:id" element={<JobDetail />} />
              <Route path="/jobs/part-time" element={<PartTimeJobs />} />
              <Route path="/jobs/nearby" element={<NearbyJobs />} />
              <Route path="/education" element={<EducationInfo />} />
              <Route path="/jobs/senior" element={<SeniorHireJobs />} />
              <Route path="/senior-agencies" element={<SeniorAgencies />} /> {/* 추가된 부분 */}
              <Route path="/resume/template/:id" element={<ResumeTemplate />} />
              <Route
                path="/cover-letter/edit/:id"
                element={<CoverLetterEdit />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
