import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
import dynamic from "next/dynamic";
const DashboardMockup = dynamic(() => import("@/components/landing/DashboardMockup"), { ssr: false });

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:gap-16 lg:px-8 lg:grid-cols-[1fr_1.6fr]">
        <div className="animate-slide-up space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            <span className="text-xs font-medium text-violet-300">
              Plataforma de Deploy Self-Hosted
            </span>
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            Deploy de aplicações{" "}
            <span className="text-gradient">
              simples, rápido e sem complicação.
            </span>
          </h1>

          <p className="max-w-lg text-base leading-relaxed text-slate-400 lg:text-lg">
            Nebula Deploy é uma plataforma self-hosted para automatizar deploys a
            partir do GitHub. Inspirada em Railway e Render, mas com controle
            total sobre sua infraestrutura.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:bg-violet-500 hover:shadow-violet-500/30"
            >
              Começar agora
              <ArrowRight size={18} />
            </Link>
            <Link
              href="https://github.com/Blxck-2001/nebula-deploy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all hover:border-white/20 hover:bg-white/10"
            >
              <Github size={18} />
              Ver no GitHub
            </Link>
          </div>
        </div>

        <div className="animate-fade-in lg:pl-4" style={{ animationDelay: "0.2s" }}>
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}
