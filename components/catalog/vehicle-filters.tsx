"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, SlidersHorizontal, X, Filter } from "lucide-react"
import { brands } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"

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

export function VehicleFilters({
  onFilterChange,
  filters,
}: VehicleFiltersProps) {
  const [showFilters, setShowFilters] = React.useState(false)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i)

  const handleChange = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFilterChange(initialFilters)
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== "" && v !== "all")

  return (
    <Card variant="default" padding="md" className="mb-8">
      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por marca, modelo..."
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            className="pl-12 h-12"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 bg-primary/20 rounded-full text-xs font-semibold">
                {Object.values(filters).filter((v) => v !== "" && v !== "all").length}
              </span>
            )}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-primary hover:text-primary-hover"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Advanced filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-6 pt-6 border-t border-border">
              <div>
                <Label className="text-foreground mb-2 block font-medium">
                  Marca
                </Label>
                <Select
                  value={filters.brand || "all"}
                  onValueChange={(v) => handleChange("brand", v === "all" ? "" : v)}
                >
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
                <Label className="text-foreground mb-2 block font-medium">
                  Preço Mínimo
                </Label>
                <Input
                  type="number"
                  placeholder="R$ 0"
                  value={filters.minPrice}
                  onChange={(e) => handleChange("minPrice", e.target.value)}
                />
              </div>

              <div>
                <Label className="text-foreground mb-2 block font-medium">
                  Preço Máximo
                </Label>
                <Input
                  type="number"
                  placeholder="R$ 999.999"
                  value={filters.maxPrice}
                  onChange={(e) => handleChange("maxPrice", e.target.value)}
                />
              </div>

              <div>
                <Label className="text-foreground mb-2 block font-medium">
                  Ano Mínimo
                </Label>
                <Select
                  value={filters.minYear || "all"}
                  onValueChange={(v) => handleChange("minYear", v === "all" ? "" : v)}
                >
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
                <Label className="text-foreground mb-2 block font-medium">
                  Câmbio
                </Label>
                <Select
                  value={filters.transmission || "all"}
                  onValueChange={(v) =>
                    handleChange("transmission", v === "all" ? "" : v)
                  }
                >
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
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
