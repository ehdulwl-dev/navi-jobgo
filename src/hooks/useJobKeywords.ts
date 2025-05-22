import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";

export const useJobKeywords = () => {
  const { user } = useUser();
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKeywords = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const { data: userData, error: userError } = await supabase
          .from("TB_USER")
          .select("preferjob")
          .eq("email", user.email)
          .single();

        if (userError) throw new Error(userError.message);

        if (userData?.preferjob) {
          if (Array.isArray(userData.preferjob)) {
            setKeywords(userData.preferjob);
          } else if (typeof userData.preferjob === "string") {
            const keywordArray = userData.preferjob
              .split(",")
              .map((k) => k.trim())
              .filter((k) => k.length > 0);
            setKeywords(keywordArray);
          }
        } else {
          setKeywords([]); // preferjob이 없으면 빈 배열
        }
      } catch (err) {
        console.error("Error fetching job keywords:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setKeywords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchKeywords();
  }, [user]);

  return { keywords, loading, error };
};
