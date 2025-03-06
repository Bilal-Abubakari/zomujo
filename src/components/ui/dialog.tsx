'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JSX, ReactNode } from 'react';
import Image from 'next/image';
import { EmailIllustration, ErrorIllustration, SuccessIllustration } from '@/assets/images';
import { Button } from '@/components/ui/button';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> &
    React.HTMLAttributes<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-[#0000008c] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> &
    React.HTMLAttributes<typeof DialogPrimitive.Content> &
    Pick<ModalProps, 'showClose' | 'setState'>
>(({ className, children, showClose, setState, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
        className,
      )}
      {...props}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation();
            if (setState) {
              setState(!open);
            }
          }}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): JSX.Element => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): JSX.Element => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> &
    React.HTMLAttributes<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> &
    React.HTMLAttributes<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export enum ImageVariant {
  Success = 'success',
  Error = 'error',
  Email = 'email',
}

type ModalProps = {
  open: boolean;
  headerChild?: ReactNode;
  title?: string;
  description?: string;
  content: ReactNode;
  footer?: ReactNode;
  showClose?: boolean;
  imageVariant?: ImageVariant;
  showImage?: boolean;
  setState?: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
};

const Modal = ({
  description,
  title,
  headerChild,
  content,
  footer,
  open,
  showClose,
  imageVariant,
  showImage = false,
  setState,
  className,
}: ModalProps): JSX.Element => (
  <Dialog open={open} modal={true}>
    <DialogContent showClose={showClose} setState={setState} className={className}>
      {showImage && (
        <div>
          {imageVariant === ImageVariant.Success && (
            <>
              <Image
                src={SuccessIllustration}
                alt={imageVariant}
                className="m-auto h-[200px] w-[200px]"
              />
              <h2 className="-mb-6 mt-3 font-semibold text-primary">Success</h2>
            </>
          )}
          {imageVariant === ImageVariant.Email && (
            <>
              <Image
                src={EmailIllustration}
                alt={imageVariant}
                className="m-auto h-[200px] w-[200px]"
              />
              <h2 className="-mb-6 mt-3 font-semibold text-primary">Email Verification</h2>
            </>
          )}
          {imageVariant === ImageVariant.Error && (
            <>
              <Image
                src={ErrorIllustration}
                alt={imageVariant}
                className="m-auto h-[200px] w-[200px]"
              />
              <h2 className="-mb-6 mt-3 font-semibold text-red-500">Error</h2>
            </>
          )}
        </div>
      )}
      <DialogHeader>
        {headerChild ? (
          headerChild
        ) : (
          <>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </>
        )}
      </DialogHeader>
      {content}
      {footer && <DialogFooter>{footer}</DialogFooter>}
    </DialogContent>
  </Dialog>
);

export type ConfirmationProps = {
  description: ReactNode | string;
  acceptButtonTitle?: string;
  rejectButtonTitle?: string;
  acceptCommand: () => void;
  rejectCommand: () => void;
  isLoading?: boolean;
} & Pick<ModalProps, 'open' | 'showClose' | 'setState'>;

const Confirmation = ({
  open,
  showClose,
  description,
  acceptButtonTitle,
  rejectButtonTitle,
  acceptCommand,
  rejectCommand,
  setState,
  isLoading,
}: ConfirmationProps): JSX.Element => (
  <Modal
    open={open}
    content={
      <div>
        <p>{description}</p>
        <div className="flex justify-end gap-4 pt-4">
          <Button
            onClick={acceptCommand}
            child={acceptButtonTitle ? acceptButtonTitle : 'Yes, Accept'}
            isLoading={isLoading}
          />
          <Button
            child={rejectButtonTitle ? rejectButtonTitle : 'No, Decline'}
            variant={'destructive'}
            onClick={rejectCommand}
            disabled={isLoading}
          />
        </div>
      </div>
    }
    showClose={isLoading ? false : showClose}
    setState={setState}
  />
);

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Modal,
  Confirmation,
};
