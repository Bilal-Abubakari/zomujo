'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

import { cn, getInitials } from '@/lib/utils';
import { JSX, useMemo } from 'react';

const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> &
    React.HTMLAttributes<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full',
      className,
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> &
    React.HTMLAttributes<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> &
    React.HTMLAttributes<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'bg-muted flex h-full w-full items-center justify-center rounded-full',
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

type AvatarCompProps = {
  name: string;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
};

function AvatarComp({ imageSrc, name, imageAlt, className }: AvatarCompProps): JSX.Element {
  const initials = useMemo(() => getInitials(name), [name]);
  return (
    <Avatar className={className}>
      <AvatarImage src={imageSrc} alt={imageAlt} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}

type AvatarWithNameProps = {
  firstName: string;
  lastName: string;
  imageSrc: string;
};

function AvatarWithName({ firstName, lastName, imageSrc }: AvatarWithNameProps): JSX.Element {
  const name = `${firstName} ${lastName}`;
  return (
    <div className="flex items-center justify-start gap-2">
      <AvatarComp imageSrc={imageSrc} name={name} className="h-7 w-7" />{' '}
      {`${firstName} ${lastName}`}
    </div>
  );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarComp, AvatarWithName };
