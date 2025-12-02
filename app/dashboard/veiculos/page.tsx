"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { mockVehicles, formatPrice, formatMileage, type Vehicle } from "@/lib/mock-data"
import { Plus, Search, MoreHorizontal, Edit, Eye, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import Link from "next/link"

export default function VehiclesPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles)

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.brand.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const toggleStatus = (id: string) => {
    setVehicles(
      vehicles.map((v) => {
        if (v.id === id) {
          return {
            ...v,
            status: v.status === "available" ? "sold" : "available",
          }
        }
        return v
      }),
    )
  }

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
    <>
      <DashboardHeader title="Veículos" description="Gerencie seu estoque de veículos" />

      <main className="p-6">
        {/* Toolbar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex flex-1 gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#424242]/50" />
                  <Input
                    placeholder="Buscar veículos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="available">Disponíveis</SelectItem>
                    <SelectItem value="reserved">Reservados</SelectItem>
                    <SelectItem value="sold">Vendidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Link href="/dashboard/veiculos/novo">
                <Button className="bg-[#1A73E8] hover:bg-[#0D47A1]">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Veículo
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F5F5F5]">
                  <tr>
                    <th className="text-left py-4 px-4 text-sm font-medium text-[#424242]/70">Veículo</th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-[#424242]/70">Ano</th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-[#424242]/70">Km</th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-[#424242]/70">Preço</th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-[#424242]/70">Status</th>
                    <th className="text-right py-4 px-4 text-sm font-medium text-[#424242]/70">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="border-b border-[#E0E0E0] hover:bg-[#F5F5F5]/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={vehicle.images[0] || "/placeholder.svg"}
                            alt={vehicle.model}
                            className="h-12 w-16 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-[#424242]">{vehicle.model}</p>
                            <p className="text-sm text-[#424242]/70">{vehicle.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[#424242]">{vehicle.year}</td>
                      <td className="py-4 px-4 text-[#424242]">{formatMileage(vehicle.mileage)}</td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-[#0D47A1]">{formatPrice(vehicle.price)}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={statusColors[vehicle.status]}>{statusLabels[vehicle.status]}</Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/veiculos/${vehicle.id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/catalogo/auto-prime/${vehicle.id}`} target="_blank">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver no Catálogo
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStatus(vehicle.id)}>
                              {vehicle.status === "available" ? (
                                <>
                                  <ToggleLeft className="h-4 w-4 mr-2" />
                                  Marcar como Vendido
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="h-4 w-4 mr-2" />
                                  Marcar como Disponível
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredVehicles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[#424242]/70">Nenhum veículo encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
