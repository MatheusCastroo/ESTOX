import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Eye, MessageCircle, TrendingUp, ArrowUp, ArrowDown } from "lucide-react"

export default function ReportsPage() {
  const topVehicles = [
    { name: "Honda Civic Touring", views: 245, leads: 12 },
    { name: "Toyota Corolla Cross", views: 198, leads: 8 },
    { name: "Jeep Compass Limited", views: 176, leads: 7 },
    { name: "VW T-Cross Highline", views: 154, leads: 5 },
    { name: "Fiat Pulse Impetus", views: 132, leads: 4 },
  ]

  const monthlyStats = [
    { month: "Jan", views: 980, leads: 32 },
    { month: "Fev", views: 1120, leads: 41 },
    { month: "Mar", views: 1284, leads: 47 },
  ]

  return (
    <>
      <DashboardHeader title="Relatórios" description="Acompanhe a performance do seu estoque" />

      <main className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#424242]/70">Total de Views</p>
                  <p className="text-3xl font-bold text-[#424242]">3.384</p>
                  <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                    <ArrowUp className="h-3 w-3" />
                    <span>15% vs mês anterior</span>
                  </div>
                </div>
                <div className="bg-[#E3F2FD] p-3 rounded-lg">
                  <Eye className="h-6 w-6 text-[#1A73E8]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#424242]/70">Leads Totais</p>
                  <p className="text-3xl font-bold text-[#424242]">120</p>
                  <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                    <ArrowUp className="h-3 w-3" />
                    <span>8% vs mês anterior</span>
                  </div>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#424242]/70">Veículos Vendidos</p>
                  <p className="text-3xl font-bold text-[#424242]">8</p>
                  <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <ArrowDown className="h-3 w-3" />
                    <span>2 vs mês anterior</span>
                  </div>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Car className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#424242]/70">Taxa de Conversão</p>
                  <p className="text-3xl font-bold text-[#424242]">3.5%</p>
                  <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                    <ArrowUp className="h-3 w-3" />
                    <span>0.3% vs mês anterior</span>
                  </div>
                </div>
                <div className="bg-[#0D47A1]/10 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-[#0D47A1]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Vehicles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#424242]">Veículos Mais Visualizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topVehicles.map((vehicle, i) => (
                  <div key={vehicle.name} className="flex items-center gap-4">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#E3F2FD] text-[#1A73E8] font-semibold text-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#424242]">{vehicle.name}</p>
                      <div className="flex items-center gap-4 text-sm text-[#424242]/70">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {vehicle.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> {vehicle.leads} leads
                        </span>
                      </div>
                    </div>
                    <div className="w-24 bg-[#E3F2FD] rounded-full h-2">
                      <div
                        className="bg-[#1A73E8] h-2 rounded-full"
                        style={{ width: `${(vehicle.views / 245) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#424242]">Evolução Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {monthlyStats.map((stat) => (
                  <div key={stat.month} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-[#424242]">{stat.month} 2024</span>
                      <span className="text-[#424242]/70">
                        {stat.views} views / {stat.leads} leads
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-[#E3F2FD] rounded-full h-3">
                        <div
                          className="bg-[#1A73E8] h-3 rounded-full"
                          style={{ width: `${(stat.views / 1500) * 100}%` }}
                        />
                      </div>
                      <div className="w-20 bg-green-100 rounded-full h-3">
                        <div
                          className="bg-green-600 h-3 rounded-full"
                          style={{ width: `${(stat.leads / 50) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-6 mt-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#1A73E8]" />
                  <span className="text-[#424242]/70">Visualizações</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-600" />
                  <span className="text-[#424242]/70">Leads</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
