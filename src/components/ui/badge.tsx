import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { JSX } from 'react';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-foreground text-primary hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-error-50 text-destructive hover:bg-error-50 ',
        outline: 'text-foreground',
        brown:
          'rounded-full  bg-warning-50 px-2 text-sm font-medium text-warning-600 border-none text-sm w-fit',
        blue: 'rounded-full text-blue-cobalt  bg-blue-lightPowder px-2 text-sm font-medium  border-none text-sm w-fit',
        gray: 'rounded-full text-grayscale-500  bg-grayscale-75 px-2 text-sm font-medium  border-none text-sm w-fit',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: Readonly<BadgeProps>): JSX.Element {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
