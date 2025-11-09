import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border-2 border-[var(--meow-gray-300)] bg-background px-4 py-3 text-sm font-medium text-gray-900 shadow-sm ring-offset-background transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/60 placeholder:font-normal focus-visible:outline-none focus-visible:border-[var(--meow-green)] focus-visible:ring-3 focus-visible:ring-[var(--meow-green)]/20 focus-visible:ring-offset-0 focus-visible:shadow-md hover:border-[var(--meow-gray-400)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--meow-gray-100)]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
