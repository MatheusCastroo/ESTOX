import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockVehicles, formatPrice } from "@/lib/mock-data"
import { Eye, Edit, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function RecentVehicles() {
  const recentVehicles = mockVehicles.slice(0, 5)

  const statusColors = {
    available: "bg-green-100 text-green-800",
    reserved: "bg-yellow-100 text-yellow-800",
    sold: "bg-red-100 text-red-800",
  }

  const statusLabels = {
    available: "Disponível",
    reserved: "Reservado",
    sold: "Vendido",
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-[#424242]">Veículos Recentes</CardTitle>
        <Link href="/dashboard/veiculos">
          <Button variant="outline" size="sm">
            Ver Todos
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E0E0E0]">
                <th className="text-left py-3 px-2 text-sm font-medium text-[#424242]/70">Veículo</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-[#424242]/70">Preço</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-[#424242]/70">Status</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-[#424242]/70">Views</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-[#424242]/70">Ações</th>
              </tr>
            </thead>
            <tbody>
              {recentVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-b border-[#E0E0E0] last:border-0">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={vehicle.images[0] || "/placeholder.svg"}
                        alt={vehicle.model}
                        className="h-10 w-14 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium text-[#424242]">{vehicle.model}</p>
                        <p className="text-sm text-[#424242]/70">
                          {vehicle.brand} • {vehicle.year}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <p className="font-semibold text-[#0D47A1]">{formatPrice(vehicle.price)}</p>
                  </td>
                  <td className="py-3 px-2">
                    <Badge className={statusColors[vehicle.status]}>{statusLabels[vehicle.status]}</Badge>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1 text-[#424242]/70">
                      <Eye className="h-4 w-4" />
                      <span>{Math.floor(Math.random() * 200) + 50}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
