'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';
import { Label } from './label';

export interface SwitchProps extends React.ComponentProps<typeof SwitchPrimitives.Root> {
  labelClassName?: string;
  error?: string;
  name?: string;
  label?: string;
  labelPosition?: 'left' | 'right';
  wrapperClassName?: string;
}

const Switch = React.forwardRef<React.ComponentRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  (
    { className, name, labelClassName, label, labelPosition = 'right', wrapperClassName, ...props },
    ref,
  ) => (
    <div className={cn('flex items-center gap-4', wrapperClassName)}>
      {labelPosition === 'left' && label && (
        <Label htmlFor={name} className={labelClassName}>
          {label}
        </Label>
      )}
      <SwitchPrimitives.Root
        className={cn(
          'peer focus-visible:ring-ring focus-visible:ring-offset-background data-[state=checked]:bg-primary data-[state=unchecked]:bg-input inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
        ref={ref}
        name={name}
        id={name}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            'bg-background pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
          )}
        />
      </SwitchPrimitives.Root>
      {labelPosition === 'right' && label && (
        <Label htmlFor={name} className={labelClassName}>
          {label}
        </Label>
      )}
    </div>
  ),
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
