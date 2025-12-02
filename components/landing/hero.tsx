import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0D47A1] via-[#1A73E8] to-[#0D47A1] text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              Gerencie seu estoque de veículos com facilidade
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/90 max-w-2xl mx-auto lg:mx-0 text-pretty">
              A plataforma completa para lojas de veículos. Cadastre, organize e publique seu catálogo online em
              minutos.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/cadastro">
                <Button size="lg" className="w-full sm:w-auto bg-white text-[#0D47A1] hover:bg-white/90 text-lg px-8">
                  Criar Conta Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/catalogo/demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white text-white hover:bg-white/10 text-lg px-8 bg-transparent"
                >
                  Ver Demonstração
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 justify-center lg:justify-start">
              {["Sem taxa de setup", "Suporte dedicado", "Cancele quando quiser"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#E3F2FD]" />
                  <span className="text-white/90">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
              <img
                src="/car-dealership-dashboard-interface-showing-vehicle.jpg"
                alt="Dashboard de gestão de veículos"
                className="rounded-lg w-full"
              />
            </div>
            {/* Floating stats card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#E3F2FD] flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#1A73E8]">+</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#424242]">500+</p>
                  <p className="text-sm text-[#424242]/70">Lojas cadastradas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
