/**
 * Utility functions for handling job date-related operations
 */

// Calculate D-day status from deadline string
export const getDdayStatus = (endDateStr: string | null | undefined): string => {
  if (!endDateStr) return "확인 필요";
  if (endDateStr === "상시" || endDateStr === "상시채용") return "상시채용";

  const today = new Date();
  today.setHours(0, 0, 0, 0); // 정확한 날짜 비교를 위해 시간 설정
  
  // 날짜 형식 확인 및 변환
  let endDate;
  
  // YYYY-MM-DD 또는 YYYY.MM.DD 형식 확인
  if (typeof endDateStr === 'string') {
    // 형식 통일을 위해 점(.)을 하이픈(-)으로 변환
    const normalizedDateStr = endDateStr.replace(/\./g, '-');
    endDate = new Date(normalizedDateStr);
  } else {
    endDate = new Date(endDateStr);
  }
  
  if (isNaN(endDate.getTime())) return "확인 필요";
  
  const diffTime = endDate.getTime() - today.getTime(); // 현재 시간을 기준으로 차이 계산
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "마감";
  if (diffDays === 0) return "D-DAY";
  return `D-${diffDays}`;
};

// Helper function to sort jobs by D-day (closest first)
export const sortJobsByDeadline = (jobs: any[]): any[] => {
  return [...jobs].sort((a, b) => {
    // Always prioritize jobs that are not closed yet
    if (a.dDay === "마감" && b.dDay !== "마감") return 1;
    if (a.dDay !== "마감" && b.dDay === "마감") return -1;
    
    // Regular jobs sorted by D-day (lowest number first)
    if (a.dDay?.startsWith("D-") && b.dDay?.startsWith("D-")) {
      const daysA = parseInt(a.dDay.substring(2));
      const daysB = parseInt(b.dDay.substring(2));
      return daysA - daysB; // Smaller D-day values first (closer to deadline)
    }
    
    // Handle special cases
    if (a.dDay === "D-DAY") return -1; // D-DAY comes first
    if (b.dDay === "D-DAY") return 1;
    
    // "상시채용" comes after specific deadlines but before closed jobs
    if (a.dDay?.includes("상시") && !b.dDay?.includes("상시") && b.dDay !== "마감") return 1;
    if (b.dDay?.includes("상시") && !a.dDay?.includes("상시") && a.dDay !== "마감") return -1;
    
    // Default case: keep original order
    return 0;
  });
};
