"use client"

import * as React from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  animated?: boolean
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, animated = true, ...props }, ref) => {
    if (!animated) {
      return (
        <div
          ref={ref}
          data-slot="skeleton"
          className={cn("bg-muted rounded-lg", className)}
          {...props}
        />
      )
    }

    return (
      <motion.div
        ref={ref}
        data-slot="skeleton"
        className={cn(
          "skeleton rounded-lg bg-gradient-to-r from-card via-card-hover to-card",
          "dark:from-card dark:via-card-hover dark:to-card",
          className
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

export { Skeleton }
