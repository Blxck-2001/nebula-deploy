import { MarketingLayout } from '@/components/layout/MarketingLayout'

export default function DocumentacaoPage() {
  return (
    <MarketingLayout>
      <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-16">
          <div className="lg:col-span-2">
            <h1 className="mb-4 text-3xl font-bold bg-hero-gradient bg-clip-text text-transparent">Documentação</h1>
            <p className="mb-8 text-slate-400">Aqui estão os guias e a referência para usar o Nebula Deploy.</p>

            <article className="space-y-8">
              <section className="glass-card p-6">
                <h2 className="mb-2 text-xl font-semibold bg-hero-gradient bg-clip-text text-transparent">Começando</h2>
                <p className="text-slate-400">Instale o servidor backend, configure o `NEXT_PUBLIC_API_URL` e conecte seu repositório do GitHub.</p>
              </section>

              <section className="glass-card p-6">
                <h2 className="mb-2 text-xl font-semibold bg-hero-gradient bg-clip-text text-transparent">Workflows de Deploy</h2>
                <p className="text-slate-400">Crie projetos, conecte branches e configure variáveis de ambiente. O processo de build e execução acontece em containers Docker isolados.</p>
              </section>

              <section className="glass-card p-6">
                <h2 className="mb-2 text-xl font-semibold bg-hero-gradient bg-clip-text text-transparent">API</h2>
                <p className="text-slate-400">A API expõe endpoints para criar projetos, iniciar deploys e acompanhar logs. Use o token JWT retornado no login para autenticar chamadas.</p>
              </section>
            </article>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-4">
              <div className="glass-card p-4">
                <h3 className="mb-2 text-sm font-semibold text-white">Sumário</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#comecando" className="hover:text-white">Começando</a></li>
                  <li><a href="#workflows" className="hover:text-white">Workflows de Deploy</a></li>
                  <li><a href="#api" className="hover:text-white">API</a></li>
                </ul>
              </div>

              <div className="glass-card p-4">
                <h3 className="mb-2 text-sm font-semibold text-white">Recursos</h3>
                <p className="text-sm text-slate-400">Consulte também a seção de <a href="/recursos" className="text-violet-400 hover:text-violet-300">Recursos</a> para integrações e exemplos.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </MarketingLayout>
  )
}
