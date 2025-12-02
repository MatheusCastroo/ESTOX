"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { createStore, checkSlugAvailability } from "@/lib/actions/stores"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Loader2, CheckCircle, XCircle } from "lucide-react"

function OnboardingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planSlug = searchParams.get("plan") || "basico"

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle")

  // Form state
  const [storeName, setStoreName] = useState("")
  const [slug, setSlug] = useState("")
  const [phone, setPhone] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [description, setDescription] = useState("")

  // Auto-generate slug from store name
  useEffect(() => {
    if (storeName) {
      const generatedSlug = storeName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
      setSlug(generatedSlug)
    }
  }, [storeName])

  // Check slug availability
  useEffect(() => {
    if (!slug) {
      setSlugStatus("idle")
      return
    }

    const checkSlug = async () => {
      setSlugStatus("checking")
      try {
        const isAvailable = await checkSlugAvailability(slug)
        setSlugStatus(isAvailable ? "available" : "taken")
      } catch {
        setSlugStatus("idle")
      }
    }

    const timeout = setTimeout(checkSlug, 500)
    return () => clearTimeout(timeout)
  }, [slug])

  // Get user metadata for pre-filling
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user?.user_metadata) {
        setStoreName(user.user_metadata.store_name || "")
        setPhone(user.user_metadata.phone || "")
        setWhatsapp(user.user_metadata.phone || "")
      }
    }
    getUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (slugStatus === "taken") {
      setError("Este slug já está em uso. Escolha outro.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await createStore(
        {
          name: storeName,
          slug,
          phone,
          whatsapp: whatsapp.replace(/\D/g, ""),
          description,
        },
        planSlug,
      )

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar loja")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-[#E3F2FD] rounded-full flex items-center justify-center mb-4">
            <Car className="h-8 w-8 text-[#1A73E8]" />
          </div>
          <CardTitle className="text-2xl text-[#424242]">Configure sua loja</CardTitle>
          <CardDescription>Preencha as informações da sua loja para começar a usar o AutoStock</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="storeName">Nome da Loja *</Label>
              <Input
                id="storeName"
                placeholder="Ex: Auto Prime Veículos"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="slug">URL do Catálogo *</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#424242]/70">autostock.com.br/</span>
                <div className="flex-1 relative">
                  <Input
                    id="slug"
                    placeholder="sua-loja"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {slugStatus === "checking" && <Loader2 className="h-4 w-4 animate-spin text-[#424242]/50" />}
                    {slugStatus === "available" && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {slugStatus === "taken" && <XCircle className="h-4 w-4 text-red-600" />}
                  </div>
                </div>
              </div>
              {slugStatus === "taken" && <p className="text-sm text-red-600 mt-1">Este slug já está em uso</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(11) 3333-3333"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp *</Label>
                <Input
                  id="whatsapp"
                  placeholder="(11) 99999-9999"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição da Loja</Label>
              <Textarea
                id="description"
                placeholder="Conte um pouco sobre sua loja, tempo de mercado, diferenciais..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-[#1A73E8] hover:bg-[#0D47A1]"
              disabled={isLoading || slugStatus === "taken"}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando loja...
                </>
              ) : (
                "Criar Loja e Começar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1A73E8]" />
        </div>
      }
    >
      <OnboardingForm />
    </Suspense>
  )
}
