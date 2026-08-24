import * as React from "react"
import {
  cva,
  type VariantProps,
} from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "group/button",
    "inline-flex",
    "shrink-0",
    "items-center",
    "justify-center",
    "rounded-md",
    "border",
    "border-transparent",
    "text-sm",
    "font-medium",
    "whitespace-nowrap",
    "transition-all",
    "outline-none",
    "select-none",
    "focus-visible:border-ring",
    "focus-visible:ring-3",
    "focus-visible:ring-ring/50",
    "active:not-aria-[haspopup]:translate-y-px",
    "disabled:pointer-events-none",
    "disabled:opacity-50",
    "[&_svg]:pointer-events-none",
    "[&_svg]:shrink-0",
    "[&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-primary/80",

        outline:
          "border-border bg-white text-gray-900 shadow-xs hover:bg-gray-100 hover:text-gray-900",

        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",

        ghost:
          "bg-transparent text-gray-900 hover:bg-muted hover:text-gray-900",

        destructive:
          "bg-red-50 text-red-600 hover:bg-red-100",

        link:
          "text-primary underline-offset-4 hover:underline",
      },

      size: {
        default:
          "h-9 gap-1.5 px-2.5",

        xs:
          "h-6 gap-1 rounded-lg px-2 text-xs",

        sm:
          "h-8 gap-1 rounded-lg px-2.5",

        lg:
          "h-10 gap-1.5 px-2.5",

        icon:
          "size-9",

        "icon-xs":
          "size-6 rounded-lg",

        "icon-sm":
          "size-8 rounded-lg",

        "icon-lg":
          "size-10",
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
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild
    ? Slot.Root
    : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(
        buttonVariants({
          variant,
          size,
          className,
        })
      )}
      {...props}
    />
  )
}

export {
  Button,
  buttonVariants,
}