import type { Store } from "@/lib/mock-data"
import { MapPin, Phone, Mail } from "lucide-react"
import Link from "next/link"

interface CatalogHeaderProps {
  store: Store
}

export function CatalogHeader({ store }: CatalogHeaderProps) {
  return (
    <header className="bg-[#0D47A1] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link href={`/catalogo/${store.slug}`}>
              <h1 className="text-2xl font-bold">{store.name}</h1>
            </Link>
            <p className="text-white/80 mt-1">{store.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#E3F2FD]" />
              <span>
                {store.city}, {store.state}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#E3F2FD]" />
              <span>{store.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#E3F2FD]" />
              <span>{store.email}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
