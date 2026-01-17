"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Car, Menu, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0D47A1] text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a href="#top" onClick={(e) => handleScroll(e, "top")} className="flex items-center gap-2 cursor-pointer">
            <Car className="h-8 w-8" />
            <span className="text-xl font-bold">Estocx</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#recursos"
              onClick={(e) => handleScroll(e, "recursos")}
              className="text-white/90 hover:text-white transition-colors cursor-pointer"
            >
              Recursos
            </a>
            <a
              href="#planos"
              onClick={(e) => handleScroll(e, "planos")}
              className="text-white/90 hover:text-white transition-colors cursor-pointer"
            >
              Planos
            </a>
            <a
              href="#contato"
              onClick={(e) => handleScroll(e, "contato")}
              className="text-white/90 hover:text-white transition-colors cursor-pointer"
            >
              Contato
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Entrar
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button className="bg-white text-[#0D47A1] hover:bg-white/90">Começar Agora</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <nav className="flex flex-col gap-4">
              <a
                href="#recursos"
                onClick={(e) => handleScroll(e, "recursos")}
                className="text-white/90 hover:text-white cursor-pointer"
              >
                Recursos
              </a>
              <a
                href="#planos"
                onClick={(e) => handleScroll(e, "planos")}
                className="text-white/90 hover:text-white cursor-pointer"
              >
                Planos
              </a>
              <a
                href="#contato"
                onClick={(e) => handleScroll(e, "contato")}
                className="text-white/90 hover:text-white cursor-pointer"
              >
                Contato
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-white/20">
                <Link href="/login">
                  <Button variant="ghost" className="w-full text-white hover:bg-white/10">
                    Entrar
                  </Button>
                </Link>
                <Link href="/cadastro">
                  <Button className="w-full bg-white text-[#0D47A1] hover:bg-white/90">Começar Agora</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
