"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const plans = [
  {
    name: "Básico",
    price: "97",
    description: "Ideal para revendedores independentes",
    features: [
      "Até 20 veículos",
      "Catálogo público",
      "Suporte por email",
      "Relatórios básicos",
    ],
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export function Pricing() {
  return (
    <section id="pricing" className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mb-4">
            Planos que cabem no seu bolso
          </h2>
          <p className="text-lg text-muted-foreground">
            Escolha o plano ideal para o tamanho da sua operação. Teste grátis
            por 15 dias.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-6"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              className={plan.popular ? "md:-mt-2" : ""}
            >
              <Card
                variant={plan.popular ? "elevated" : "default"}
                padding="lg"
                hover
                animated
                className={`relative h-full flex flex-col ${
                  plan.popular ? "border-2 border-foreground" : ""
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge variant="default" className="text-xs">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <div className="relative z-10">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-medium text-foreground mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-8 pb-8 border-b border-border">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-medium text-foreground">
                        R$ {plan.price}
                      </span>
                      <span className="text-muted-foreground text-sm">/mês</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={feature}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.2,
                          delay: featureIndex * 0.05,
                        }}
                        className="flex items-start gap-3"
                      >
                        <Check className="h-4 w-4 text-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground leading-relaxed">
                          {feature}
                        </span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link href="/cadastro" className="block">
                    <Button
                      variant={plan.popular ? "default" : "outline"}
                      className="w-full"
                      size="lg"
                    >
                      Começar Agora
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground">
            Todos os planos incluem teste grátis de 15 dias. Sem compromisso,
            cancele quando quiser.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
