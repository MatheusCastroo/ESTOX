import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Básico",
    price: "97",
    description: "Ideal para revendedores independentes",
    features: ["Até 20 veículos", "Catálogo público", "Suporte por email", "Relatórios básicos"],
    popular: false,
  },
  {
    name: "Profissional",
    price: "197",
    description: "Para lojas em crescimento",
    features: [
      "Até 100 veículos",
      "Catálogo com URL personalizada",
      "Suporte prioritário",
      "Relatórios avançados",
      "Integração WhatsApp",
      "Destaque nos anúncios",
    ],
    popular: true,
  },
  {
    name: "Empresarial",
    price: "397",
    description: "Para concessionárias e multimarcas",
    features: [
      "Veículos ilimitados",
      "Múltiplas lojas",
      "Suporte dedicado 24/7",
      "API de integração",
      "Relatórios personalizados",
      "Treinamento da equipe",
    ],
    popular: false,
  },
]

export function Pricing() {
  return (
    <section id="planos" className="py-24 bg-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#424242]">Planos que cabem no seu bolso</h2>
          <p className="mt-4 text-lg text-[#424242]/70">Escolha o plano ideal para o tamanho da sua operação</p>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl p-8 shadow-sm ${
                plan.popular ? "ring-2 ring-[#1A73E8] scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[#1A73E8] text-white text-sm font-medium px-4 py-1 rounded-full">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-xl font-semibold text-[#424242]">{plan.name}</h3>
                <p className="mt-2 text-[#424242]/70">{plan.description}</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-[#424242]">R$ {plan.price}</span>
                  <span className="text-[#424242]/70">/mês</span>
                </div>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#1A73E8] flex-shrink-0" />
                    <span className="text-[#424242]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/cadastro" className="block mt-8">
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-[#1A73E8] hover:bg-[#0D47A1] text-white"
                      : "bg-[#E3F2FD] hover:bg-[#1A73E8] text-[#0D47A1] hover:text-white"
                  }`}
                >
                  Começar Agora
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
