interface JobListItemProps {
  title: string;
  company: string;
  deadline: string;
  dDay: string;
}

export function JobListItem({
  title,
  company,
  deadline,
  dDay,
}: JobListItemProps) {
  return (
    <article className="flex gap-5 justify-between px-4 py-4 rounded-lg border border-solid">
      <div className="flex flex-col">
        <h3 className="text-lg text-zinc-900">{title}</h3>
        <span className="mt-1.5 text-sm text-gray-600">{company}</span>
      </div>
      <div className="flex flex-col whitespace-nowrap">
        <span className="self-end text-base font-bold">
          {dDay}
        </span>
        <time className="mt-2 text-sm text-right text-gray-600">
          ~{deadline}
        </time>
      </div>
    </article>
  );
}
