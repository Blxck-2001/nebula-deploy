export const resourceHighlights = [
  {
    value: "1 clique",
    label: "para fazer deploy",
  },
  {
    value: "100%",
    label: "self-hosted",
  },
  {
    value: "0",
    label: "vendor lock-in",
  },
  {
    value: "24/7",
    label: "logs em tempo real",
  },
];

export const resourceCategories = [
  {
    id: "deploy",
    title: "Deploy & CI/CD",
    description:
      "Automatize todo o ciclo de entrega, do push ao ambiente de produção.",
    items: [
      {
        icon: "rocket" as const,
        title: "Deploys Automatizados",
        description:
          "Conecte repositórios GitHub e dispare deploys automaticamente a cada push ou merge.",
        tags: ["GitHub", "Webhooks", "Auto-deploy"],
      },
      {
        icon: "gitBranch" as const,
        title: "Deploy por Branch",
        description:
          "Configure ambientes de preview para cada branch e promova builds para produção.",
        tags: ["Preview", "Staging", "Production"],
      },
      {
        icon: "refreshCw" as const,
        title: "Rollback Instantâneo",
        description:
          "Volte para qualquer versão anterior com um clique, sem downtime.",
        tags: ["Histórico", "Versionamento"],
      },
      {
        icon: "zap" as const,
        title: "Builds Paralelos",
        description:
          "Execute múltiplos builds simultaneamente e reduza o tempo de entrega.",
        tags: ["Cache", "Performance"],
      },
    ],
  },
  {
    id: "infra",
    title: "Infraestrutura",
    description:
      "Containers isolados, escaláveis e gerenciados com a simplicidade que você espera.",
    items: [
      {
        icon: "box" as const,
        title: "Containers com Docker",
        description:
          "Build e execução de containers automática, com imagens otimizadas e cache de layers.",
        tags: ["Docker", "Multi-stage"],
      },
      {
        icon: "layers" as const,
        title: "Multi-Ambiente",
        description:
          "Gerencie development, staging e production com configurações isoladas por ambiente.",
        tags: ["Dev", "Staging", "Prod"],
      },
      {
        icon: "globe" as const,
        title: "Domínios & SSL",
        description:
          "Configure domínios customizados com certificados SSL automáticos via Let's Encrypt.",
        tags: ["HTTPS", "DNS", "Custom domains"],
      },
      {
        icon: "cpu" as const,
        title: "Monitoramento de Recursos",
        description:
          "Acompanhe CPU, memória e rede de cada aplicação em tempo real.",
        tags: ["Métricas", "Alertas"],
      },
    ],
  },
  {
    id: "observability",
    title: "Observabilidade",
    description:
      "Visibilidade completa sobre deploys, logs e saúde das suas aplicações.",
    items: [
      {
        icon: "terminal" as const,
        title: "Logs em Tempo Real",
        description:
          "Stream de logs durante builds e runtime, com busca e filtros avançados.",
        tags: ["SSE", "Streaming", "Filtros"],
      },
      {
        icon: "activity" as const,
        title: "Dashboard de Métricas",
        description:
          "Gráficos de deploys, uptime e consumo de recursos na visão geral.",
        tags: ["Recharts", "Analytics"],
      },
      {
        icon: "bell" as const,
        title: "Notificações",
        description:
          "Receba alertas de deploys falhos, builds concluídos e limites de recursos.",
        tags: ["Webhook", "E-mail"],
      },
      {
        icon: "scrollText" as const,
        title: "Histórico de Deploys",
        description:
          "Registro completo de cada deploy com commit, branch, autor e duração.",
        tags: ["Auditoria", "Timeline"],
      },
    ],
  },
  {
    id: "security",
    title: "Segurança & Controle",
    description:
      "Seus dados permanecem na sua infraestrutura, com controle granular de acesso.",
    items: [
      {
        icon: "shield" as const,
        title: "Self-Hosted",
        description:
          "Instale na sua VPS ou datacenter. Nenhum dado sai do seu ambiente.",
        tags: ["Privacidade", "Controle total"],
      },
      {
        icon: "lock" as const,
        title: "Variáveis Secretas",
        description:
          "Gerencie variáveis de ambiente criptografadas por projeto e ambiente.",
        tags: ["Secrets", "Env vars"],
      },
      {
        icon: "users" as const,
        title: "Controle de Acesso",
        description:
          "Defina papéis de administrador, developer e viewer por projeto.",
        tags: ["RBAC", "Permissões"],
      },
      {
        icon: "key" as const,
        title: "Integração GitHub OAuth",
        description:
          "Autenticação segura via OAuth com permissões mínimas necessárias.",
        tags: ["OAuth", "Tokens"],
      },
    ],
  },
];

export const resourceShowcases = [
  {
    icon: "workflow" as const,
    title: "Pipeline completo, do Git ao ar",
    description:
      "Push no GitHub, build automático, testes, deploy e monitoramento — tudo em um fluxo contínuo. Sem YAML complexo, sem configuração manual de servidores.",
    bullets: [
      "Webhook automático no push",
      "Build com Dockerfile ou Nixpacks",
      "Health checks pós-deploy",
      "Rollback com um clique",
    ],
  },
  {
    icon: "monitor" as const,
    title: "Visibilidade total em um só lugar",
    description:
      "Dashboard unificado com métricas de deploy, consumo de recursos e logs streaming. Saiba exatamente o que está acontecendo em cada projeto.",
    bullets: [
      "Gráficos de deploys por dia",
      "CPU e memória em tempo real",
      "Logs com busca e highlight",
      "Feed de atividade recente",
    ],
  },
];

export const integrations = [
  { name: "GitHub", icon: "github" as const },
  { name: "Docker", icon: "box" as const },
  { name: "PostgreSQL", icon: "database" as const },
  { name: "Redis", icon: "server" as const },
  { name: "Node.js", icon: "code" as const },
  { name: "Next.js", icon: "layout" as const },
];
