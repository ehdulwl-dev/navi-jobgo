
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface User {
  email: string;
  name: string;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("세션 불러오기 오류:", error);
        return;
      }

      if (session?.user?.email) {
        const { data: userData, error: userError } = await supabase
          .from("TB_USER")
          .select("name")
          .eq("email", session.user.email)
          .single();

        if (userError) {
          console.error("사용자 정보 불러오기 오류:", userError);
        }

        setUser({
          email: session.user.email,
          name: userData?.name || "사용자",
        });
      }
    };

    loadUser();

    // 세션 변화 감지
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (event === "SIGNED_IN" && session?.user) {
        setUser({
          email: session.user.email,
          name: session.user.user_metadata?.name || "사용자",
        });
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // 로그아웃
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast.success("로그아웃 되었습니다.");
    } catch (error) {
      console.error("로그아웃 오류:", error);
      toast.error("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
