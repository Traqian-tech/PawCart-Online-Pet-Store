import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm hover:shadow-md",
  {
    variants: {
      variant: {
        default:
          "border-[var(--meow-yellow)]/30 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105",
        secondary:
          "border-[var(--meow-gray-300)] bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-[var(--meow-error)]/30 bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105",
        outline: "text-foreground border-[var(--meow-gray-300)] hover:bg-[var(--meow-gray-100)]",
        success: "border-[var(--meow-success)]/30 bg-[var(--meow-success)] text-white hover:bg-[var(--meow-success)]/90 hover:scale-105",
        warning: "border-[var(--meow-warning)]/30 bg-[var(--meow-warning)] text-white hover:bg-[var(--meow-warning)]/90 hover:scale-105",
        info: "border-[var(--meow-info)]/30 bg-[var(--meow-info)] text-white hover:bg-[var(--meow-info)]/90 hover:scale-105",
        meow: "border-[var(--meow-yellow)] bg-[var(--meow-yellow)] text-[var(--meow-green-dark)] hover:bg-[var(--meow-yellow-dark)] hover:scale-105",
        meowGreen: "border-[var(--meow-green)] bg-[var(--meow-green)] text-white hover:bg-[var(--meow-green-hover)] hover:scale-105",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }