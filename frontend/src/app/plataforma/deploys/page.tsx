import { PlatformDashboard } from '@/components/platform/PlatformDashboard'

export default function DeploysPage() {
  return (
    <div className="min-h-screen bg-nebula-950">
      <PlatformDashboard initialActive="deploys" />
    </div>
  )
}
