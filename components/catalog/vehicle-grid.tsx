"use client"

import * as React from "react"
import { motion } from "framer-motion"
import type { Vehicle } from "@/lib/mock-data"
import { VehicleCard } from "./vehicle-card"
import { Car } from "lucide-react"

interface VehicleGridProps {
  vehicles: Vehicle[]
  storeSlug: string
}

export function VehicleGrid({ vehicles, storeSlug }: VehicleGridProps) {
  if (vehicles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-20"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6"
        >
          <Car className="h-12 w-12 text-muted-foreground" />
        </motion.div>
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Nenhum veículo encontrado
        </h3>
        <p className="text-muted-foreground">
          Tente ajustar os filtros para ver mais resultados
        </p>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {vehicles.map((vehicle, index) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          storeSlug={storeSlug}
          index={index}
        />
      ))}
    </div>
  )
}
