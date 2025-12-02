"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Loader2, Check } from "lucide-react"
import Link from "next/link"

const plans = [
  { id: "basico", name: "Básico", price: "R$ 99,90/mês" },
  { id: "profissional", name: "Profissional", price: "R$ 199,90/mês" },
  { id: "enterprise", name: "Enterprise", price: "R$ 399,90/mês" },
]

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [storeName, setStoreName] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [selectedPlan, setSelectedPlan] = useState("profissional")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (step === 1) {
      setStep(2)
      return
    }

    setIsLoading(true)

    const supabase = createClient()

    try {
      // Criar usuário no Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: name,
            phone: phone,
            store_name: storeName,
            plan: selectedPlan,
            city: city,
            state: state,
          },
        },
      })

      if (signUpError) throw signUpError

      if (data.user) {
        // Redirecionar para onboarding para criar a loja
        router.push("/onboarding?plan=" + selectedPlan)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-[#424242]">Criar sua conta</CardTitle>
        <CardDescription>
          {step === 1 ? "Comece a gerenciar seu estoque de veículos" : "Escolha seu plano e complete o cadastro"}
        </CardDescription>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className={`h-2 w-2 rounded-full ${step >= 1 ? "bg-[#1A73E8]" : "bg-[#E0E0E0]"}`} />
          <div className={`h-2 w-2 rounded-full ${step >= 2 ? "bg-[#1A73E8]" : "bg-[#E0E0E0]"}`} />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <>
              <div>
                <Label htmlFor="storeName">Nome da Loja</Label>
                <Input
                  id="storeName"
                  placeholder="Ex: Auto Prime Veículos"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="name">Seu Nome</Label>
                <Input
                  id="name"
                  placeholder="Nome completo"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">WhatsApp</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#424242]/50 hover:text-[#424242]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-[#1A73E8] hover:bg-[#0D47A1]">
                Continuar
              </Button>
            </>
          ) : (
            <>
              <div>
                <Label>Escolha seu plano</Label>
                <div className="space-y-3 mt-2">
                  {plans.map((plan) => (
                    <label
                      key={plan.id}
                      className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-[#1A73E8] transition-colors ${
                        selectedPlan === plan.id ? "border-[#1A73E8] bg-[#E3F2FD]" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value={plan.id}
                        className="sr-only"
                        checked={selectedPlan === plan.id}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-[#424242]">{plan.name}</p>
                        <p className="text-sm text-[#424242]/70">{plan.price}</p>
                      </div>
                      {selectedPlan === plan.id && (
                        <div className="h-5 w-5 rounded-full bg-[#1A73E8] flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  placeholder="São Paulo"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="state">Estado</Label>
                <Select required value={state} onValueChange={setState}>
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SP">São Paulo</SelectItem>
                    <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                    <SelectItem value="MG">Minas Gerais</SelectItem>
                    <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                    <SelectItem value="PR">Paraná</SelectItem>
                    <SelectItem value="SC">Santa Catarina</SelectItem>
                    <SelectItem value="BA">Bahia</SelectItem>
                    <SelectItem value="GO">Goiás</SelectItem>
                    <SelectItem value="DF">Distrito Federal</SelectItem>
                    <SelectItem value="ES">Espírito Santo</SelectItem>
                    <SelectItem value="PE">Pernambuco</SelectItem>
                    <SelectItem value="CE">Ceará</SelectItem>
                    <SelectItem value="PA">Pará</SelectItem>
                    <SelectItem value="MA">Maranhão</SelectItem>
                    <SelectItem value="AM">Amazonas</SelectItem>
                    <SelectItem value="MT">Mato Grosso</SelectItem>
                    <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                    <SelectItem value="PB">Paraíba</SelectItem>
                    <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                    <SelectItem value="AL">Alagoas</SelectItem>
                    <SelectItem value="PI">Piauí</SelectItem>
                    <SelectItem value="SE">Sergipe</SelectItem>
                    <SelectItem value="RO">Rondônia</SelectItem>
                    <SelectItem value="TO">Tocantins</SelectItem>
                    <SelectItem value="AC">Acre</SelectItem>
                    <SelectItem value="AP">Amapá</SelectItem>
                    <SelectItem value="RR">Roraima</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

              <div className="flex items-start gap-2">
                <Checkbox id="terms" required />
                <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-tight">
                  Li e aceito os{" "}
                  <Link href="/termos" className="text-[#1A73E8] hover:underline">
                    Termos de Uso
                  </Link>{" "}
                  e a{" "}
                  <Link href="/privacidade" className="text-[#1A73E8] hover:underline">
                    Política de Privacidade
                  </Link>
                </Label>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => setStep(1)}>
                  Voltar
                </Button>
                <Button type="submit" className="flex-1 bg-[#1A73E8] hover:bg-[#0D47A1]" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Conta"
                  )}
                </Button>
              </div>
            </>
          )}
        </form>

        <div className="mt-6 text-center text-sm text-[#424242]/70">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-[#1A73E8] hover:underline font-medium">
            Entrar
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
