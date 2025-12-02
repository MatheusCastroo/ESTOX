import { Car, BarChart3, Globe, Shield, Smartphone, Zap } from "lucide-react"

const features = [
  {
    icon: Car,
    title: "Gestão de Estoque",
    description: "Cadastre veículos com fotos, especificações e preços. Ative ou desative anúncios a qualquer momento.",
  },
  {
    icon: Globe,
    title: "Catálogo Online",
    description: "Sua loja virtual com URL personalizada. Seus clientes encontram e filtram veículos facilmente.",
  },
  {
    icon: BarChart3,
    title: "Relatórios Detalhados",
    description: "Acompanhe visualizações, leads gerados e performance de cada veículo do seu estoque.",
  },
  {
    icon: Smartphone,
    title: "100% Responsivo",
    description: "Acesse de qualquer dispositivo. Seus clientes também têm a melhor experiência no celular.",
  },
  {
    icon: Shield,
    title: "Dados Seguros",
    description: "Seus dados protegidos com criptografia de ponta. Backup automático diário.",
  },
  {
    icon: Zap,
    title: "Integração WhatsApp",
    description: "Botão de contato direto para seus clientes entrarem em contato instantaneamente.",
  },
]

export function Features() {
  return (
    <section id="recursos" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#424242]">Tudo que você precisa para vender mais</h2>
          <p className="mt-4 text-lg text-[#424242]/70">
            Ferramentas poderosas para gerenciar seu estoque e alcançar mais clientes
          </p>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative bg-[#F5F5F5] rounded-xl p-6 hover:bg-[#E3F2FD] transition-colors duration-300"
            >
              <div className="h-12 w-12 rounded-lg bg-[#1A73E8] flex items-center justify-center mb-4 group-hover:bg-[#0D47A1] transition-colors">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#424242] mb-2">{feature.title}</h3>
              <p className="text-[#424242]/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
