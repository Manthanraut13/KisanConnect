import * as React from "react"
import { cva } from "class-variance-authority";
import { cn } from "cn"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:border-evergreen focus-visible:ring-3 focus-visible:ring-evergreen/10 active:not-aria-[haspopup]:translate-y-px active:not-aria-[haspopup]:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 disabled:bg-disabledbg disabled:text-mutedtext aria-invalid:border-terracotta aria-invalid:ring-3 aria-invalid:ring-terracotta/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-terracotta text-canvas hover:bg-terracotta-dark",
        outline:
          "border-linen bg-white text-evergreen hover:bg-wash-muted hover:text-evergreen aria-expanded:bg-wash-muted aria-expanded:text-evergreen",
        secondary:
          "bg-evergreen text-canvas hover:bg-forest aria-expanded:bg-evergreen aria-expanded:text-canvas",
        ghost:
          "text-evergreen hover:bg-wash-muted hover:text-evergreen aria-expanded:bg-wash-muted aria-expanded:text-evergreen",
        destructive:
          "bg-wash-terracotta text-terracotta hover:bg-wash-terracotta focus-visible:border-terracotta/40 focus-visible:ring-terracotta/20",
        link: "text-terracotta underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-xl px-2 text-xs in-data-[slot=button-group]:rounded-xl has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-xl px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-xl has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8 rounded-xl",
        "icon-xs":
          "size-6 rounded-xl in-data-[slot=button-group]:rounded-xl [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-xl in-data-[slot=button-group]:rounded-xl",
        "icon-lg": "size-9 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }