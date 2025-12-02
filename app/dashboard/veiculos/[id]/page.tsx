"use client"

import type React from "react"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockVehicles, brands } from "@/lib/mock-data"
import { Upload, X, Save, ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const vehicle = mockVehicles.find((v) => v.id === id)

  if (!vehicle) {
    notFound()
  }

  const [features, setFeatures] = useState<string[]>(vehicle.features)
  const [newFeature, setNewFeature] = useState("")

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()])
      setNewFeature("")
    }
  }

  const removeFeature = (feature: string) => {
    setFeatures(features.filter((f) => f !== feature))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/dashboard/veiculos")
  }

  return (
    <>
      <DashboardHeader title="Editar Veículo" description={`${vehicle.brand} ${vehicle.model}`} />

      <main className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#424242]">Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="brand">Marca</Label>
                      <Select defaultValue={vehicle.brand}>
                        <SelectTrigger id="brand">
                          <SelectValue placeholder="Selecione a marca" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand} value={brand}>
                              {brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="model">Modelo</Label>
                      <Input id="model" defaultValue={vehicle.model} />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="year">Ano</Label>
                      <Select defaultValue={vehicle.year.toString()}>
                        <SelectTrigger id="year">
                          <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="mileage">Quilometragem</Label>
                      <Input id="mileage" type="number" defaultValue={vehicle.mileage} />
                    </div>
                    <div>
                      <Label htmlFor="price">Preço (R$)</Label>
                      <Input id="price" type="number" defaultValue={vehicle.price} />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="fuel">Combustível</Label>
                      <Select defaultValue={vehicle.fuel}>
                        <SelectTrigger id="fuel">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Flex">Flex</SelectItem>
                          <SelectItem value="Gasolina">Gasolina</SelectItem>
                          <SelectItem value="Etanol">Etanol</SelectItem>
                          <SelectItem value="Diesel">Diesel</SelectItem>
                          <SelectItem value="Híbrido">Híbrido</SelectItem>
                          <SelectItem value="Elétrico">Elétrico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="transmission">Câmbio</Label>
                      <Select defaultValue={vehicle.transmission}>
                        <SelectTrigger id="transmission">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Automático">Automático</SelectItem>
                          <SelectItem value="Manual">Manual</SelectItem>
                          <SelectItem value="CVT">CVT</SelectItem>
                          <SelectItem value="Automatizado">Automatizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="color">Cor</Label>
                      <Input id="color" defaultValue={vehicle.color} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#424242]">Descrição</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea defaultValue={vehicle.description} className="min-h-[120px]" />
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#424242]">Opcionais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ex: Couro, Teto Solar, Multimídia..."
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                    />
                    <Button type="button" onClick={addFeature} variant="outline">
                      Adicionar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-1.5 bg-[#E3F2FD] text-[#0D47A1] px-3 py-1.5 rounded-full text-sm"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(feature)}
                          className="hover:bg-[#1A73E8]/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#424242]">Fotos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {vehicle.images.map((img, i) => (
                      <div key={i} className="relative aspect-video bg-[#F5F5F5] rounded-lg overflow-hidden">
                        <img src={img || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                        <button type="button" className="absolute top-1 right-1 bg-white/90 rounded-full p-1">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="border-2 border-dashed border-[#E0E0E0] rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-[#424242]/50 mb-2" />
                    <p className="text-sm text-[#424242]/70 mb-2">Adicionar mais fotos</p>
                    <Button type="button" variant="outline" size="sm">
                      Selecionar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#424242]">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select defaultValue={vehicle.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponível</SelectItem>
                      <SelectItem value="reserved">Reservado</SelectItem>
                      <SelectItem value="sold">Vendido</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button type="submit" className="bg-[#1A73E8] hover:bg-[#0D47A1]">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
                <Link href="/dashboard/veiculos">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                </Link>
                <Button type="button" variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Veículo
                </Button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </>
  )
}
