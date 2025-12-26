"use client"

import { useState } from "react"
import type { Store } from "@/lib/mock-data"
import { MapPin, Phone, Mail } from "lucide-react"
import Link from "next/link"

interface CatalogHeaderProps {
  store: Store
}

export function CatalogHeader({ store }: CatalogHeaderProps) {
  const [logoError, setLogoError] = useState(false);

  // Garantir que logo_url tenha prefixo se for base64
  const getLogoUrl = () => {
    if (!store.logo_url) return null;
    const logoUrl = store.logo_url.trim();
    if (logoUrl.startsWith('data:') || logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
      return logoUrl;
    }
    // Provavelmente base64 sem prefixo, adicionar
    return `data:image/png;base64,${logoUrl}`;
  };

  const logoUrl = getLogoUrl();
  const showLogo = logoUrl && !logoError;

  return (
    <header className="bg-[#0D47A1] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href={`/catalogo/${store.slug}`} className="flex items-center gap-3">
              {showLogo ? (
                <img 
                  src={logoUrl} 
                  alt={store.name || 'Logo da loja'} 
                  className="h-16 max-h-20 max-w-[300px] w-auto object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <h1 className="text-lg font-normal text-white/80">{store.name}</h1>
              )}
            </Link>
            {store.description && (
              <p className="text-white/60 text-sm mt-1 hidden md:block">{store.description}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 text-xs">
            {store.city && store.state && (
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-[#E3F2FD]" />
                <span>
                  {store.city}, {store.state}
                </span>
              </div>
            )}
            {store.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-[#E3F2FD]" />
                <span>{store.phone}</span>
              </div>
            )}
            {store.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-[#E3F2FD]" />
                <span>{store.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
