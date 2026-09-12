export const deploysPerDay = [
  { day: "Seg", deploys: 0 },
  { day: "Ter", deploys: 1 },
  { day: "Qua", deploys: 0 },
  { day: "Qui", deploys: 2 },
  { day: "Sex", deploys: 1 },
  { day: "Sáb", deploys: 1 },
  { day: "Dom", deploys: 1 },
];

export const resourceUsage = [
  { time: "00h", cpu: 22, memory: 45 },
  { time: "04h", cpu: 18, memory: 42 },
  { time: "08h", cpu: 35, memory: 58 },
  { time: "12h", cpu: 48, memory: 62 },
  { time: "16h", cpu: 52, memory: 55 },
  { time: "20h", cpu: 38, memory: 50 },
  { time: "24h", cpu: 28, memory: 44 },
];

export const statsCards = [
  {
    title: "Projetos",
    value: "3",
    trend: "",
    icon: "folder" as const,
  },
  {
    title: "Deploys",
    value: "6",
    trend: "",
    icon: "check" as const,
  },
  {
    title: "Deploys na fila",
    value: "0",
    trend: "",
    icon: "rocket" as const,
  },
  {
    title: "Deploys com sucesso",
    value: "0",
    trend: "",
    icon: "check" as const,
  },
];

export const recentDeploys = [
  {
    project: "astro-blog",
    branch: "main",
    commit: "a3f2c1d",
    status: "success" as const,
    time: "há 2 min",
  },
  {
    project: "api-gateway",
    branch: "develop",
    commit: "b7e4f9a",
    status: "success" as const,
    time: "há 15 min",
  },
  {
    project: "frontend-app",
    branch: "main",
    commit: "c1d8e2f",
    status: "failed" as const,
    time: "há 1 hora",
  },
  {
    project: "worker-service",
    branch: "main",
    commit: "d9a3b7c",
    status: "success" as const,
    time: "há 3 horas",
  },
];

export const recentActivity = [
  {
    type: "deploy" as const,
    message: "Novo deploy em astro-blog",
    time: "há 2 min",
  },
  {
    type: "update" as const,
    message: "Projeto api-gateway atualizado",
    time: "há 20 min",
  },
  {
    type: "deploy" as const,
    message: "Deploy falhou em frontend-app",
    time: "há 1 hora",
  },
  {
    type: "env" as const,
    message: "Variável de ambiente alterada",
    time: "há 2 horas",
  },
];

export const features = [
  {
    icon: "rocket" as const,
    title: "Deploys Automatizados",
    description:
      "Conecte seu repositório e faça deploy com apenas um clique.",
  },
  {
    icon: "box" as const,
    title: "Containers com Docker",
    description:
      "Build e execução de containers de forma automática e isolada.",
  },
  {
    icon: "terminal" as const,
    title: "Logs em Tempo Real",
    description:
      "Acompanhe todo o processo de deploy com logs em tempo real.",
  },
  {
    icon: "shield" as const,
    title: "Seguro e Privado",
    description:
      "Plataforma self-hosted: você tem total controle sobre seus dados.",
  },
];
