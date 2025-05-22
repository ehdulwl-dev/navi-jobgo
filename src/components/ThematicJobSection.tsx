
import JobCard from "./JobCard";
import { Job } from "../types/job";

interface ThematicJobSectionProps {
  icon: string;
  title: string;
  bgColor: string;
  linkToMore: string;
  hideFavorite?: boolean;
  jobs: Job[];
}

export function ThematicJobSection({
  icon,
  title,
  bgColor,
  jobs,
  linkToMore,
  hideFavorite
}: ThematicJobSectionProps) {
  return (
    <section className="pb-3 mt-8 w-full bg-white rounded-2xl border border-solid">
      <header className={`flex gap-6 px-6 py-2 ${bgColor} rounded-2xl`}>
        <span className="text-3xl text-black">{icon}</span>
        <h2 className="flex-auto my-auto text-xl font-bold text-zinc-900">
          {title}
        </h2>
        <a
          href={linkToMore}
          className="self-end mt-2 text-sm font-bold"
        >
          더보기 →
        </a>
      </header>

      <div className="flex flex-col gap-2 px-2 mt-2 w-full">
        {jobs.length === 0 && (
          <p className="text-sm text-gray-400">공고 없음</p>
        )}

        {jobs.map((job) => {
          // 각 Job 객체의 실제 id를 사용하도록 수정
          return (
            <JobCard
              key={`${title}-${job.id}`}
              id={job.id} // 인덱스 대신 실제 job.id 사용
              title={job.title}
              company={job.company}
              deadline={job.deadline}
              highlight={job.dDay || ""} 
              hideFavorite={hideFavorite}
              onClick={() => console.log(`${title} 클릭:`, job.title)}
            />
          );
        })}

      </div>
    </section>
  );
}
