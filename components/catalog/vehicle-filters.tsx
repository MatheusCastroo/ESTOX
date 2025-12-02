"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { brands } from "@/lib/mock-data"
import { useState } from "react"

interface VehicleFiltersProps {
  onFilterChange: (filters: FilterState) => void
  filters: FilterState
}

export interface FilterState {
  search: string
  brand: string
  minPrice: string
  maxPrice: string
  minYear: string
  maxYear: string
  transmission: string
}

export const initialFilters: FilterState = {
  search: "",
  brand: "",
  minPrice: "",
  maxPrice: "",
  minYear: "",
  maxYear: "",
  transmission: "",
}

export function VehicleFilters({ onFilterChange, filters }: VehicleFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i)

  const handleChange = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFilterChange(initialFilters)
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== "")

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#424242]/50" />
          <Input
            placeholder="Buscar por marca, modelo..."
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? "bg-[#E3F2FD] border-[#1A73E8]" : ""}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtros
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="text-[#1A73E8]">
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4 pt-4 border-t border-[#E0E0E0]">
          <div>
            <Label className="text-[#424242] mb-1.5 block">Marca</Label>
            <Select value={filters.brand} onValueChange={(v) => handleChange("brand", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-[#424242] mb-1.5 block">Preço Mínimo</Label>
            <Input
              type="number"
              placeholder="R$ 0"
              value={filters.minPrice}
              onChange={(e) => handleChange("minPrice", e.target.value)}
            />
          </div>

          <div>
            <Label className="text-[#424242] mb-1.5 block">Preço Máximo</Label>
            <Input
              type="number"
              placeholder="R$ 999.999"
              value={filters.maxPrice}
              onChange={(e) => handleChange("maxPrice", e.target.value)}
            />
          </div>

          <div>
            <Label className="text-[#424242] mb-1.5 block">Ano Mínimo</Label>
            <Select value={filters.minYear} onValueChange={(v) => handleChange("minYear", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-[#424242] mb-1.5 block">Câmbio</Label>
            <Select value={filters.transmission} onValueChange={(v) => handleChange("transmission", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Automático">Automático</SelectItem>
                <SelectItem value="Manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
