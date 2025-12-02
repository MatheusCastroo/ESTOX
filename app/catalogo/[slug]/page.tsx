"use client"

import { use, useState, useMemo } from "react"
import { CatalogHeader } from "@/components/catalog/catalog-header"
import { VehicleFilters, type FilterState, initialFilters } from "@/components/catalog/vehicle-filters"
import { VehicleGrid } from "@/components/catalog/vehicle-grid"
import { mockStore, mockVehicles } from "@/lib/mock-data"
import { Footer } from "@/components/landing/footer"

export default function CatalogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [filters, setFilters] = useState<FilterState>(initialFilters)

  // Filter vehicles based on current filters
  const filteredVehicles = useMemo(() => {
    return mockVehicles.filter((vehicle) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          vehicle.brand.toLowerCase().includes(searchLower) || vehicle.model.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Brand filter
      if (filters.brand && filters.brand !== "all" && vehicle.brand !== filters.brand) {
        return false
      }

      // Price filters
      if (filters.minPrice && vehicle.price < Number.parseInt(filters.minPrice)) {
        return false
      }
      if (filters.maxPrice && vehicle.price > Number.parseInt(filters.maxPrice)) {
        return false
      }

      // Year filter
      if (filters.minYear && filters.minYear !== "all" && vehicle.year < Number.parseInt(filters.minYear)) {
        return false
      }

      // Transmission filter
      if (filters.transmission && filters.transmission !== "all" && vehicle.transmission !== filters.transmission) {
        return false
      }

      return true
    })
  }, [filters])

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <CatalogHeader store={mockStore} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#424242]">Veículos Disponíveis</h2>
          <p className="text-[#424242]/70 mt-1">
            {filteredVehicles.length} veículo{filteredVehicles.length !== 1 ? "s" : ""} encontrado
            {filteredVehicles.length !== 1 ? "s" : ""}
          </p>
        </div>

        <VehicleFilters filters={filters} onFilterChange={setFilters} />
        <VehicleGrid vehicles={filteredVehicles} storeSlug={slug} />
      </main>

      <Footer />
    </div>
  )
}
