import { PlatformDashboard } from '@/components/platform/PlatformDashboard'

export default function AtividadePage() {
  return (
    <div className="min-h-screen bg-nebula-950">
      <PlatformDashboard initialActive="activity" />
    </div>
  )
}
