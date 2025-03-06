'use client';
import React, { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';
import { Eye, EyeClosed } from 'lucide-react';

export interface InputProps extends React.ComponentProps<'input'> {
  labelClassName?: string;
  labelName?: string;
  enablePasswordToggle?: boolean;
  rightIcon?: ReactNode;
  leftIcon?: ReactNode;
  error?: string;
  wrapperClassName?: string;
  defaultMaxWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      name,
      labelName,
      labelClassName,
      value,
      enablePasswordToggle = false,
      error,
      rightIcon,
      leftIcon,
      wrapperClassName,
      defaultMaxWidth = true,
      ...props
    },
    ref,
  ) => {
    const [revealPassword, setRevealPassword] = useState(false);

    type = revealPassword ? 'text' : type;

    return (
      <div
        className={cn(
          'relative grid w-full items-center gap-2',
          wrapperClassName,
          defaultMaxWidth ? 'max-w-sm' : '',
        )}
      >
        {labelName && (
          <Label htmlFor={name} className={labelClassName}>
            {labelName}
          </Label>
        )}
        <input
          type={type}
          className={cn(
            'h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:border-2 focus:border-primary focus:shadow-base focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            { 'border-red-500': error, 'focus:border-red-500': error, 'pl-11': leftIcon },
            className,
          )}
          name={name}
          value={value}
          ref={ref}
          {...props}
        />
        {error && <small className="-mt-1 text-xs font-medium text-red-500">{error}</small>}
        {!rightIcon && enablePasswordToggle && (
          <button
            className={cn('absolute right-2 h-2 hover:bg-transparent', { 'top-8': labelName })}
            type="button"
            onClick={() => setRevealPassword((prev) => !prev)}
          >
            {revealPassword ? <Eye size={17} /> : <EyeClosed size={17} />}
          </button>
        )}
        {rightIcon && (
          <div
            className={cn('absolute right-3', {
              'top-8': labelName,
            })}
          >
            {rightIcon}
          </div>
        )}
        {leftIcon && (
          <div
            className={cn('absolute left-3', {
              'top-8': labelName,
            })}
          >
            {leftIcon}
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
