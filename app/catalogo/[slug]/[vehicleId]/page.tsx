import { CatalogHeader } from "@/components/catalog/catalog-header"
import { VehicleDetail } from "@/components/catalog/vehicle-detail"
import { Footer } from "@/components/landing/footer"
import { mockStore, mockVehicles } from "@/lib/mock-data"
import { notFound } from "next/navigation"

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ slug: string; vehicleId: string }>
}) {
  const { vehicleId } = await params

  const vehicle = mockVehicles.find((v) => v.id === vehicleId)

  if (!vehicle) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <CatalogHeader store={mockStore} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <VehicleDetail vehicle={vehicle} store={mockStore} />
      </main>

      <Footer />
    </div>
  )
}
