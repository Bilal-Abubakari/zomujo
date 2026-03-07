'use client';
import React, { JSX, useState, SubmitEvent } from 'react';
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
import { ShieldCheck, TestTube2, AlertCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConsultationAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (code: string, isInvestigating?: boolean) => Promise<void>;
  isLoading: boolean;
  title?: string;
  description?: string;
  submitButtonText?: string;
  hasInvestigation?: boolean;
}

const ConsultationAuthDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  title = 'Authenticate Consultation',
  description = 'Please enter the 6-digit authentication code provided by the patient to continue.',
  submitButtonText = 'Authenticate',
  hasInvestigation = false,
}: ConsultationAuthDialogProps): JSX.Element => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [allowPostInvestigation, setAllowPostInvestigation] = useState(false);

  const handleSubmit = async (e: SubmitEvent): Promise<void> => {
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

    await onSubmit(code.trim(), hasInvestigation ? allowPostInvestigation : undefined);
    setCode('');
    setAllowPostInvestigation(false);
  };

  const handleCodeChange = (value: string): void => {
    // Only allow alphanumeric characters and limit to 6
    const sanitized = value.replaceAll(/[^a-zA-Z0-9]/g, '').slice(0, 6);
    setCode(sanitized);
    if (error) {
      setError('');
    }
  };

  const handleOpenChange = (newOpen: boolean): void => {
    if (!isLoading) {
      setCode('');
      setError('');
      setAllowPostInvestigation(false);
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
            {hasInvestigation && (
              <Alert variant="info" className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <div className="flex items-start gap-2">
                    <TestTube2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <div className="flex-1 text-sm">
                      You have requested investigation(s) for this patient. If you want to allow the
                      patient to schedule a post-investigation consultation, please check the box
                      below.
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {hasInvestigation && (
              <div className="flex items-start space-x-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <Checkbox
                  id="allow-post-investigation"
                  checked={allowPostInvestigation}
                  onCheckedChange={(checked) => setAllowPostInvestigation(checked === true)}
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="allow-post-investigation"
                    className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Allow patient to schedule post-investigation consultation
                  </Label>
                  <p className="text-muted-foreground mt-1 text-xs">
                    This enables the patient to book a follow-up appointment after completing their
                    lab tests or radiology investigations.
                  </p>
                </div>
              </div>
            )}

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
