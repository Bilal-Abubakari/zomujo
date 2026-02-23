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
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-[#0000008c]',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

type DialogOverlayProps = { dialogOverlayClassName?: string };

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> &
    React.HTMLAttributes<typeof DialogPrimitive.Content> &
    Pick<ModalProps, 'showClose' | 'setState'> &
    DialogOverlayProps
>(({ className, children, showClose, setState, dialogOverlayClassName, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay className={dialogOverlayClassName} />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg',
        className,
      )}
      {...props}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close
          className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 z-50 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
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
    className={cn('text-lg leading-none font-semibold tracking-tight', className)}
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
    className={cn('text-muted-foreground text-sm', className)}
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
} & DialogOverlayProps;

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
  dialogOverlayClassName,
}: ModalProps): JSX.Element => (
  <Dialog open={open} modal={true}>
    <DialogContent
      dialogOverlayClassName={dialogOverlayClassName}
      showClose={showClose}
      setState={setState}
      className={className}
    >
      {showImage && (
        <div>
          {imageVariant === ImageVariant.Success && (
            <>
              <Image src={SuccessIllustration} alt={imageVariant} className="m-auto h-50 w-50" />
              <h2 className="text-primary mt-3 -mb-6 font-semibold">Success</h2>
            </>
          )}
          {imageVariant === ImageVariant.Email && (
            <>
              <Image src={EmailIllustration} alt={imageVariant} className="m-auto h-50 w-50" />
              <h2 className="text-primary mt-3 -mb-6 font-semibold">Email Verification</h2>
            </>
          )}
          {imageVariant === ImageVariant.Error && (
            <>
              <Image src={ErrorIllustration} alt={imageVariant} className="m-auto h-50 w-50" />
              <h2 className="mt-3 -mb-6 font-semibold text-red-500">Error</h2>
            </>
          )}
        </div>
      )}
      {(headerChild || title || description) && (
        <DialogHeader>
          {headerChild ? (
            headerChild
          ) : (
            <>
              {title && <DialogTitle>{title}</DialogTitle>}
              {description && <DialogDescription>{description}</DialogDescription>}
            </>
          )}
        </DialogHeader>
      )}
      {content}
      {footer && <DialogFooter>{footer}</DialogFooter>}
    </DialogContent>
  </Dialog>
);

export type ConfirmationProps = {
  title?: string;
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
  title,
  isLoading,
}: ConfirmationProps): JSX.Element => (
  <Modal
    title={title}
    open={open}
    content={
      <div>
        {title && <DialogTitle>{title}</DialogTitle>}
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
