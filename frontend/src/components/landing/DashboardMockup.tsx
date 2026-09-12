"use client";

import {
  LayoutDashboard,
  FolderKanban,
  Rocket,
  ScrollText,
  Layers,
  Variable,
  Settings,
  Calendar,
} from "lucide-react";
import { Logo } from "./Logo";
import { StatsCards } from "./StatsCards";
import { DeployChart } from "./DeployChart";
import { ResourceChart } from "./ResourceChart";
import { RecentDeploys } from "./RecentDeploys";
import { RecentActivity } from "./RecentActivity";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Visão geral", active: true },
  { icon: FolderKanban, label: "Projetos", active: false },
  { icon: Rocket, label: "Deploys", active: false },
  { icon: ScrollText, label: "Logs", active: false },
  { icon: Layers, label: "Ambientes", active: false },
  { icon: Variable, label: "Variáveis", active: false },
  { icon: Settings, label: "Configurações", active: false },
];

export function DashboardMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-2xl bg-violet-600/20 blur-3xl" />
      <div className="relative overflow-hidden rounded-xl border border-violet-500/20 bg-zinc-950 shadow-glow-lg">
        <div className="flex h-[420px] sm:h-[480px]">
          {/* Sidebar */}
          <aside className="hidden w-36 shrink-0 flex-col border-r border-white/5 bg-zinc-950/80 sm:flex lg:w-44">
            <div className="border-b border-white/5 p-3">
              <Logo size="sm" />
            </div>
            <nav className="flex-1 space-y-0.5 p-2">
              {sidebarItems.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] ${
                    item.active
                      ? "bg-violet-600/20 text-violet-300"
                      : "text-slate-500"
                  }`}
                >
                  <item.icon size={12} />
                  <span className="truncate">{item.label}</span>
                </div>
              ))}
            </nav>
            <div className="border-t border-white/5 p-2">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white">
                  B
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-medium text-white">Black</p>
                  <p className="text-[9px] text-slate-500">Administrador</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-hidden p-3">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Visão geral</h3>
                <p className="text-[10px] text-slate-500">Acompanhe seus projetos e deploys</p>
              </div>
              <div className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-slate-400">
                <Calendar size={10} />
                Últimos 7 dias
              </div>
            </div>

            <div className="space-y-2 overflow-y-auto">
              <StatsCards />

              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                <DeployChart />
                <ResourceChart />
              </div>

              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                <RecentDeploys />
                <RecentActivity />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardMockup;
