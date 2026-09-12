import Link from "next/link";
import { ArrowRight, Rocket, Box, Terminal, Shield, type LucideIcon } from "lucide-react";
import { features } from "@/data/landing";

const iconMap: Record<string, LucideIcon> = {
  rocket: Rocket,
  box: Box,
  terminal: Terminal,
  shield: Shield,
};

export function Features() {
  return (
    <section id="recursos" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Tudo que você precisa para deploys modernos
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon];
            return (
              <div
                key={feature.title}
                className="glass-card group p-6 transition-all hover:border-violet-500/20 hover:bg-zinc-900/70"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/10 ring-1 ring-violet-500/20 transition-colors group-hover:bg-violet-600/20">
                  <Icon size={20} className="text-violet-400" />
                </div>
                <h3 className="mb-2 font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/recursos"
            className="inline-flex items-center gap-2 text-sm font-medium text-violet-400 transition-colors hover:text-violet-300"
          >
            Ver todos os recursos
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
