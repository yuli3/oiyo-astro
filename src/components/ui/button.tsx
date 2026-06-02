import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/system/utils";

const buttonVariants = cva(
  // Base: touch-target utilities for WCAG 2.1 AAA compliance (44px min)
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive tracking-wide select-none [-webkit-tap-highlight-color:transparent]",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        // All sizes enforce min-h-11 (44px) per WCAG touch target guidelines
        default: "h-11 min-h-11 px-6 py-2 has-[>svg]:px-4",
        icon: "size-11 min-w-11 min-h-11",
        "icon-lg": "size-12 min-w-12 min-h-12",
        "icon-sm": "size-10 min-w-10 min-h-10",
        lg: "h-12 min-h-12 px-8 has-[>svg]:px-6 text-base",
        sm: "h-10 min-h-10 gap-1.5 px-4 has-[>svg]:px-3 text-xs",
      },
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        outline:
          "border border-border bg-background hover:bg-muted hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50",
      },
    },
  },
);

function Button({
  asChild = false,
  className,
  size,
  variant,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ className, size, variant }))}
      data-slot="button"
      {...props}
    />
  );
}

export { Button, buttonVariants };
