
import React, { useState, useEffect } from "react";
import { ArrowLeft, User, Edit2, Save, Check, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";

interface ProfileData {
  name: string;
  gender: "여자" | "남자" | string;
  birthDate: string;
  phone: string;
  email: string;
  desiredJob: string;
  desiredLocation: string;
  desiredWorkingHours: string;
  personality: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [tempProfile, setTempProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in first
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      // No need to redirect, we'll show a signup prompt instead
    } else {
      fetchProfile();
    }
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user?.email) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Fetch the user profile data from Supabase
      const { data: userData, error: userError } = await supabase
        .from("TB_USER")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();

      if (userError) {
        console.error("프로필 불러오기 실패 (Supabase):", userError);
        toast.error("프로필을 불러오지 못했습니다");
        setIsLoading(false);
        return;
      }

      if (userData) {
        const mappedProfile: ProfileData = {
          name: userData.name || "",
          gender: userData.gender || "",
          birthDate: userData.birthdate || "",
          phone: userData.phone || "",
          email: userData.email || "",
          desiredJob: userData.preferjob || "",
          desiredLocation: userData.preferlocate || "",
          desiredWorkingHours: userData.prefertime || "",
          personality: userData.personality || "",
        };
        
        setProfile(mappedProfile);
        setTempProfile(mappedProfile);
      } else {
        console.log("User found but no profile data available");
        // Create a basic profile with data we have from authentication
        const basicProfile: ProfileData = {
          name: user.name || "",
          email: user.email || "",
          gender: "",
          birthDate: "",
          phone: "",
          desiredJob: "",
          desiredLocation: "",
          desiredWorkingHours: "",
          personality: "",
        };
        setProfile(basicProfile);
        setTempProfile(basicProfile);
      }
    } catch (error) {
      console.error("프로필 불러오기 실패:", error);
      toast.error("프로필을 불러오지 못했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenProfileEdit = () => {
    if (!profile) return;
    setTempProfile({ ...profile });
    setIsEditingProfile(true);
  };

  const handleOpenJobEdit = () => {
    if (!profile) return;
    setTempProfile({ ...profile });
    setIsEditingJob(true);
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    if (!tempProfile) return;
    setTempProfile({
      ...tempProfile,
      [field]: value,
    });
  };

  const handleGenderChange = (gender: "여자" | "남자") => {
    if (!tempProfile) return;
    setTempProfile({
      ...tempProfile,
      gender,
    });
  };

  const handleSaveProfile = async () => {
    if (!tempProfile || !profile) return;

    const updated = {
      ...profile,
      name: tempProfile.name,
      gender: tempProfile.gender,
      birthDate: tempProfile.birthDate,
      phone: tempProfile.phone,
      email: tempProfile.email,
    };

    const success = await saveToSupabase(updated);

    if (success) {
      await fetchProfile();
      toast.success("저장되었습니다");
    }

    setIsEditingProfile(false);
  };

  const handleSaveJob = async () => {
    if (!tempProfile || !profile) return;

    const updated = {
      ...profile,
      desiredJob: tempProfile.desiredJob,
      desiredLocation: tempProfile.desiredLocation,
      desiredWorkingHours: tempProfile.desiredWorkingHours,
      personality: tempProfile.personality,
    };

    const success = await saveToSupabase(updated);

    if (success) {
      await fetchProfile();
      toast.success("저장되었습니다");
    }

    setIsEditingJob(false);
  };

  const renderProfileField = (label: string, value: string) => {
    return (
      <div className="flex justify-between items-center py-3 border-b border-gray-100">
        <span className="text-gray-500">{label}</span>
        <span>{value}</span>
      </div>
    );
  };

  const saveToSupabase = async (updatedProfile: ProfileData): Promise<boolean> => {
    if (!user?.email) {
      toast.error("로그인이 필요합니다");
      return false;
    }
    
    try {
      // Try direct Supabase update
      const { error: supabaseError } = await supabase
        .from("TB_USER")
        .update({
          name: updatedProfile.name,
          gender: updatedProfile.gender,
          birthdate: updatedProfile.birthDate,
          phone: updatedProfile.phone,
          preferjob: updatedProfile.desiredJob,
          preferlocate: updatedProfile.desiredLocation,
          prefertime: updatedProfile.desiredWorkingHours,
          personality: updatedProfile.personality
        })
        .eq("email", updatedProfile.email);
        
      if (supabaseError) {
        console.error("❌ Supabase 업데이트 에러:", supabaseError);
        toast.error("DB 저장 실패");
        return false;
      }

      return true;
    } catch (err) {
      console.error("저장 실패:", err);
      toast.error("DB 저장 실패");
      return false;
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-500">프로필을 불러오는 중입니다...</p>
      </div>
    );
  }

  // If not logged in, show signup prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="내 정보" />
        <main className="px-4 py-6">
          <div className="text-center py-10">
            <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-6">
              회원가입을 통해 맞춤 일자리 정보를 받아보세요.
            </p>
            <Button 
              onClick={() => navigate("/LoginPage")} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-5"
              size="lg"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              회원가입 하기
            </Button>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="내 정보" />
      <main className="px-4 py-6">
        {profile ? (
          <>
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">내 프로필</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenProfileEdit}
                  className="text-blue-500"
                >
                  <Edit2 size={18} />
                </Button>
              </div>

              <div className="space-y-2">
                {renderProfileField("성함", profile.name)}
                {renderProfileField("성별", profile.gender)}
                {renderProfileField("생년월일", profile.birthDate)}
                {renderProfileField("전화번호", profile.phone)}
                {renderProfileField("E-mail", profile.email)}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">내 희망 직무</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenJobEdit}
                  className="text-blue-500"
                >
                  <Edit2 size={18} />
                </Button>
              </div>

              <div className="space-y-2">
                {renderProfileField("희망 직무", profile.desiredJob)}
                {renderProfileField("희망 근무 지역", profile.desiredLocation)}
                {renderProfileField(
                  "희망 근무 가능 시간",
                  profile.desiredWorkingHours
                )}
                {renderProfileField("나의 성향", profile.personality)}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-gray-500 mb-6">
              프로필 정보를 불러올 수 없습니다. 다시 시도해주세요.
            </p>
            <Button 
              onClick={fetchProfile} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              다시 시도
            </Button>
          </div>
        )}
      </main>
      
      {/* 프로필 정보 편집 다이얼로그 */}
      {tempProfile && (
        <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>내 프로필 수정</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">성함</Label>
                <Input
                  id="name"
                  value={tempProfile.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>성별</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="gender"
                      checked={tempProfile.gender === "여자"}
                      onChange={() => handleGenderChange("여자")}
                      className="form-radio"
                    />
                    <span>여자</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="gender"
                      checked={tempProfile.gender === "남자"}
                      onChange={() => handleGenderChange("남자")}
                      className="form-radio"
                      />
                    <span>남자</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">생년월일</Label>
                <Input
                  id="birthDate"
                  placeholder="예: 1900-00-00"
                  value={tempProfile.birthDate}
                  onChange={(e) => handleInputChange("birthDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">전화번호</Label>
                <Input
                  id="phone"
                  placeholder="예: 010-0000-0000"
                  value={tempProfile.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} className="w-full">
                저장하기
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 희망 직무 편집 다이얼로그 */}
      {tempProfile && (
        <Dialog open={isEditingJob} onOpenChange={setIsEditingJob}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>내 희망 직무 수정</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="desiredJob">희망 직무</Label>
                <Input
                  id="desiredJob"
                  placeholder="예: 바리스타"
                  value={tempProfile.desiredJob}
                  onChange={(e) =>
                    handleInputChange("desiredJob", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desiredLocation">희망 근무 지역</Label>
                <Input
                  id="desiredLocation"
                  placeholder="예: 강남구, 마포구"
                  value={tempProfile.desiredLocation}
                  onChange={(e) =>
                    handleInputChange("desiredLocation", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desiredWorkingHours">희망 근무 가능 시간</Label>
                <Input
                  id="desiredWorkingHours"
                  placeholder="예: 평일, 주말, 오전, 오후"
                  value={tempProfile.desiredWorkingHours}
                  onChange={(e) =>
                    handleInputChange("desiredWorkingHours", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="personality">나의 성향</Label>
                <Input
                  id="personality"
                  placeholder="예: 침착함, 적극성"
                  value={tempProfile.personality}
                  onChange={(e) =>
                    handleInputChange("personality", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveJob} className="w-full">
                저장하기
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      <BottomNavigation />
    </div>
  );
};

export default Profile;
