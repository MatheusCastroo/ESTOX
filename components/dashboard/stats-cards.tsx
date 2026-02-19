"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Car, Eye, MessageCircle, TrendingUp, ArrowUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Stat {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  icon: React.ComponentType<{ className?: string }>
}

const stats: Stat[] = [
  {
    title: "Veículos Ativos",
    value: "24",
    change: "+3 este mês",
    changeType: "positive",
    icon: Car,
  },
  {
    title: "Visualizações",
    value: "1.284",
    change: "+12% vs mês anterior",
    changeType: "positive",
    icon: Eye,
  },
  {
    title: "Leads Gerados",
    value: "47",
    change: "+8 esta semana",
    changeType: "positive",
    icon: MessageCircle,
  },
  {
    title: "Taxa de Conversão",
    value: "3.6%",
    change: "+0.5% vs mês anterior",
    changeType: "positive",
    icon: TrendingUp,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export function StatsCards() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div key={stat.title} variants={cardVariants}>
            <Card
              variant="default"
              padding="lg"
              hover
              animated
              className="h-full"
            >
              <CardContent className="p-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-medium text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className="p-2 rounded-md bg-card">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {stat.changeType === "positive" && (
                    <Badge variant="success" className="gap-1 text-xs">
                      <ArrowUp className="h-3 w-3" />
                      {stat.change}
                    </Badge>
                  )}
                  {stat.changeType === "negative" && (
                    <Badge variant="destructive" className="gap-1 text-xs">
                      {stat.change}
                    </Badge>
                  )}
                  {stat.changeType === "neutral" && (
                    <span className="text-xs text-muted-foreground">
                      {stat.change}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
