import * as React from 'react';
import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Landing-page button — brand-palette variants ported from the v1 reference.
// Kept separate from the dashboard's shadcn Button so the marketing palette
// doesn't leak into the app UI.
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-clawix-cta text-white hover:bg-clawix-cta/90',
        secondary: 'bg-clawix-accent text-white hover:bg-clawix-accent/90',
        outline:
          'border border-clawix-accent text-clawix-accent bg-transparent hover:bg-clawix-accent hover:text-white',
        ghost: 'hover:bg-muted hover:text-foreground',
        link: 'text-clawix-teal underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-12 rounded-md px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface LandingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const LandingButton = React.forwardRef<HTMLButtonElement, LandingButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
LandingButton.displayName = 'LandingButton';

export { LandingButton, buttonVariants };
