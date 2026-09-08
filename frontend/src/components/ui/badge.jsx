import * as React from "react"
import { cva } from "class-variance-authority";
import { cn } from "cn"
import { Slot } from "radix-ui"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.03em] whitespace-nowrap transition-all focus-visible:border-evergreen focus-visible:ring-[3px] focus-visible:ring-evergreen/10 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-terracotta aria-invalid:ring-terracotta/20 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-forest text-white",
        secondary: "bg-linen text-evergreen",
        destructive:
          "bg-wash-terracotta text-terracotta focus-visible:ring-terracotta/20",
        outline: "border-linen bg-transparent text-evergreen",
        ghost: "text-mutedtext hover:bg-wash-muted hover:text-evergreen",
        link: "text-terracotta underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }