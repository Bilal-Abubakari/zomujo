import React, { JSX } from 'react';
import { Modal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MailCheck } from 'lucide-react';

interface PrescriptionNotesModalProps {
  open: boolean;
  onClose: () => void;
  prescriptionNotes: string;
  onNotesChange: (notes: string) => void;
  isSendingPrescription: boolean;
  onSendPrescription: () => void;
}

export const PrescriptionNotesModal = ({
  open,
  onClose,
  prescriptionNotes,
  onNotesChange,
  isSendingPrescription,
  onSendPrescription,
}: PrescriptionNotesModalProps): JSX.Element => (
    <Modal
      setState={onClose}
      open={open}
      content={
        <div className="space-y-4 p-6">
          <h2 className="text-lg font-bold text-gray-900">Additional Prescription Notes</h2>
          <Textarea
            value={prescriptionNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={4}
            placeholder="Enter any additional notes or instructions for the prescription..."
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1" child={<span>Close</span>} />
            <Button
              variant="default"
              onClick={onSendPrescription}
              isLoading={isSendingPrescription}
              disabled={isSendingPrescription}
              className="flex-1"
              child={
                <>
                  <MailCheck className="mr-2 h-4 w-4" />
                  <span>Send Prescription</span>
                </>
              }
            />
          </div>
        </div>
      }
      showClose={true}
    />
  );

