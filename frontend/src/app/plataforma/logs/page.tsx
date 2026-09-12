import { PlatformDashboard } from '@/components/platform/PlatformDashboard'

export default function LogsPage() {
  return (
    <div className="min-h-screen bg-nebula-950">
      <PlatformDashboard initialActive="logs" />
    </div>
  )
}
