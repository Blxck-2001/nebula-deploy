import {
  Github,
  Box,
  Database,
  Server,
  Code,
  Layout,
  type LucideIcon,
} from "lucide-react";
import { integrations } from "@/data/recursos";

const iconMap: Record<string, LucideIcon> = {
  github: Github,
  box: Box,
  database: Database,
  server: Server,
  code: Code,
  layout: Layout,
};

export function ResourceIntegrations() {
  return (
    <section className="relative py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Integrações nativas
          </h2>
          <p className="mt-3 text-slate-400">
            Conecte suas ferramentas favoritas e faça deploy de qualquer stack.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {integrations.map((integration) => {
            const Icon = iconMap[integration.icon];
            return (
              <div
                key={integration.name}
                className="glass-card flex flex-col items-center gap-3 p-6 transition-all hover:border-violet-500/20"
              >
                <Icon size={28} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-300">
                  {integration.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
