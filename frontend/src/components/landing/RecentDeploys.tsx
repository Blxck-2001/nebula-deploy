import { recentDeploys as localDeploys } from "@/data/landing";

type DeployItem = {
  project: string;
  branch?: string;
  commit?: string;
  status?: string;
  time?: string;
  id?: string;
};

export function RecentDeploys({ items }: { items?: DeployItem[] }) {
  const list = items ?? localDeploys;
  return (
    <div className="rounded-lg border border-white/5 bg-zinc-900/60 p-3">
      <h4 className="mb-2 text-[11px] font-medium text-slate-300">Últimos deploys</h4>
      <div className="space-y-1.5">
        {list.map((deploy) => (
          <div
            key={`${deploy.project}-${deploy.commit ?? deploy.id}`}
            className="flex items-center justify-between rounded-md bg-white/[0.02] px-2 py-1.5 text-[10px]"
          >
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <span className="truncate font-medium text-white">{deploy.project}</span>
              <span className="hidden text-slate-500 sm:inline">{deploy.branch}</span>
              <span className="font-mono text-slate-500 truncate">{deploy.commit}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                  deploy.status === "success"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {deploy.status === "success" ? "Sucesso" : "Falhou"}
              </span>
              <span className="text-slate-500">{deploy.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
