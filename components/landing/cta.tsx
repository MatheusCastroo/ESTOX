import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTA() {
  return (
    <section className="py-24 bg-[#0D47A1]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-balance">
            Pronto para digitalizar sua loja de veículos?
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Junte-se a centenas de lojas que já estão vendendo mais com o AutoStock. Teste grátis por 14 dias, sem
            compromisso.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro">
              <Button size="lg" className="w-full sm:w-auto bg-white text-[#0D47A1] hover:bg-white/90 text-lg px-8">
                Criar Conta Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#contato">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white text-white hover:bg-white/10 text-lg px-8 bg-transparent"
              >
                Falar com Vendas
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
