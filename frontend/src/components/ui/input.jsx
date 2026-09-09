import * as React from "react"
import { cn } from "cn"

const Input = React.forwardRef(function Input({
  className,
  type,
  ...props
}, ref) {
  return (
    <input
      type={type}
      ref={ref}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-xl border border-linen bg-white px-3 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-evergreen placeholder:text-mutedtext focus-visible:border-evergreen focus-visible:ring-3 focus-visible:ring-evergreen/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-disabledbg disabled:text-mutedtext aria-invalid:border-terracotta aria-invalid:ring-3 aria-invalid:ring-terracotta/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
})

export { Input }