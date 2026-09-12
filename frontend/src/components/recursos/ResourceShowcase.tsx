import { Check, Workflow, Monitor, type LucideIcon } from "lucide-react";
import { resourceShowcases } from "@/data/recursos";

const iconMap: Record<string, LucideIcon> = {
  workflow: Workflow,
  monitor: Monitor,
};

export function ResourceShowcase() {
  return (
    <section className="relative py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="space-y-16 lg:space-y-24">
          {resourceShowcases.map((showcase, index) => {
            const Icon = iconMap[showcase.icon];
            const reversed = index % 2 === 1;

            return (
              <div
                key={showcase.title}
                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                  reversed ? "lg:[direction:rtl]" : ""
                }`}
              >
                <div className={reversed ? "lg:[direction:ltr]" : ""}>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/10 ring-1 ring-violet-500/20">
                    <Icon size={24} className="text-violet-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white sm:text-3xl">
                    {showcase.title}
                  </h2>
                  <p className="mt-4 leading-relaxed text-slate-400">
                    {showcase.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {showcase.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-center gap-3 text-sm text-slate-300"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                          <Check size={12} className="text-emerald-400" />
                        </span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className={`glass-card relative overflow-hidden p-8 ${
                    reversed ? "lg:[direction:ltr]" : ""
                  }`}
                >
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-600/10 blur-2xl" />
                  <div className="relative space-y-4">
                    {showcase.bullets.map((bullet, i) => (
                      <div
                        key={bullet}
                        className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3"
                        style={{ opacity: 1 - i * 0.08 }}
                      >
                        <div className="h-2 w-2 rounded-full bg-violet-400" />
                        <span className="text-sm text-slate-300">{bullet}</span>
                        <span className="ml-auto text-xs text-emerald-400">
                          ✓
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
