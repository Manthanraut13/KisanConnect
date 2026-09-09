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
        "h-9 w-full min-w-0 rounded-xl border border-outline-variant bg-surface-lowest px-3 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-on-surface placeholder:text-on-surface-variant/60 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-on-surface-variant aria-invalid:border-error aria-invalid:ring-3 aria-invalid:ring-error/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
})

export { Input }