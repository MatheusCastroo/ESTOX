import type { Vehicle } from "@/lib/mock-data"
import { VehicleCard } from "./vehicle-card"

interface VehicleGridProps {
  vehicles: Vehicle[]
  storeSlug: string
}

export function VehicleGrid({ vehicles, storeSlug }: VehicleGridProps) {
  if (vehicles.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-[#E3F2FD] rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">🚗</span>
        </div>
        <h3 className="text-xl font-semibold text-[#424242] mb-2">Nenhum veículo encontrado</h3>
        <p className="text-[#424242]/70">Tente ajustar os filtros para ver mais resultados</p>
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} storeSlug={storeSlug} />
      ))}
    </div>
  )
}
