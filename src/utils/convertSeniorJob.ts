import { SeniorJob, Job } from "@/types/job";

// 날짜로 D-Day 계산
const getDdayFromDescription = (description?: string): string => {
  if (!description) return "확인 필요";

  const match = description.match(/(\d{4})[.\-/](\d{2})[.\-/](\d{2})/);
  if (!match) return "확인 필요";

  const [_, y, m, d] = match;
  const deadline = new Date(`${y}-${m}-${d}`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diff = Math.floor(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff > 0 ? `D-${diff}` : diff === 0 ? "D-DAY" : "마감";
};

export const convertSeniorJobToJob = (raw: SeniorJob): Job => ({
  id: raw.idx || crypto.randomUUID(),
  title: raw.title || "제목 없음",
  company: raw.company || "", // 줄바꿈 원할 경우: "\n"
  deadline: null,
  dDay: getDdayFromDescription(raw.description),
});
