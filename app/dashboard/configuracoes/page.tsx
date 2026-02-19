"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Save, Upload, MessageCircle, Moon, Sun } from "lucide-react"
import { getUserStore } from "@/lib/actions/stores"
import { useThemeToggle } from "@/hooks/use-theme"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function SettingsPage() {
  const [store, setStore] = useState<any>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadStore() {
      try {
        const storeData = await getUserStore()
        if (storeData) {
          setStore(storeData)
          if (storeData.logo_url) {
            setLogoPreview(storeData.logo_url)
          }
        }
      } catch (error) {
        console.error("Erro ao carregar loja:", error)
      }
    }
    loadStore()
  }, [])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <DashboardHeader title="Configurações" description="Gerencie as configurações da sua loja" />

      <main className="p-6 space-y-6 max-w-4xl">
        {/* Store Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#424242]">Informações da Loja</CardTitle>
            <CardDescription>Dados que aparecem no seu catálogo público</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="storeName">Nome da Loja</Label>
                <Input id="storeName" defaultValue={store?.name || "Auto Prime Veículos"} />
              </div>
              <div>
                <Label htmlFor="slug">URL do Catálogo</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-[#F5F5F5] border border-r-0 rounded-l-md text-sm text-[#424242]/70">
                    estocx.com.br/
                  </span>
                  <Input id="slug" defaultValue={store?.slug || "auto-prime"} className="rounded-l-none" />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                defaultValue={store?.description || "Há mais de 10 anos no mercado, oferecendo os melhores veículos seminovos com garantia e procedência."}
              />
            </div>

            <div>
              <Label>Logo da Loja</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="h-20 w-20 bg-[#F5F5F5] rounded-lg flex items-center justify-center overflow-hidden relative">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Upload className="h-8 w-8 text-[#424242]/50" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button variant="outline" type="button" onClick={handleUploadClick}>
                    {logoPreview ? "Alterar Logo" : "Enviar Logo"}
                  </Button>
                  {logoPreview && (
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        setLogoPreview(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ""
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remover Logo
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Contato</CardTitle>
            <CardDescription>Informações de contato para seus clientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" defaultValue={store?.phone || "(11) 99999-9999"} />
              </div>
              <div>
                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                  WhatsApp
                </Label>
                <Input id="whatsapp" defaultValue={store?.whatsapp || "5511999999999"} />
              </div>
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" defaultValue={store?.email || "contato@autoprime.com.br"} />
            </div>

            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" defaultValue={store?.address || "Av. Principal, 1234"} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" defaultValue={store?.city || "São Paulo"} />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input id="state" defaultValue={store?.state || "SP"} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Aparência</CardTitle>
            <CardDescription>Personalize a aparência da interface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Tema</p>
                <p className="text-sm text-muted-foreground">Escolha entre tema claro, escuro ou seguir o sistema</p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Notificações</CardTitle>
            <CardDescription>Configure como você recebe alertas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Novos leads por e-mail</p>
                <p className="text-sm text-muted-foreground">Receba um e-mail quando alguém entrar em contato</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Relatório semanal</p>
                <p className="text-sm text-muted-foreground">Resumo semanal de views e leads</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Novidades do Estocx</p>
                <p className="text-sm text-muted-foreground">Atualizações e novos recursos da plataforma</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button className="bg-primary hover:bg-primary/90">
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </main>
    </>
  )
}
