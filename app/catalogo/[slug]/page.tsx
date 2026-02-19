"use client"

import { use, useState, useEffect } from "react"
import { CatalogHeader } from "@/components/catalog/catalog-header"
import { VehicleFilters, type FilterState, initialFilters } from "@/components/catalog/vehicle-filters"
import { VehicleGrid } from "@/components/catalog/vehicle-grid"
import { Footer } from "@/components/landing/footer"
import { getPublicStore, getPublicVehicles, ApiError } from "@/lib/api/client"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function CatalogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [store, setStore] = useState<any>(null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        
        const [storeData, vehiclesData] = await Promise.all([
          getPublicStore(slug),
          getPublicVehicles(slug, {
            status: 'available',
            ...(filters.brand && filters.brand !== 'all' && { brand: filters.brand }),
            ...(filters.minPrice && { minPrice: Number.parseInt(filters.minPrice) }),
            ...(filters.maxPrice && { maxPrice: Number.parseInt(filters.maxPrice) }),
            ...(filters.minYear && filters.minYear !== 'all' && { minYear: Number.parseInt(filters.minYear) }),
            ...(filters.transmission && filters.transmission !== 'all' && { transmission: filters.transmission }),
            ...(filters.search && { search: filters.search }),
          })
        ])
        
        setStore(storeData)
        setVehicles(vehiclesData.vehicles || [])
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError('Erro ao carregar dados. Tente novamente.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [slug, filters])

  return (
    <div className="min-h-screen bg-background">
      {loading ? (
        <>
          <div className="border-b border-border bg-card">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
              <Skeleton className="h-12 w-64 mb-4" />
              <Skeleton className="h-6 w-96" />
            </div>
          </div>
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          </main>
        </>
      ) : error ? (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      ) : store ? (
        <>
          <CatalogHeader store={store} />
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">Veículos Disponíveis</h2>
              <p className="text-muted-foreground mt-1">
                {vehicles.length} veículo{vehicles.length !== 1 ? "s" : ""} encontrado
                {vehicles.length !== 1 ? "s" : ""}
              </p>
            </div>

            <VehicleFilters filters={filters} onFilterChange={setFilters} />
            <VehicleGrid vehicles={vehicles} storeSlug={slug} />
          </main>
          <Footer />
        </>
      ) : null}
    </div>
  )
}
