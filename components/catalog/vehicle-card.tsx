"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { type Vehicle, formatPrice, formatMileage } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Gauge, Fuel, Settings2 } from "lucide-react"
import Link from "next/link"

interface VehicleCardProps {
  vehicle: Vehicle
  storeSlug: string
  index?: number
}

export function VehicleCard({ vehicle, storeSlug, index = 0 }: VehicleCardProps) {
  const statusConfig = {
    available: { label: "Disponível", variant: "success" as const },
    reserved: { label: "Reservado", variant: "warning" as const },
    sold: { label: "Vendido", variant: "destructive" as const },
  }

  const status = statusConfig[vehicle.status] || statusConfig.available

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/catalogo/${storeSlug}/${vehicle.id}`}>
        <Card
          variant="default"
          padding="none"
          hover
          className="group overflow-hidden h-full flex flex-col"
        >
          {/* Image Container */}
          <div className="relative aspect-video overflow-hidden bg-muted">
            <img
              src={vehicle.images[0] || "/placeholder.svg"}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />

            {/* Status Badge */}
            <div className="absolute top-3 right-3 z-10">
              <Badge variant={status.variant}>
                {status.label}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex-1 flex flex-col">
            {/* Brand & Model */}
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                {vehicle.brand}
              </p>
              <h3 className="text-lg font-medium text-foreground line-clamp-2">
                {vehicle.model}
              </h3>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4 flex-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                <span>{vehicle.year}</span>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="h-3.5 w-3.5" />
                <span>{formatMileage(vehicle.mileage)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Fuel className="h-3.5 w-3.5" />
                <span>{vehicle.fuel}</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings2 className="h-3.5 w-3.5" />
                <span>{vehicle.transmission}</span>
              </div>
            </div>

            {/* Price */}
            <div className="pt-4 border-t border-border">
              <p className="text-2xl font-medium text-foreground">
                {formatPrice(vehicle.price)}
              </p>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}
