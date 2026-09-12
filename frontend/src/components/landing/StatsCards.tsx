"use client";

import {
  FolderKanban,
  CheckCircle2,
  Globe,
  Cpu,
  type LucideIcon,
} from "lucide-react";
import { statsCards } from "@/data/landing";

const iconMap: Record<string, LucideIcon> = {
  folder: FolderKanban,
  check: CheckCircle2,
  globe: Globe,
  cpu: Cpu,
};

type StatItem = { title: string; value: string; trend?: string; icon?: string };

export function StatsCards({ items }: { items?: StatItem[] }) {
  const list = items ?? statsCards;
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
      {list.map((stat) => {
        const Icon = iconMap[(stat.icon ?? "folder") as string];
        return (
          <div
            key={stat.title}
            className="rounded-lg border border-white/5 bg-zinc-900/60 p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">{stat.title}</span>
              {Icon && <Icon size={14} className="text-violet-400" />}
            </div>
            <p className="text-lg font-bold text-white">{stat.value}</p>
            <p className="text-[10px] text-emerald-400">{stat.trend}</p>
          </div>
        );
      })}
    </div>
  );
}
