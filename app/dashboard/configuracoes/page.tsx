"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Save, Upload } from "lucide-react"

export default function SettingsPage() {
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
                <Input id="storeName" defaultValue="Auto Prime Veículos" />
              </div>
              <div>
                <Label htmlFor="slug">URL do Catálogo</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-[#F5F5F5] border border-r-0 rounded-l-md text-sm text-[#424242]/70">
                    autostock.com.br/
                  </span>
                  <Input id="slug" defaultValue="auto-prime" className="rounded-l-none" />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                defaultValue="Há mais de 10 anos no mercado, oferecendo os melhores veículos seminovos com garantia e procedência."
              />
            </div>

            <div>
              <Label>Logo da Loja</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="h-20 w-20 bg-[#F5F5F5] rounded-lg flex items-center justify-center">
                  <Upload className="h-8 w-8 text-[#424242]/50" />
                </div>
                <Button variant="outline">Alterar Logo</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#424242]">Contato</CardTitle>
            <CardDescription>Informações de contato para seus clientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" defaultValue="(11) 99999-9999" />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" defaultValue="5511999999999" />
              </div>
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" defaultValue="contato@autoprime.com.br" />
            </div>

            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" defaultValue="Av. Principal, 1234" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" defaultValue="São Paulo" />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input id="state" defaultValue="SP" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#424242]">Notificações</CardTitle>
            <CardDescription>Configure como você recebe alertas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#424242]">Novos leads por e-mail</p>
                <p className="text-sm text-[#424242]/70">Receba um e-mail quando alguém entrar em contato</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#424242]">Relatório semanal</p>
                <p className="text-sm text-[#424242]/70">Resumo semanal de views e leads</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#424242]">Novidades do AutoStock</p>
                <p className="text-sm text-[#424242]/70">Atualizações e novos recursos da plataforma</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button className="bg-[#1A73E8] hover:bg-[#0D47A1]">
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </main>
    </>
  )
}
