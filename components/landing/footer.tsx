"use client"

import type React from "react"

import { Car } from "lucide-react"
import Link from "next/link"

export function Footer() {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()

    if (targetId === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      const element = document.getElementById(targetId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }

  return (
    <footer id="contato" className="bg-[#424242] text-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <a href="#top" onClick={(e) => handleScroll(e, "top")} className="flex items-center gap-2 cursor-pointer">
              <Car className="h-8 w-8" />
              <span className="text-xl font-bold">Estocx</span>
            </a>
            <p className="mt-4 text-white/70">A plataforma completa para gestão de estoque de veículos.</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#recursos"
                  onClick={(e) => handleScroll(e, "recursos")}
                  className="text-white/70 hover:text-white cursor-pointer"
                >
                  Recursos
                </a>
              </li>
              <li>
                <a
                  href="#planos"
                  onClick={(e) => handleScroll(e, "planos")}
                  className="text-white/70 hover:text-white cursor-pointer"
                >
                  Planos
                </a>
              </li>
              <li>
                <Link href="/catalogo/demo" className="text-white/70 hover:text-white">
                  Demonstração
                </Link>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/sobre" className="text-white/70 hover:text-white">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white/70 hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-white/70 hover:text-white">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/termos" className="text-white/70 hover:text-white">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-white/70 hover:text-white">
                  Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20 text-center text-white/70">
          <p>&copy; {new Date().getFullYear()} Estocx. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
