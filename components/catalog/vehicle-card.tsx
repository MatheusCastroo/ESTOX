import { type Vehicle, formatPrice, formatMileage } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Gauge, Fuel, Settings2 } from "lucide-react"
import Link from "next/link"

interface VehicleCardProps {
  vehicle: Vehicle
  storeSlug: string
}

export function VehicleCard({ vehicle, storeSlug }: VehicleCardProps) {
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
    <Link href={`/catalogo/${storeSlug}/${vehicle.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#F5F5F5]">
          <img
            src={vehicle.images[0] || "/placeholder.svg"}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Badge className={`absolute top-3 right-3 ${statusColors[vehicle.status]}`}>
            {statusLabels[vehicle.status]}
          </Badge>
        </div>

        <CardContent className="p-4">
          <div className="mb-2">
            <p className="text-sm text-[#1A73E8] font-medium">{vehicle.brand}</p>
            <h3 className="text-lg font-semibold text-[#424242] line-clamp-1">{vehicle.model}</h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-[#424242]/70 mb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{vehicle.year}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className="h-4 w-4" />
              <span>{formatMileage(vehicle.mileage)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="h-4 w-4" />
              <span>{vehicle.fuel}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Settings2 className="h-4 w-4" />
              <span>{vehicle.transmission}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E0E0E0]">
            <p className="text-2xl font-bold text-[#0D47A1]">{formatPrice(vehicle.price)}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
