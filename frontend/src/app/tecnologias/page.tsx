import { MarketingLayout } from '@/components/layout/MarketingLayout'

export default function TecnologiasPage() {
  return (
    <MarketingLayout>
      <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-16">
          <div className="lg:col-span-2">
            <h1 className="mb-4 text-3xl font-bold text-white">Tecnologias</h1>
            <p className="mb-8 text-slate-400">Lista das tecnologias usadas no projeto, incluindo frontend, backend, infraestrutura e ferramentas auxiliares.</p>

            <article className="space-y-8">
              <section className="glass-card p-6">
                <h2 className="mb-2 text-xl font-semibold bg-hero-gradient bg-clip-text text-transparent">Frontend</h2>
                <ul className="list-disc pl-5 text-slate-400">
                  <li>Next.js (App Router) — renderização híbrida e rotas.</li>
                  <li>React & TypeScript — componentes e tipagem estática.</li>
                  <li>Tailwind CSS — utilitários e tema customizado (nebula colors).</li>
                  <li>@tanstack/react-query — estado de servidor e cache.</li>
                  <li>Zustand — estado cliente persistente (auth store).</li>
                  <li>Axios — cliente HTTP com interceptors JWT.</li>
                  <li>Lucide & Recharts — ícones e visualização de dados.</li>
                </ul>
              </section>

              <section className="glass-card p-6">
                <h2 className="mb-2 text-xl font-semibold bg-hero-gradient bg-clip-text text-transparent">Backend / Workers</h2>
                <ul className="list-disc pl-5 text-slate-400">
                  <li>Node.js — runtime para API e workers.</li>
                  <li>Express / Fastify (API REST) — autenticação, orquestração e endpoints.</li>
                  <li>Workers independentes — processos que constroem imagens Docker e executam containers.</li>
                  <li>JWT — autenticação por token para API e cliente.</li>
                  <li>WebSocket / Server-Sent Events — streaming de logs e eventos em tempo real.</li>
                  <li>Docker & Docker Compose — construção e execução de containers para builds e runtime.</li>
                </ul>
              </section>

              <section className="glass-card p-6">
                <h2 className="mb-2 text-xl font-semibold bg-hero-gradient bg-clip-text text-transparent">Infra & Ferramentas</h2>
                <ul className="list-disc pl-5 text-slate-400">
                  <li>GitHub — repositórios e webhooks para disparar deploys.</li>
                  <li>Docker Registry / imagens — armazenamento de imagens geradas.</li>
                  <li>nginx / proxy reverso (opcional) — roteamento de tráfego para containers.</li>
                  <li>PM2 / systemd — orquestração de processos em servidores (ops).</li>
                  <li>CI/CD — pipelines opcionais para builds e testes.</li>
                </ul>
              </section>

              
            </article>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-4">
              <div className="glass-card p-4">
                <h3 className="mb-2 text-sm font-semibold text-white">Sumário</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#frontend" className="hover:text-white">Frontend</a></li>
                  <li><a href="#backend" className="hover:text-white">Backend / Workers</a></li>
                  <li><a href="#infra" className="hover:text-white">Infra & Ferramentas</a></li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </MarketingLayout>
  )
}
