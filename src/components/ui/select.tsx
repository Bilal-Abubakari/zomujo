'use client';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react';

import { cn } from '@/lib/utils';
import React, {
  ComponentPropsWithoutRef,
  ComponentRef,
  forwardRef,
  JSX,
  Ref,
  useState,
} from 'react';
import { Control, Controller } from 'react-hook-form';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import LoadingOverlay from '../loadingOverlay/loadingOverlay';

export interface SelectOption {
  label: string;
  value: string;
}

type SelectInputProps = {
  name: string;
  options: SelectOption[];
  error?: string;
  ref: Ref<HTMLButtonElement>;
  label?: string;
  placeholder?: string;
  // Any is used here because the type of control is known at the instance this property is passed in as prop
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  className?: string;
};

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = forwardRef<
  ComponentRef<typeof SelectPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & Pick<SelectInputProps, 'error'>
>(({ className, children, error, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'border-input bg-background placeholder:text-muted-foreground focus:border-primary focus:shadow-base flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:border-2 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-[#71717a] [&>span]:line-clamp-1',
      { 'border-red-500': error, 'focus:border-red-500': error },
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = forwardRef<
  ComponentRef<typeof SelectPrimitive.ScrollUpButton>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = forwardRef<
  ComponentRef<typeof SelectPrimitive.ScrollDownButton>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = forwardRef<
  ComponentRef<typeof SelectPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-96 min-w-32 overflow-hidden rounded-md border shadow-md',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)',
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = forwardRef<
  ComponentRef<typeof SelectPrimitive.Label>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('py-1.5 pr-2 pl-8 text-sm font-semibold', className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = forwardRef<
  ComponentRef<typeof SelectPrimitive.Item>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = forwardRef<
  ComponentRef<typeof SelectPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('bg-muted -mx-1 my-1 h-px', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

const SelectInput = ({
  control,
  ref,
  options,
  error,
  name,
  label,
  placeholder = '',
  className,
}: SelectInputProps): JSX.Element => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <Select {...field} onValueChange={(value) => field.onChange(value)}>
        {label && <Label>{label}</Label>}
        <SelectTrigger className={cn('max-w-sm', className)} ref={ref} error={error}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {Array.isArray(options) &&
            options.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
        </SelectContent>
        {error && <small className="-mt-1 text-xs font-medium text-red-500">{error}</small>}
      </Select>
    )}
  />
);

type SelectInputV2Props = Omit<SelectInputProps, 'ref' | 'name' | 'control'> & {
  onChange: (value: string) => void;
  value: string;
  selectLabel?: string;
};
const SelectInputV2 = ({
  className,
  placeholder,
  options,
  onChange,
  value,
  selectLabel,
  label,
}: SelectInputV2Props): JSX.Element => (
  <Select value={value} onValueChange={onChange}>
    {label && <Label>{label}</Label>}
    <SelectTrigger className={className}>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>{selectLabel}</SelectLabel>
        {options.map(({ value, label }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  </Select>
);
type ComboboxProps = {
  isLoading?: boolean;
  wrapperClassName?: string;
  className?: string;
  defaultMaxWidth?: boolean;
  value: string;
  onChange: (value: string) => void;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  isLoadingResults?: boolean;
} & Pick<SelectInputProps, 'options' | 'label' | 'placeholder'>;
const Combobox = ({
  options,
  label,
  defaultMaxWidth = true,
  wrapperClassName,
  className,
  placeholder,
  value: currentValue,
  onChange,
  isLoading,
  searchPlaceholder,
  onSearchChange,
  isLoadingResults,
}: ComboboxProps): JSX.Element => {
  const [open, setOpen] = useState(false);
  const [currentOption, setCurrentOption] = useState<string | null>(null);

  return (
    <div
      className={cn(
        'relative grid w-full items-center gap-2',
        wrapperClassName,
        defaultMaxWidth ? 'max-w-sm' : '',
      )}
    >
      {label && <Label>{label}</Label>}
      <Popover modal={true} open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn('hover:bg-background! text-accent-foreground justify-between', className)}
            child={
              <>
                {isLoading ? 'Loading... Please wait' : currentOption || placeholder}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </>
            }
          />
        </PopoverTrigger>
        <PopoverContent className="z-100 w-[85vw] max-w-sm p-0">
          {isLoadingResults && <LoadingOverlay />}
          <Command>
            <CommandInput placeholder={searchPlaceholder} onValueChange={onSearchChange} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {Array.isArray(options) &&
                  options.map(({ label, value }) => (
                    <CommandItem
                      key={value}
                      value={label}
                      onSelect={() => {
                        setCurrentOption(label);
                        onChange(value);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === currentValue ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {label}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectInput,
  Combobox,
  SelectInputV2,
};
