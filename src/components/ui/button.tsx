import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base styles: Center content, disable selection, transitions
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        // Default: Solid primary button (SDP Blue)
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 shadow-sm btn-text-uppercase-semibold", // Use helper class
        // Destructive: Standard destructive style
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 shadow-sm btn-text-uppercase-semibold",
        // Outline: Primary outline style (SDP Blue)
        outline:
          "border border-primary text-primary bg-transparent hover:bg-primary/5 active:bg-primary/10 btn-text-uppercase-semibold",
        // Secondary: Use SDP Orange
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70 shadow-sm btn-text-uppercase-semibold",
        // Accent: Use SDP Green - intended for success/confirmation, NOT primary actions
        accent:
          "bg-accent text-accent-foreground hover:bg-accent/90 active:bg-accent/80 shadow-sm btn-text-uppercase-semibold",
        // Ghost: Minimal styling, background on hover (Use accent for hover state)
        ghost: "hover:bg-accent/10 hover:text-accent-foreground active:bg-accent/20",
        // Link: Standard link style (Primary color)
        link: "text-primary underline-offset-4 hover:underline active:opacity-80", // No uppercase needed here
      },
      size: {
        default: "h-10 px-4 py-2 text-sm", // Standard button size (40px height)
        sm: "h-9 rounded-md px-3 text-xs", // Smaller button (36px height, smaller text)
        lg: "h-12 rounded-md px-8 text-base", // Larger button (48px height, base text size)
        icon: "h-10 w-10", // Square icon button
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
  withRipple?: boolean; // Prop to enable ripple effect
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, withRipple = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!withRipple) return;

        const button = event.currentTarget;
        // Check if the ripple container exists, otherwise add it to the button itself
        const container = button.classList.contains("ripple-container") ? button : button;
        const ripple = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        ripple.style.width = ripple.style.height = `${diameter}px`;
        // Calculate position relative to the container (button or ripple-container)
        const rect = container.getBoundingClientRect();
        ripple.style.left = `${event.clientX - rect.left - radius}px`;
        ripple.style.top = `${event.clientY - rect.top - radius}px`;
        ripple.classList.add("ripple"); // Add class for animation

        // Remove any existing ripple quickly to avoid overlap issues
         const existingRipple = container.querySelector(".ripple");
         if (existingRipple) {
             existingRipple.remove();
         }

        container.appendChild(ripple);

        // Optional: Remove ripple after animation (match CSS)
        setTimeout(() => {
           if (ripple.parentNode === container) { // Check if still attached
              ripple.remove();
           }
        }, 600);
    };


    return (
      // Add ripple container class if needed
      <Comp
        className={cn(buttonVariants({ variant, size, className }), withRipple && "ripple-container")}
        ref={ref}
        onClick={(e) => {
            if (!props.disabled) { // Only create ripple if not disabled
                 createRipple(e as React.MouseEvent<HTMLButtonElement>);
            }
            if (props.onClick) {
                props.onClick(e); // Call original onClick if it exists
            }
        }}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

    