"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import api from '@/lib/axios'
import { Plus, Trash } from 'lucide-react'

type EnvRow = { key: string; value: string }

export default function NewProjectPage() {
  const router = useRouter()
  const { register, handleSubmit } = useForm()
  const [envs, setEnvs] = useState<EnvRow[]>([{ key: '', value: '' }])
  const [autoDeploy, setAutoDeploy] = useState(true)
  const [saving, setSaving] = useState(false)

  function addEnv() {
    setEnvs((s) => [...s, { key: '', value: '' }])
  }
  function removeEnv(i: number) {
    setEnvs((s) => s.filter((_, idx) => idx !== i))
  }
  function updateEnv(i: number, k: string, v: string) {
    setEnvs((s) => s.map((row, idx) => idx === i ? { key: k, value: v } : row))
  }

  async function onSubmit(data: any) {
    setSaving(true)
    try {
      const body: any = {
        name: data.name,
        repo: data.repo,
        branch: data.branch || 'main',
        port: Number(data.port) || 3000,
        // include dockerfilePath and env though backend may ignore unknown fields
        dockerfilePath: data.dockerfilePath || 'Dockerfile',
        env: Object.fromEntries(envs.filter(e => e.key).map(e => [e.key, e.value]))
      }
      const resp = await api.post('/api/projects', body)
      const project = resp.data?.project ?? resp.data
      if (autoDeploy && project?.id) {
        try { await api.post(`/api/projects/${project.id}/deploy`, {}) } catch (e) { /* ignore */ }
      }
      router.push('/plataforma/projetos')
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert('Erro ao criar projeto')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto rounded-lg border border-white/5 bg-zinc-900/60 p-6">
        <h1 className="text-2xl font-semibold text-white mb-4">Criar Projeto</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300">Nome do projeto</label>
            <input {...register('name')} required placeholder="Astro Blog" className="w-full rounded px-3 py-2 bg-white/5 text-white" />
          </div>

          <div>
            <label className="block text-sm text-slate-300">Repositório (URL do GitHub)</label>
            <input {...register('repo')} required placeholder="https://github.com/usuario/astro-blog" className="w-full rounded px-3 py-2 bg-white/5 text-white" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300">Branch</label>
              <input {...register('branch')} placeholder="main" className="w-full rounded px-3 py-2 bg-white/5 text-white" />
            </div>
            <div>
              <label className="block text-sm text-slate-300">Caminho do Dockerfile</label>
              <input {...register('dockerfilePath')} placeholder="Dockerfile" className="w-full rounded px-3 py-2 bg-white/5 text-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300">Porta da aplicação</label>
            <input {...register('port')} placeholder="3000" type="number" className="w-32 rounded px-3 py-2 bg-white/5 text-white" />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Variáveis de ambiente</label>
            <div className="space-y-2">
              {envs.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <input value={row.key} onChange={(e) => updateEnv(i, e.target.value, row.value)} placeholder="NOME" className="w-1/3 rounded px-2 py-1 bg-white/5 text-white" />
                  <input value={row.value} onChange={(e) => updateEnv(i, row.key, e.target.value)} placeholder="Valor" className="flex-1 rounded px-2 py-1 bg-white/5 text-white font-mono" />
                  <button type="button" onClick={() => removeEnv(i)} className="text-red-400 p-1"><Trash size={16} /></button>
                </div>
              ))}
              <button type="button" onClick={addEnv} className="inline-flex items-center gap-2 text-sm text-slate-300"><Plus size={14}/> Adicionar variável</button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input id="autoDeploy" type="checkbox" checked={autoDeploy} onChange={(e) => setAutoDeploy(e.target.checked)} className="w-4 h-4" />
            <label htmlFor="autoDeploy" className="text-sm text-slate-300">Fazer deploy após criar</label>
          </div>

          <div className="flex items-center gap-2">
            <button disabled={saving} type="submit" className="rounded bg-violet-600 px-4 py-2 text-white">{saving ? 'Salvando...' : 'Criar Projeto'}</button>
            <button type="button" onClick={() => router.push('/plataforma/projetos')} className="rounded bg-white/5 px-4 py-2 text-sm">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
