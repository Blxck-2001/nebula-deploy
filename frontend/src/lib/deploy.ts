import api from './axios'

export async function triggerDeploy(projectId: string, commit?: string) {
  const body: any = {}
  if (commit) body.commit = commit
  const { data } = await api.post(`/api/projects/${projectId}/deploy`, body)
  return data
}
