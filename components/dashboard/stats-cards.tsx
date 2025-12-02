import { Card, CardContent } from "@/components/ui/card"
import { Car, Eye, MessageCircle, TrendingUp } from "lucide-react"

const stats = [
  {
    title: "Veículos Ativos",
    value: "24",
    change: "+3 este mês",
    changeType: "positive",
    icon: Car,
    color: "bg-[#1A73E8]",
  },
  {
    title: "Visualizações",
    value: "1.284",
    change: "+12% vs mês anterior",
    changeType: "positive",
    icon: Eye,
    color: "bg-[#0D47A1]",
  },
  {
    title: "Leads Gerados",
    value: "47",
    change: "+8 esta semana",
    changeType: "positive",
    icon: MessageCircle,
    color: "bg-green-600",
  },
  {
    title: "Taxa de Conversão",
    value: "3.6%",
    change: "+0.5% vs mês anterior",
    changeType: "positive",
    icon: TrendingUp,
    color: "bg-orange-500",
  },
]

export function StatsCards() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#424242]/70">{stat.title}</p>
                <p className="text-3xl font-bold text-[#424242] mt-1">{stat.value}</p>
                <p className="text-sm text-green-600 mt-2">{stat.change}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
