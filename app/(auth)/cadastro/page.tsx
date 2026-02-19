"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { apiRequest, ApiError } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Eye, EyeOff, Car, Check, ArrowRight, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

const plans = [
  { id: "basico", name: "Básico", price: "R$ 97/mês" },
  { id: "profissional", name: "Profissional", price: "R$ 197/mês" },
  { id: "empresarial", name: "Empresarial", price: "R$ 397/mês" },
]

const states = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
]

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)

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

    try {
      const response = await apiRequest<{ token: string; user: any }>(
        "auth?action=register",
        {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
            name,
          }),
        }
      )

      if (response.token) {
        localStorage.setItem("token", response.token)
        localStorage.setItem("user", JSON.stringify(response.user))
        router.push(`/onboarding?plan=${selectedPlan}`)
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Erro ao criar conta. Tente novamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card variant="default" padding="lg">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-foreground flex items-center justify-center mb-2">
              <Car className="h-6 w-6 text-background" />
            </div>
            <CardTitle className="text-2xl font-medium">Criar sua conta</CardTitle>
            <CardDescription>
              {step === 1
                ? "Comece a gerenciar seu estoque de veículos"
                : "Escolha seu plano e complete o cadastro"}
            </CardDescription>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`h-1 w-12 rounded-full transition-all ${
                    step >= s ? "bg-foreground" : "bg-border"
                  }`}
                />
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="storeName" className="text-sm font-medium">
                        Nome da Loja
                      </Label>
                      <Input
                        id="storeName"
                        placeholder="Ex: Auto Prime Veículos"
                        required
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="name" className="text-sm font-medium">
                        Seu Nome
                      </Label>
                      <Input
                        id="name"
                        placeholder="Nome completo"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">
                        E-mail
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium">
                        WhatsApp
                      </Label>
                      <Input
                        id="phone"
                        placeholder="(11) 99999-9999"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-sm font-medium">
                        Senha
                      </Label>
                      <div className="relative mt-2">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-foreground text-background hover:bg-foreground/90"
                      size="lg"
                    >
                      Continuar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <Label className="text-sm font-medium mb-3 block">
                        Escolha seu plano
                      </Label>
                      <div className="space-y-2">
                        {plans.map((plan) => (
                          <label
                            key={plan.id}
                            className={`flex items-center gap-3 p-4 border rounded-md cursor-pointer transition-colors ${
                              selectedPlan === plan.id
                                ? "border-foreground bg-card"
                                : "border-border hover:border-foreground/50"
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
                              <p className="font-medium text-foreground">
                                {plan.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {plan.price}
                              </p>
                            </div>
                            {selectedPlan === plan.id && (
                              <div className="h-5 w-5 rounded-full bg-foreground flex items-center justify-center">
                                <Check className="h-3 w-3 text-background" />
                              </div>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="city" className="text-sm font-medium">
                        Cidade
                      </Label>
                      <Input
                        id="city"
                        placeholder="São Paulo"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="state" className="text-sm font-medium">
                        Estado
                      </Label>
                      <Select required value={state} onValueChange={setState}>
                        <SelectTrigger id="state" className="mt-2">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {error && (
                      <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-destructive font-medium">
                          {error}
                        </p>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <Checkbox id="terms" required />
                      <Label
                        htmlFor="terms"
                        className="text-sm font-normal cursor-pointer leading-tight"
                      >
                        Li e aceito os{" "}
                        <Link
                          href="/termos"
                          className="text-foreground hover:underline font-medium"
                        >
                          Termos de Uso
                        </Link>{" "}
                        e a{" "}
                        <Link
                          href="/privacidade"
                          className="text-foreground hover:underline font-medium"
                        >
                          Política de Privacidade
                        </Link>
                      </Label>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setStep(1)}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-foreground text-background hover:bg-foreground/90"
                        size="lg"
                        loading={isLoading}
                        disabled={isLoading}
                      >
                        {!isLoading && (
                          <>
                            Criar Conta
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link
                href="/login"
                className="text-foreground hover:underline font-medium"
              >
                Entrar
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
