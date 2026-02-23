import React, { JSX } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

interface ReviewHeaderProps {
  isPastConsultation: boolean;
  hasSignature: boolean;
  addSignature: boolean;
  onSignatureToggle: () => void;
  onAddReferral?: () => void;
}

export const ReviewHeader = ({
  isPastConsultation,
  hasSignature,
  addSignature,
  onSignatureToggle,
  onAddReferral,
}: ReviewHeaderProps): JSX.Element => (
  <div className="from-primary/10 to-primary/5 flex flex-col gap-4 rounded-lg bg-linear-to-r p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
    <div className="flex-1">
      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
        {isPastConsultation ? 'Consultation Summary' : 'Consultation Review'}
      </h1>
      <p className="mt-1 text-xs text-gray-600 sm:text-sm">
        {isPastConsultation
          ? 'Summary of completed consultation'
          : 'Review all consultation details before finalizing'}
      </p>
    </div>
    {!isPastConsultation && (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:gap-4">
        <div className="flex items-center justify-between space-x-2 rounded-md border bg-white px-3 py-2 sm:justify-start sm:px-4">
          <Label htmlFor="signature" className="cursor-pointer text-xs font-medium sm:text-sm">
            {hasSignature ? 'Edit Digital Signature' : 'Add Digital Signature'}
          </Label>
          <Switch checked={addSignature} id="signature" onCheckedChange={onSignatureToggle} />
        </div>
        {onAddReferral && (
          <Button
            variant="outline"
            onClick={onAddReferral}
            className="w-full sm:w-auto"
            child={
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Refer Patient
              </>
            }
          />
        )}
      </div>
    )}
  </div>
);
