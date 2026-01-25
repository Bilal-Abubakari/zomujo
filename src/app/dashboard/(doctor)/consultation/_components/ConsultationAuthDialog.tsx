'use client';
import React, { JSX, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck } from 'lucide-react';

interface ConsultationAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (code: string) => Promise<void>;
  isLoading: boolean;
  title?: string;
  description?: string;
  submitButtonText?: string;
}

const ConsultationAuthDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  title = 'Authenticate Consultation',
  description = 'Please enter the 6-digit authentication code provided by the patient to continue.',
  submitButtonText = 'Authenticate',
}: ConsultationAuthDialogProps): JSX.Element => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Authentication code is required');
      return;
    }

    if (code.trim().length > 6) {
      setError('Code must be maximum 6 characters');
      return;
    }

    await onSubmit(code.trim());
    setCode('');
  };

  const handleCodeChange = (value: string): void => {
    // Only allow alphanumeric characters and limit to 6
    const sanitized = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
    setCode(sanitized);
    if (error) {
      setError('');
    }
  };

  const handleOpenChange = (newOpen: boolean): void => {
    if (!isLoading) {
      setCode('');
      setError('');
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showClose={!isLoading}>
        <DialogHeader>
          <div className="bg-primary-light mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <ShieldCheck className="text-primary h-6 w-6" />
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="auth-code">Authentication Code</Label>
              <Input
                id="auth-code"
                placeholder="Enter code"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                disabled={isLoading}
                className="text-center text-lg font-semibold tracking-wider"
                maxLength={6}
                autoComplete="off"
                autoFocus
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
              <p className="text-muted-foreground text-xs">
                Ask the patient for the authentication code sent to their email and notifications.
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col space-y-2 sm:flex-col sm:space-x-0">
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading || !code.trim()}
              child={submitButtonText}
              className="w-full"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
              child="Cancel"
              className="w-full"
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationAuthDialog;
