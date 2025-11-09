import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.96] relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0",
        outline:
          "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent shadow-sm hover:shadow-lg",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",
        ghost: "hover:bg-accent/70 hover:text-accent-foreground backdrop-blur-sm",
        link: "text-primary underline-offset-4 hover:underline decoration-2 hover:decoration-primary",
        meow: "bg-[var(--meow-yellow)] text-[var(--meow-green-dark)] hover:bg-[var(--meow-yellow-dark)] shadow-lg hover:shadow-[var(--shadow-glow-yellow)] font-bold hover:-translate-y-1 active:translate-y-0 border-2 border-[var(--meow-yellow-dark)]/20",
        meowGreen: "bg-[var(--meow-green)] text-white hover:bg-[var(--meow-green-hover)] shadow-lg hover:shadow-[var(--shadow-brand-lg)] font-bold hover:-translate-y-1 active:translate-y-0",
        meowOutline: "border-2 border-[var(--meow-green)] text-[var(--meow-green)] bg-white hover:bg-[var(--meow-green)] hover:text-white shadow-sm hover:shadow-lg font-bold hover:-translate-y-1 active:translate-y-0",
        meowGradient: "bg-gradient-to-r from-[var(--meow-green)] to-[var(--meow-green-dark)] text-white hover:from-[var(--meow-green-hover)] hover:to-[var(--meow-green)] shadow-lg hover:shadow-[var(--shadow-brand-lg)] font-bold hover:-translate-y-1 active:translate-y-0",
        success: "bg-[var(--meow-success)] text-white hover:bg-[var(--meow-success)]/90 shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0",
        warning: "bg-[var(--meow-warning)] text-white hover:bg-[var(--meow-warning)]/90 shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0",
        info: "bg-[var(--meow-info)] text-white hover:bg-[var(--meow-info)]/90 shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0",
        premium: "bg-gradient-to-r from-[var(--meow-purple)] to-[var(--meow-pink)] text-white shadow-lg hover:shadow-2xl font-bold hover:-translate-y-1 active:translate-y-0 hover:scale-105",
      },
      size: {
        default: "h-11 px-6 py-2.5 text-sm",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-13 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-13 w-13",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
