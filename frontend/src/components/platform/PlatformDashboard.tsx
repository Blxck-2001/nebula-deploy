"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
// local sample data removed
import { DeployChart } from "@/components/landing/DeployChart"
import { ResourceChart } from "@/components/landing/ResourceChart"
import { StatsCards } from "@/components/landing/StatsCards"
import { RecentDeploys } from "@/components/landing/RecentDeploys"
import { RecentActivity } from "@/components/landing/RecentActivity"
import { LayoutDashboard, Layers, Cloud, Activity, ChevronLeft, ChevronRight, Terminal, Server, Hash } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/landing/Logo"
import { useState, useEffect, useRef } from "react"
import { triggerDeploy } from '@/lib/deploy'
import { useSSE } from '@/hooks/useRealtime'
import { useAuthStore } from '@/store/authStore'

async function fetchStats() {
  const { data } = await api.get('/api/stats')
  return data
}

async function fetchDeploys() {
  const { data } = await api.get('/api/deploys')
  return data
}

async function fetchResources() {
  const { data } = await api.get('/api/resources')
  return data
}

async function fetchActivity() {
  const { data } = await api.get('/api/activity')
  return data
}

async function fetchProjects() {
  const { data } = await api.get('/api/projects')
  // backend may return an envelope { value: [...] } — normalize to array
  return data?.value ?? data
}

interface PlatformDashboardProps {
  initialActive?: 'overview' | 'projects' | 'deploys' | 'activity' | 'logs' | 'ambientes' | 'variaveis'
}

export function PlatformDashboard({ initialActive }: PlatformDashboardProps) {
  const [useFallback] = useState(false)
  const [active, setActive] = useState<'overview'|'projects'|'deploys'|'activity'|'logs'|'ambientes'|'variaveis'>(initialActive ?? 'overview')
  const [collapsed, setCollapsed] = useState(false)
  // Removed manual scaling by transform; rely on responsive CSS instead

  const statsQuery = useQuery({ queryKey: ['platform','stats'], queryFn: fetchStats, retry: 1 })
  const deploysQuery = useQuery({ queryKey: ['platform','deploys'], queryFn: fetchDeploys, retry: 1 })
  const resourcesQuery = useQuery({ queryKey: ['platform','resources'], queryFn: fetchResources, retry: 1 })
  const activityQuery = useQuery({ queryKey: ['platform','activity'], queryFn: fetchActivity, retry: 1 })
  const projectsQuery = useQuery({ queryKey: ['platform','projects'], queryFn: fetchProjects, retry: 1 })

  const loading = statsQuery.isLoading || deploysQuery.isLoading || resourcesQuery.isLoading || activityQuery.isLoading
  const error = statsQuery.isError || deploysQuery.isError || resourcesQuery.isError || activityQuery.isError

  const stats = statsQuery.data ?? []
  const deploys = deploysQuery.data ?? []
  const resources = resourcesQuery.data ?? []
  const activity = activityQuery.data ?? []
  const projects = projectsQuery.data ?? null

  const sampleLogs: string[] = []

  const [selectedDeployId, setSelectedDeployId] = useState<string | null>(null)
  const [streamLines, setStreamLines] = useState<string[]>([])
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (!selectedDeployId && Array.isArray(deploys) && deploys.length > 0) {
      const first = deploys[0]
      setSelectedDeployId(first.id ?? first.projectId ?? null)
    }
  }, [deploys, selectedDeployId])

  async function fetchLogsFor(id: string | null) {
    if (!id) return []
    const { data } = await api.get(`/api/deploys/${id}/logs`)
    return data
  }

  const logsQuery = useQuery({ queryKey: ['platform','deployLogs', selectedDeployId], queryFn: () => fetchLogsFor(selectedDeployId), enabled: !!selectedDeployId && !useFallback, retry: 1 })

  const sseUrl = selectedDeployId && token && !useFallback ? `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/deploys/${selectedDeployId}/logs/stream?access_token=${token}` : ''
  useSSE({ url: sseUrl, onMessage: (d: any) => {
    // server sends string lines or structured events
    const line = typeof d === 'string' ? d : (d?.data ?? JSON.stringify(d))
    setStreamLines((s) => [...s, line])
  } })

  const environments = [
    { name: 'production', host: 'prod.example.com', status: 'running', last: 'há 5 min' },
    { name: 'staging', host: 'staging.example.com', status: 'running', last: 'há 20 min' },
  ]

  const variables = [
    { key: 'NODE_ENV', value: 'production' },
    { key: 'DATABASE_URL', value: 'postgres://****' },
    { key: 'API_KEY', value: '********' },
  ]

  return (
    <div className="min-h-screen h-full w-full bg-zinc-950 overflow-auto">
      <div className="max-w-full">
        <div className="flex h-full min-h-screen">
          <aside className={`${collapsed ? 'w-16' : 'w-72'} shrink-0 flex flex-col border-r border-white/5 bg-zinc-950/80 transition-all duration-150`}>
            <div className="border-b border-white/5 px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Logo size={collapsed ? 'sm' : 'md'} showText={!collapsed} />
              </div>
              <button
                aria-label="Toggle sidebar"
                onClick={() => setCollapsed((s) => !s)}
                className="text-slate-300 hover:text-white p-1 rounded"
              >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>
            <nav className="flex-1 p-2 sm:p-3">
              <ul className="space-y-1 sm:space-y-2">
                <li>
                  <Link href="/plataforma" className={`w-full flex items-center ${active === 'overview' ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-white/2'} gap-3 rounded-md px-3 py-2 justify-center sm:justify-start`} onClick={() => setActive('overview')}> 
                    <LayoutDashboard size={16} />
                    <span className={`${collapsed ? 'hidden' : 'hidden sm:inline'}`}>Visão geral</span>
                  </Link>
                </li>
                <li>
                  <Link href="/plataforma/projetos" className={`w-full flex items-center ${active === 'projects' ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-white/2'} gap-3 rounded-md px-3 py-2 justify-center sm:justify-start`} onClick={() => setActive('projects')}>
                    <Layers size={16} />
                    <span className={`${collapsed ? 'hidden' : 'hidden sm:inline'}`}>Projetos</span>
                  </Link>
                </li>
                <li>
                  <Link href="/plataforma/deploys" className={`w-full flex items-center ${active === 'deploys' ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-white/2'} gap-3 rounded-md px-3 py-2 justify-center sm:justify-start`} onClick={() => setActive('deploys')}>
                    <Cloud size={16} />
                    <span className={`${collapsed ? 'hidden' : 'hidden sm:inline'}`}>Deploys</span>
                  </Link>
                </li>
                <li>
                  <Link href="/plataforma/logs" className={`w-full flex items-center ${active === 'logs' ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-white/2'} gap-3 rounded-md px-3 py-2 justify-center sm:justify-start`} onClick={() => setActive('logs')}>
                    <Terminal size={16} />
                    <span className={`${collapsed ? 'hidden' : 'hidden sm:inline'}`}>Logs</span>
                  </Link>
                </li>
                <li>
                  <Link href="/plataforma/ambientes" className={`w-full flex items-center ${active === 'ambientes' ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-white/2'} gap-3 rounded-md px-3 py-2 justify-center sm:justify-start`} onClick={() => setActive('ambientes')}>
                    <Server size={16} />
                    <span className={`${collapsed ? 'hidden' : 'hidden sm:inline'}`}>Ambientes</span>
                  </Link>
                </li>
                <li>
                  <Link href="/plataforma/variaveis" className={`w-full flex items-center ${active === 'variaveis' ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-white/2'} gap-3 rounded-md px-3 py-2 justify-center sm:justify-start`} onClick={() => setActive('variaveis')}>
                    <Hash size={16} />
                    <span className={`${collapsed ? 'hidden' : 'hidden sm:inline'}`}>Variáveis</span>
                  </Link>
                </li>
                <li>
                  <Link href="/plataforma/atividade" className={`w-full flex items-center ${active === 'activity' ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-white/2'} gap-3 rounded-md px-3 py-2 justify-center sm:justify-start`} onClick={() => setActive('activity')}>
                    <Activity size={16} />
                    <span className={`${collapsed ? 'hidden' : 'hidden sm:inline'}`}>Atividade</span>
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="border-t border-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-violet-600 text-white grid place-items-center">B</div>
                <div className={`${collapsed ? 'hidden' : 'hidden sm:block'}`}>
                  <p className="text-sm font-medium text-white">Black</p>
                  <p className="text-xs text-slate-500">Administrador</p>
                </div>
              </div>
              {/* Configurações removidas */}
            </div>
          </aside>

          <main className="flex-1 overflow-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">{active === 'overview' ? 'Visão geral' : active === 'projects' ? 'Projetos' : active === 'deploys' ? 'Deploys' : 'Atividade'}</h2>
                <p className="text-sm text-slate-400">{active === 'overview' ? 'Painel em tempo real' : active === 'projects' ? 'Lista de projetos' : active === 'deploys' ? 'Histórico de deploys' : 'Atividade recente'}</p>
              </div>
                <div className="flex items-center gap-3">
                {active === 'projects' && (
                  <Link
                    href="/plataforma/projetos/novo"
                    className="rounded-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-pink-500 shadow-md transition-transform transform hover:scale-105"
                  >
                    Criar Projeto
                  </Link>
                )}
                <button className="rounded bg-violet-600 px-3 py-1 text-sm text-white" onClick={() => { statsQuery.refetch(); deploysQuery.refetch(); resourcesQuery.refetch(); activityQuery.refetch() }}>Atualizar</button>
              </div>
            </div>

            {active === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                  <div className="lg:col-span-3">
                      <StatsCards items={stats} />
                    </div>
                  <div className="lg:col-span-1">
                    <div className="rounded-lg border border-white/5 bg-zinc-900/60 p-4 text-sm text-slate-400">{loading ? 'Carregando...' : error ? 'Erro ao carregar dados' : 'Status atualizado'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <DeployChart data={deploys} />
                  <ResourceChart data={resources} />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <RecentDeploys items={deploys} />
                  <RecentActivity items={activity} />
                </div>
              </div>
            )}

            {active === 'projects' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(() => {
                    if (projects && Array.isArray(projects)) {
                      return projects.map((p: any) => (
                        <div key={p.id} className="rounded-lg border border-white/5 bg-zinc-900/60 p-4 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-medium text-white truncate">{p.name}</h3>
                              <p className="text-sm text-slate-400 truncate">{p.repo}</p>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2">
                              <button
                                aria-label={`Deploy ${p.name}`}
                                className="rounded-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-pink-500 shadow-md transition-all duration-300 transform hover:scale-105 hover:from-pink-500 hover:to-orange-400"
                                onClick={async () => {
                                  try {
                                    await triggerDeploy(p.id)
                                    deploysQuery.refetch()
                                    alert('Deploy enfileirado')
                                  } catch (err) {
                                    alert('Erro ao disparar deploy')
                                  }
                                }}
                              >
                                Deploy
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                    const fallbackProjects = Array.from(new Set(localDeploys.map((d) => d.project))) as string[]
                    return fallbackProjects.map((project) => (
                      <div key={project} className="rounded-lg border border-white/5 bg-zinc-900/60 p-4 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-white truncate">{project}</h3>
                            <p className="text-sm text-slate-400 truncate">Último deploy: {localDeploys.find((d) => d.project === project)?.time}</p>
                          </div>
                          <div className="flex-shrink-0">
                            <button
                              aria-label={`Deploy ${project}`}
                              className="rounded-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-pink-500 shadow-md transition-all duration-300 transform hover:scale-105 hover:from-pink-500 hover:to-orange-400"
                              onClick={async () => {
                                try {
                                  // fallback: no project id available, attempt to trigger by name (backend may not support)
                                  await triggerDeploy(project)
                                  deploysQuery.refetch()
                                  alert('Deploy enfileirado')
                                } catch (err) {
                                  alert('Erro ao disparar deploy')
                                }
                              }}
                            >
                              Deploy
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              </div>
            )}

            {active === 'deploys' && (
              <div className="rounded-lg border border-white/5 bg-zinc-900/60 p-4 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 text-left">
                      <th className="py-2">Projeto</th>
                      <th className="py-2">Branch</th>
                      <th className="py-2">Commit</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(deploys) ? deploys : []).map((d: any) => (
                      <tr key={`${d.project}-${d.commit ?? d.id}`} className="border-t border-white/5">
                        <td className="py-2">{d.project}</td>
                        <td className="py-2">{d.branch}</td>
                        <td className="py-2 font-mono text-slate-300">{d.commit ?? d.id}</td>
                        <td className="py-2"><span className={`px-2 py-1 rounded-full text-[11px] ${d.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{d.status === 'success' ? 'Sucesso' : 'Falhou'}</span></td>
                        <td className="py-2 text-slate-400">{d.time ?? d.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {active === 'activity' && (
              <div>
                <RecentActivity />
              </div>
            )}
            {active === 'logs' && (
              <div>
                <div className="rounded-lg border border-white/5 bg-zinc-900/60 p-4 font-mono text-sm text-slate-300">
                  <div className="mb-3 flex items-center gap-3">
                    <label className="text-sm text-slate-400">Selecionar deploy:</label>
                    <select
                      value={selectedDeployId ?? ''}
                      onChange={(e) => setSelectedDeployId(e.target.value || null)}
                      className="bg-zinc-900 text-white px-2 py-1 rounded"
                    >
                      <option value="">-- nenhum --</option>
                      {(Array.isArray(deploys) ? deploys : []).map((d: any) => (
                        <option key={d.id ?? d.projectId} value={d.id ?? d.projectId}>{`${d.projectName ?? d.project} — ${d.status ?? ''} — ${d.time ? new Date(d.time).toLocaleString() : ''}`}</option>
                      ))}
                    </select>
                      <div className="ml-auto flex items-center gap-2">
                        <button className="rounded bg-white/5 px-3 py-1 text-sm" onClick={() => logsQuery.refetch()}>Recarregar</button>
                        <button
                          className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                          onClick={async () => {
                            if (!selectedDeployId) return alert('Selecione um deploy primeiro')
                            try {
                              await api.delete(`/api/deploys/${selectedDeployId}/logs`)
                              setStreamLines([])
                              logsQuery.refetch()
                              alert('Logs excluídos')
                            } catch (err) {
                              alert('Falha ao excluir logs')
                            }
                          }}
                        >Excluir logs</button>
                      </div>
                  </div>
                  <div className="h-64 overflow-auto whitespace-pre-wrap">
                    {logsQuery.isLoading && <div>Carregando logs...</div>}
                    {logsQuery.isError && <div>Erro ao carregar logs</div>}
                    {!logsQuery.isLoading && !logsQuery.isError && (
                      (streamLines.length > 0
                        ? streamLines
                        : (logsQuery.data && logsQuery.data.length > 0 ? logsQuery.data : [])
                      ).map((l: string, i: number) => (
                        <div key={i} className="py-1">{l}</div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {active === 'ambientes' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {environments.map((env) => (
                  <div key={env.name} className="rounded-lg border border-white/5 bg-zinc-900/60 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">{env.name}</h3>
                        <p className="text-sm text-slate-400">{env.host}</p>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded-full text-[12px] ${env.status === 'running' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{env.status}</div>
                        <div className="text-xs text-slate-500">{env.last}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {active === 'variaveis' && (
              <div className="rounded-lg border border-white/5 bg-zinc-900/60 p-4 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 text-left">
                      <th className="py-2">Chave</th>
                      <th className="py-2">Valor</th>
                      <th className="py-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variables.map((v) => (
                      <tr key={v.key} className="border-t border-white/5">
                        <td className="py-2">{v.key}</td>
                        <td className="py-2 font-mono text-slate-300">{v.value}</td>
                        <td className="py-2">
                          <button className="text-sky-400 text-sm">Editar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
