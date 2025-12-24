import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 ease-in-out active:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#321b22E5]  text-white shadow-lg shadow-[#321b22E5]/30 hover:from-[#c48765] hover:to-[#C7B371] dark:shadow-[#c48765]/30",
        destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-red-700 dark:shadow-red-900/30",
        outline: "border-2 border-[#c48765] bg-transparent text-[#c48765] hover:bg-[#c48765]/20 dark:border-[#C7B371] dark:text-[#C7B371] dark:hover:bg-[#C7B371]/20",
        secondary: "bg-gradient-to-r from-[#c48765] to-[#C7B371] text-white shadow-lg shadow-[#c48765]/30 hover:from-[#C7B371] hover:to-[#EACB9F]",
        ghost: "text-[#c48765] hover:bg-[#c48765]/10 hover:text-[#C7B371] dark:text-[#C7B371] dark:hover:bg-[#C7B371]/10",
        link: "text-[#c48765] underline-offset-2 hover:underline dark:text-[#C7B371]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 rounded-md text-xs",
        lg: "h-12 px-6 rounded-md text-base",
        icon: "h-10 w-10",
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