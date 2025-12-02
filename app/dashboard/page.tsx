import { DashboardHeader } from "@/components/dashboard/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentVehicles } from "@/components/dashboard/recent-vehicles"
import { RecentLeads } from "@/components/dashboard/recent-leads"

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader title="Dashboard" description="Visão geral do seu estoque e performance" />

      <main className="p-6 space-y-6">
        <StatsCards />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentVehicles />
          </div>
          <div>
            <RecentLeads />
          </div>
        </div>
      </main>
    </>
  )
}
