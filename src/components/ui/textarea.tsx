import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';

export interface TextProps extends React.ComponentProps<'textarea'> {
  labelClassName?: string;
  labelName?: string;
  error?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextProps>(
  ({ className, labelName, name, labelClassName, error, onChange, value, ...props }, ref) => (
    <div className="relative grid w-full items-center gap-2">
      {labelName && (
        <Label htmlFor={name} className={labelClassName}>
          {labelName}
        </Label>
      )}
      <textarea
        id="text"
        className={cn(
          'border-input bg-background ring-offset-background placeholder:text-muted-foreground flex min-h-[80px] w-full rounded-md border px-3 py-2 text-base focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
          'focus:border-primary focus:shadow-base focus:border-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          { 'border-red-500': error, 'focus:border-red-500': error },
        )}
        name={name}
        value={value}
        onChange={onChange}
        ref={ref}
        {...props}
      />
      <small className="text-red-500">{error}</small>
    </div>
  ),
);
Textarea.displayName = 'Textarea';

export { Textarea };
