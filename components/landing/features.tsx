"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Car, BarChart3, Globe, Shield, Smartphone, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"

const features = [
  {
    icon: Car,
    title: "Gestão de Estoque",
    description:
      "Cadastre veículos com fotos, especificações e preços. Ative ou desative anúncios a qualquer momento.",
  },
  {
    icon: Globe,
    title: "Catálogo Online",
    description:
      "Sua loja virtual com URL personalizada. Seus clientes encontram e filtram veículos facilmente.",
  },
  {
    icon: BarChart3,
    title: "Relatórios Detalhados",
    description:
      "Acompanhe visualizações, leads gerados e performance de cada veículo do seu estoque.",
  },
  {
    icon: Smartphone,
    title: "100% Responsivo",
    description:
      "Acesse de qualquer dispositivo. Seus clientes também têm a melhor experiência no celular.",
  },
  {
    icon: Shield,
    title: "Dados Seguros",
    description:
      "Seus dados protegidos com criptografia de ponta. Backup automático diário.",
  },
  {
    icon: Zap,
    title: "Integração WhatsApp",
    description:
      "Botão de contato direto para seus clientes entrarem em contato instantaneamente.",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
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

export function Features() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mb-4">
            Tudo que você precisa para vender mais
          </h2>
          <p className="text-lg text-muted-foreground">
            Ferramentas poderosas para gerenciar seu estoque e alcançar mais
            clientes
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div key={feature.title} variants={itemVariants}>
                <Card
                  variant="default"
                  padding="lg"
                  hover
                  animated
                  className="h-full"
                >
                  {/* Icon */}
                  <div className="mb-4">
                    <Icon className="h-6 w-6 text-foreground" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
