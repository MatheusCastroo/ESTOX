"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useState } from "react"
import type { Store } from "@/lib/mock-data"
import { MapPin, Phone, Mail } from "lucide-react"
import Link from "next/link"

interface CatalogHeaderProps {
  store: Store
}

export function CatalogHeader({ store }: CatalogHeaderProps) {
  const [logoError, setLogoError] = useState(false)

  const getLogoUrl = () => {
    if (!store.logo_url) return null
    const logoUrl = store.logo_url.trim()
    if (
      logoUrl.startsWith("data:") ||
      logoUrl.startsWith("http://") ||
      logoUrl.startsWith("https://")
    ) {
      return logoUrl
    }
    return `data:image/png;base64,${logoUrl}`
  }

  const logoUrl = getLogoUrl()
  const showLogo = logoUrl && !logoError

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40 glass border-b border-border/40 backdrop-blur-xl"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Logo & Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-4"
          >
            <Link
              href={`/catalogo/${store.slug}`}
              className="flex items-center gap-4 group"
            >
              {showLogo ? (
                <motion.img
                  src={logoUrl}
                  alt={store.name || "Logo da loja"}
                  className="max-h-20 max-w-[400px] w-auto h-auto object-contain"
                  onError={() => setLogoError(true)}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                />
              ) : (
                <h1 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {store.name}
                </h1>
              )}
            </Link>
            {store.description && (
              <p className="text-muted-foreground text-sm hidden lg:block max-w-md">
                {store.description}
              </p>
            )}
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center gap-4 text-sm"
          >
            {store.city && store.state && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>
                  {store.city}, {store.state}
                </span>
              </div>
            )}
            {store.phone && (
              <a
                href={`tel:${store.phone}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4 text-primary" />
                <span>{store.phone}</span>
              </a>
            )}
            {store.email && (
              <a
                href={`mailto:${store.email}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">{store.email}</span>
                <span className="sm:hidden">Email</span>
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}
