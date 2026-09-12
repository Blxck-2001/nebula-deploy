import { recentActivity as localActivity } from "@/data/landing";

const dotColors: Record<string, string> = {
  deploy: "bg-violet-400",
  update: "bg-sky-400",
  env: "bg-amber-400",
};

type ActivityItem = { type: string; message: string; time?: string };

export function RecentActivity({ items }: { items?: ActivityItem[] }) {
  const list = items ?? localActivity;
  return (
    <div className="rounded-lg border border-white/5 bg-zinc-900/60 p-3">
      <h4 className="mb-2 text-[11px] font-medium text-slate-300">Atividade recente</h4>
      <div className="space-y-2">
        {list.map((activity, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${dotColors[activity.type]}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] text-slate-300">{activity.message}</p>
              <p className="text-[9px] text-slate-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
