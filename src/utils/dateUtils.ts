
/**
 * Format job deadline for display
 */
export const getDeadlineDisplay = (raw?: string | Date | null): string => {
  if (!raw || raw === "상시채용") return "";

  const date = typeof raw === "string" ? new Date(raw) : raw;
  if (!(date instanceof Date) || isNaN(date.getTime())) return "";

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
  return `~${month}/${day}(${weekday})`;
};
