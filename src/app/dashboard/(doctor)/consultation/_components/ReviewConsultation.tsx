import React, { JSX, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/lib/hooks';
import { selectComplaints, selectDiagnoses } from '@/lib/features/appointments/appointmentSelector';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, Printer, MailCheck, ChevronDown } from 'lucide-react';
import { DiagnosesList } from '@/app/dashboard/(doctor)/consultation/_components/ConditionCard';
import { selectUserName } from '@/lib/features/auth/authSelector';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const ReviewConsultation = (): JSX.Element => {
  const diagnoses = useAppSelector(selectDiagnoses);
  const complaints = useAppSelector(selectComplaints);
  const doctorName = useAppSelector(selectUserName);
  const [isComplaintsOpen, setIsComplaintsOpen] = useState(false);
  return (
    <div className="flex flex-row">
      <div className="px-5">
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
      <div className="basis-md border-l border-gray-300 p-5">
        <span className="font-bold">Consultation Notes</span>
        <Collapsible
          open={isComplaintsOpen}
          onOpenChange={setIsComplaintsOpen}
          className="mt-5 w-[250px] space-y-2"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Complaints</h4>
            <CollapsibleTrigger asChild>
              <Button
                child={
                  <>
                    <ChevronDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </>
                }
                variant="ghost"
                size="sm"
                className="w-9 p-0"
              ></Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-2">
            {complaints?.map((complaint) => (
              <div
                key={complaint}
                className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                {complaint}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default ReviewConsultation;
