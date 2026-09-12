import {
  Rocket,
  GitBranch,
  RefreshCw,
  Zap,
  Box,
  Layers,
  Globe,
  Cpu,
  Terminal,
  Activity,
  Bell,
  ScrollText,
  Shield,
  Lock,
  Users,
  Key,
  type LucideIcon,
} from "lucide-react";
import { resourceCategories } from "@/data/recursos";

const iconMap: Record<string, LucideIcon> = {
  rocket: Rocket,
  gitBranch: GitBranch,
  refreshCw: RefreshCw,
  zap: Zap,
  box: Box,
  layers: Layers,
  globe: Globe,
  cpu: Cpu,
  terminal: Terminal,
  activity: Activity,
  bell: Bell,
  scrollText: ScrollText,
  shield: Shield,
  lock: Lock,
  users: Users,
  key: Key,
};

export function ResourceCategories() {
  return (
    <section className="relative py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {resourceCategories.map((category, index) => (
          <div
            key={category.id}
            id={category.id}
            className={index > 0 ? "mt-20 lg:mt-28" : undefined}
          >
            <div className="mb-10 max-w-2xl">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                {category.title}
              </h2>
              <p className="mt-3 text-slate-400">{category.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {category.items.map((item) => {
                const Icon = iconMap[item.icon];
                return (
                  <div
                    key={item.title}
                    className="glass-card group flex flex-col p-6 transition-all hover:border-violet-500/20 hover:bg-zinc-900/70"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/10 ring-1 ring-violet-500/20 transition-colors group-hover:bg-violet-600/20">
                      <Icon size={20} className="text-violet-400" />
                    </div>
                    <h3 className="mb-2 font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-400">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400 ring-1 ring-white/5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
