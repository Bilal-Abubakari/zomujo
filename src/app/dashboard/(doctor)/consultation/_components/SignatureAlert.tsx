import React, { JSX } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface SignatureAlertProps {
  hasSignature: boolean;
  onAddSignature: () => void;
}

export const SignatureAlert = ({
  hasSignature,
  onAddSignature,
}: SignatureAlertProps): JSX.Element => (
    <Alert
      variant="info"
      className={hasSignature ? 'border-blue-500 bg-blue-50' : 'border-amber-500 bg-amber-50'}
    >
      <AlertCircle className={`h-4 w-4 ${hasSignature ? 'text-blue-600' : 'text-amber-600'}`} />
      <AlertDescription className="flex items-center justify-between">
        <span className={hasSignature ? 'text-blue-800' : 'text-amber-800'}>
          {hasSignature
            ? 'Your digital signature will be included in the prescription. You can edit it if needed.'
            : 'A digital signature is required before sending the prescription.'}
        </span>
        <button
          onClick={onAddSignature}
          className={`ml-4 text-sm font-semibold underline ${hasSignature ? 'text-blue-700 hover:text-blue-900' : 'text-amber-700 hover:text-amber-900'}`}
        >
          {hasSignature ? 'Edit signature' : 'Add now'}
        </button>
      </AlertDescription>
    </Alert>
  );

