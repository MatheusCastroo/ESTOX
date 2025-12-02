"use client"

import { type Vehicle, type Store, formatPrice, formatMileage } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calendar,
  Gauge,
  Fuel,
  Settings2,
  Palette,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface VehicleDetailProps {
  vehicle: Vehicle
  store: Store
}

export function VehicleDetail({ vehicle, store }: VehicleDetailProps) {
  const [currentImage, setCurrentImage] = useState(0)

  const whatsappMessage = encodeURIComponent(
    `Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model} ${vehicle.year} anunciado por ${formatPrice(vehicle.price)}. Poderia me dar mais informações?`,
  )
  const whatsappUrl = `https://wa.me/${store.whatsapp}?text=${whatsappMessage}`

  const specs = [
    { icon: Calendar, label: "Ano", value: vehicle.year },
    { icon: Gauge, label: "Quilometragem", value: formatMileage(vehicle.mileage) },
    { icon: Fuel, label: "Combustível", value: vehicle.fuel },
    { icon: Settings2, label: "Câmbio", value: vehicle.transmission },
    { icon: Palette, label: "Cor", value: vehicle.color },
  ]

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Image gallery */}
      <div className="lg:col-span-2">
        <div className="relative aspect-[16/10] bg-[#F5F5F5] rounded-xl overflow-hidden mb-4">
          <img
            src={vehicle.images[currentImage] || "/placeholder.svg"}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />

          {vehicle.images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImage((prev) => (prev === 0 ? vehicle.images.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg"
              >
                <ChevronLeft className="h-6 w-6 text-[#424242]" />
              </button>
              <button
                onClick={() => setCurrentImage((prev) => (prev === vehicle.images.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg"
              >
                <ChevronRight className="h-6 w-6 text-[#424242]" />
              </button>
            </>
          )}
        </div>

        {/* Vehicle info */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[#1A73E8] font-medium">{vehicle.brand}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#424242]">{vehicle.model}</h1>
            </div>
            <Badge
              className={
                vehicle.status === "available"
                  ? "bg-green-100 text-green-800"
                  : vehicle.status === "reserved"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }
            >
              {vehicle.status === "available" ? "Disponível" : vehicle.status === "reserved" ? "Reservado" : "Vendido"}
            </Badge>
          </div>

          <p className="text-3xl font-bold text-[#0D47A1] mb-6">{formatPrice(vehicle.price)}</p>

          {/* Specs grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            {specs.map((spec) => (
              <div key={spec.label} className="bg-[#F5F5F5] rounded-lg p-3 text-center">
                <spec.icon className="h-5 w-5 mx-auto text-[#1A73E8] mb-1" />
                <p className="text-xs text-[#424242]/70">{spec.label}</p>
                <p className="font-semibold text-[#424242]">{spec.value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-[#424242] mb-2">Descrição</h3>
            <p className="text-[#424242]/80">{vehicle.description}</p>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold text-[#424242] mb-3">Opcionais</h3>
            <div className="flex flex-wrap gap-2">
              {vehicle.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-1.5 bg-[#E3F2FD] text-[#0D47A1] px-3 py-1.5 rounded-full text-sm"
                >
                  <Check className="h-4 w-4" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact sidebar */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="text-[#424242]">Fale com a Loja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-[#424242]">{store.name}</h4>
              <div className="flex items-center gap-2 text-sm text-[#424242]/70 mt-1">
                <MapPin className="h-4 w-4" />
                <span>
                  {store.address}, {store.city} - {store.state}
                </span>
              </div>
            </div>

            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white">
                <MessageCircle className="h-5 w-5 mr-2" />
                Chamar no WhatsApp
              </Button>
            </a>

            <a href={`tel:${store.phone}`}>
              <Button
                variant="outline"
                className="w-full border-[#1A73E8] text-[#1A73E8] hover:bg-[#E3F2FD] bg-transparent"
              >
                <Phone className="h-5 w-5 mr-2" />
                {store.phone}
              </Button>
            </a>

            <a href={`mailto:${store.email}`}>
              <Button
                variant="outline"
                className="w-full border-[#1A73E8] text-[#1A73E8] hover:bg-[#E3F2FD] bg-transparent"
              >
                <Mail className="h-5 w-5 mr-2" />
                Enviar E-mail
              </Button>
            </a>

            <div className="pt-4 border-t">
              <Link href={`/catalogo/${store.slug}`}>
                <Button variant="ghost" className="w-full text-[#424242]">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Ver todos os veículos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
