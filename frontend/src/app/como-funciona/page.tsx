import { MarketingLayout } from '@/components/layout/MarketingLayout'

export default function ComoFuncionaPage() {
  return (
    <MarketingLayout>
      <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-16">
          <div className="lg:col-span-2">
            <h1 className="mb-4 text-3xl font-bold bg-hero-gradient bg-clip-text text-transparent">Como funciona</h1>
            <p className="mb-8 text-slate-400">Visão geral do fluxo de deploy, arquitetura e passos para conectar seu repositório.</p>

            <article className="space-y-8">
              <section id="fluxo" className="glass-card p-6">
                <h2 className="mb-2 text-xl font-semibold bg-hero-gradient bg-clip-text text-transparent">Fluxo de Deploy</h2>
                <p className="text-slate-400">O Nebula Deploy observa seu repositório, cria uma imagem Docker em um runner isolado e executa o container em um host gerenciado. Logs e status são enviados em tempo real para a interface.</p>
              </section>

              <section id="arquitetura" className="glass-card p-6">
                <h2 className="mb-2 text-xl font-semibold bg-hero-gradient bg-clip-text text-transparent">Arquitetura</h2>
                <p className="text-slate-400">Componentes principais: frontend (Next.js), backend API (autenticação e orquestração), workers que executam builds e um repositório de imagens Docker.</p>
              </section>

              <section id="passos" className="glass-card p-6">
                <h2 className="mb-2 text-xl font-semibold bg-hero-gradient bg-clip-text text-transparent">Passo a passo</h2>
                <ol className="ml-4 list-decimal space-y-2 text-slate-400">
                  <li>Crie um projeto na plataforma e conecte o repositório do GitHub.</li>
                  <li>Configure variáveis de ambiente e selecione o branch de deploy.</li>
                  <li>Inicie um deploy manual ou configure deploys automáticos via webhook.</li>
                  <li>Acompanhe logs em tempo real e verifique o status final.</li>
                </ol>
              </section>
            </article>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-4">
              <div className="glass-card p-4">
                <h3 className="mb-2 text-sm font-semibold text-white">Sumário</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#fluxo" className="hover:text-white">Fluxo de Deploy</a></li>
                  <li><a href="#arquitetura" className="hover:text-white">Arquitetura</a></li>
                  <li><a href="#passos" className="hover:text-white">Passo a passo</a></li>
                </ul>
              </div>

              <div className="glass-card p-4">
                <h3 className="mb-2 text-sm font-semibold text-white">Dica</h3>
                <p className="text-sm text-slate-400">Use a seção de documentação para exemplos de configuração avançada.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </MarketingLayout>
  )
}
