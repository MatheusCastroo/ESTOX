"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export function Hero() {
  const features = [
    "Sem taxa de setup",
    "Suporte dedicado",
    "Cancele quando quiser",
  ]

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center pt-20 pb-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center"
        >
          {/* Content */}
          <motion.div variants={itemVariants} className="text-center lg:text-left">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-foreground mb-6 leading-[1.1]">
              Gerencie seu estoque de veículos
            </h1>

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed"
            >
              A plataforma completa para lojas de veículos. Cadastre, organize e
              publique seu catálogo online em minutos.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
            >
              <Link href="/cadastro">
                <Button
                  size="lg"
                  className="group text-base px-8 py-6 h-auto bg-foreground text-background hover:bg-foreground/90"
                >
                  Criar Conta Grátis
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/catalogo/demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 py-6 h-auto"
                >
                  Ver Demonstração
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-8 justify-center lg:justify-start text-sm text-muted-foreground"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4 text-foreground" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            <motion.div
              className="relative rounded-lg overflow-hidden border border-border"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <img
                src="/imageReal.png"
                alt="Dashboard de gestão de veículos"
                className="w-full h-auto"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
