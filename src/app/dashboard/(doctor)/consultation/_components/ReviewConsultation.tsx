import React, { JSX } from 'react';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/lib/hooks';
import { selectDiagnoses } from '@/lib/features/appointments/appointmentSelector';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, Printer, MailCheck } from 'lucide-react';
import { DiagnosesList } from '@/app/dashboard/(doctor)/consultation/_components/ConditionCard';
import { selectUserName } from '@/lib/features/auth/authSelector';

const ReviewConsultation = (): JSX.Element => {
  const diagnoses = useAppSelector(selectDiagnoses);
  const doctorName = useAppSelector(selectUserName);
  return (
    <div>
      <div>
        <span className="font-bold">Medicine Summary</span>
        <div className="mt-5 rounded-xl border border-gray-300 p-4">
          <div className="flex justify-between">
            <span className="font-bold">
              Prescription{' '}
              <Badge className="px-2 py-1.5" variant="brown">
                {diagnoses.length}
              </Badge>
            </span>
            <div className="flex gap-2.5">
              <div className="mr-3.5 flex items-center space-x-2">
                <Label htmlFor="airplane-mode">Add digital Signature</Label>
                <Switch id="airplane-mode" />
              </div>
              <Button variant="outline" child={<Eye />} />
              <Button variant="outline" child={<Printer />} />
              <Button
                variant="outline"
                child={
                  <>
                    <span>Send</span>
                    <MailCheck />
                  </>
                }
              />
            </div>
          </div>
          <div className="mt-4">
            <DiagnosesList doctorName={doctorName} conditions={diagnoses} />
          </div>
        </div>
      </div>
      <div>
        <span className="font-bold">Consultation Notes</span>
      </div>
    </div>
  );
};

export default ReviewConsultation;
