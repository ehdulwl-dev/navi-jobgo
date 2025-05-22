function getRecruitStatus(dateStr: string): string {
  if (!dateStr || dateStr === "상시") return "상시 모집";
  const today = new Date();
  const deadline = new Date(dateStr);
  return deadline < today ? "모집 마감" : "모집 중";
}
