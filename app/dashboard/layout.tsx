import type React from "react"
import { Sidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="lg:pl-64 pt-14 lg:pt-0">{children}</div>
    </div>
  )
}
