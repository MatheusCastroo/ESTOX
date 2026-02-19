"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CTA() {
  return (
    <section id="contact" className="relative py-24 lg:py-32 bg-foreground text-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium mb-6 leading-tight">
            Pronto para digitalizar sua loja de veículos?
          </h2>

          <p className="text-lg sm:text-xl text-background/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Junte-se a centenas de lojas que já estão vendendo mais com o
            Estocx. Teste grátis por 15 dias, sem compromisso.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/cadastro">
              <Button
                size="lg"
                className="group text-base px-8 py-6 h-auto bg-background text-foreground hover:bg-background/90"
              >
                Criar Conta Grátis
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#contact">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 py-6 h-auto border-2 border-background/30 bg-transparent text-background hover:bg-background/10"
              >
                Falar com Vendas
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
