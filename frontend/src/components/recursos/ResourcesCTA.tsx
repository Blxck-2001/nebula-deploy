import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ResourcesCTA() {
  return (
    <section className="relative py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 via-zinc-900/80 to-indigo-600/10 px-8 py-16 text-center lg:px-16">
          <div className="pointer-events-none absolute inset-0 bg-nebula-gradient opacity-50" />
          <div className="relative">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Pronto para simplificar seus deploys?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              Instale o Nebula Deploy na sua infraestrutura e comece a fazer
              deploy em minutos.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:bg-violet-500"
              >
                Começar agora
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all hover:border-white/20 hover:bg-white/10"
              >
                Voltar ao início
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
