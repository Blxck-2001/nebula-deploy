import { resourceHighlights } from "@/data/recursos";

export function ResourcesHero() {
  return (
    <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            <span className="text-xs font-medium text-violet-300">Recursos</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Tudo para{" "}
            <span className="text-gradient">deploys modernos</span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-slate-400">
            Nebula Deploy reúne deploy automatizado, containers Docker, logs em
            tempo real e controle total — tudo self-hosted, na sua infraestrutura.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {resourceHighlights.map((item) => (
            <div
              key={item.label}
              className="glass-card px-4 py-5 text-center"
            >
              <p className="text-2xl font-bold text-violet-400">{item.value}</p>
              <p className="mt-1 text-xs text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
