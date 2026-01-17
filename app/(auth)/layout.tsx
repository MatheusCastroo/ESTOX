import type React from "react"
import { Car } from "lucide-react"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      {/* Header */}
      <header className="bg-[#0D47A1] py-4">
        <div className="mx-auto max-w-7xl px-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <Car className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">Estocx</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">{children}</main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-[#424242]/70">
        <p>&copy; {new Date().getFullYear()} Estocx. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
