import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow motion-safe:hover:-translate-y-px",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm motion-safe:hover:-translate-y-px",
        outline: "border border-input bg-background shadow-sm motion-safe:hover:-translate-y-px",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm motion-safe:hover:-translate-y-px",
        ghost: "motion-safe:hover:-translate-y-px",
        link: "text-primary underline-offset-4 hover:underline",
        cta: "bg-primary text-primary-foreground border-2 border-[var(--foreground)] gap-2.5 font-bold uppercase tracking-[0.08em] shadow-[5px_5px_0_var(--foreground)] transition-[transform,box-shadow] duration-[120ms] ease-[ease] hover:shadow-[6px_6px_0_var(--foreground)] motion-safe:hover:-translate-x-px motion-safe:hover:-translate-y-px active:shadow-[2px_2px_0_var(--foreground)] motion-safe:active:translate-x-0.5 motion-safe:active:translate-y-0.5",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    compoundVariants: [
      {
        variant: "cta",
        class: "h-auto rounded-full px-[34px] py-4 text-lg",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
