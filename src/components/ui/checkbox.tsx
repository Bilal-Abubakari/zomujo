'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  labelName?: string;
  labelClassName?: string;
  name?: string;
  title?: string;
  titleClassName?: string;
  titleLabelClassName?: string;
  containerClassName?: string;
}

const Checkbox = React.forwardRef<React.ComponentRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  (
    {
      className,
      labelName,
      name,
      labelClassName,
      title,
      titleClassName,
      titleLabelClassName,
      containerClassName,
      ...props
    },
    ref,
  ) => (
    <div className={cn('flex items-center gap-2', containerClassName)}>
      <CheckboxPrimitive.Root
        id={name}
        ref={ref}
        className={cn(
          'peer border-primary ring-offset-background focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground h-4 w-4 shrink-0 rounded-sm border focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={cn('flex items-center justify-center text-current')}
        >
          <Check className="h-4 w-4" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <div className={titleLabelClassName}>
        {title && <p className={titleClassName}> {title}</p>}
        {labelName && (
          <Label htmlFor={name} className={labelClassName}>
            {labelName}
          </Label>
        )}
      </div>
    </div>
  ),
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
