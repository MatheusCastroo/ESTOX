"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Car } from "lucide-react"

export function Footer() {
  const footerLinks = {
    produto: [
      { label: "Recursos", href: "/#features" },
      { label: "Planos", href: "/#pricing" },
      { label: "Demonstração", href: "/catalogo/demo" },
    ],
    empresa: [
      { label: "Sobre Nós", href: "/sobre" },
      { label: "Blog", href: "/blog" },
      { label: "Contato", href: "/#contact" },
    ],
    legal: [
      { label: "Termos de Uso", href: "/termos" },
      { label: "Privacidade", href: "/privacidade" },
    ],
  }

  return (
    <footer className="relative border-t border-border bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Car className="h-5 w-5 text-foreground" />
              <span className="text-lg font-medium text-foreground">
                Estocx
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A plataforma completa para gestão de estoque de veículos.
            </p>
          </motion.div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([key, links], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <h4 className="font-medium text-foreground mb-4 capitalize text-sm">
                {key}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <motion.div
          className="mt-12 pt-8 border-t border-border"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Estocx. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link
                href="/termos"
                className="hover:text-foreground transition-colors"
              >
                Termos
              </Link>
              <Link
                href="/privacidade"
                className="hover:text-foreground transition-colors"
              >
                Privacidade
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
