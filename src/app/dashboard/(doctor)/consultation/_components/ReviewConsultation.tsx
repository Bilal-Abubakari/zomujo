import React, { JSX, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/lib/hooks';
import {
  selectComplaints,
  selectDiagnoses,
  selectPatientSymptoms,
} from '@/lib/features/appointments/appointmentSelector';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, Printer, MailCheck, ChevronDown, Info } from 'lucide-react';
import { DiagnosesList } from '@/app/dashboard/(doctor)/consultation/_components/ConditionCard';
import { selectUserName } from '@/lib/features/auth/authSelector';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SymptomsType } from '@/types/consultation.interface';
import { capitalize } from '@/lib/utils';
import { TooltipComp } from '@/components/ui/tooltip';

const ReviewConsultation = (): JSX.Element => {
  const diagnoses = useAppSelector(selectDiagnoses);
  const complaints = useAppSelector(selectComplaints);
  const doctorName = useAppSelector(selectUserName);
  const symptoms = useAppSelector(selectPatientSymptoms);
  const [isComplaintsOpen, setIsComplaintsOpen] = useState(false);
  const [isSymptomsOpen, setIsSymptomsOpen] = useState(false);

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
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition-all hover:shadow-md"
              >
                {complaint}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
        <Collapsible
          open={isSymptomsOpen}
          onOpenChange={setIsSymptomsOpen}
          className="mt-5 w-[250px] space-y-2"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Symptoms</h4>
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
          {symptoms && (
            <CollapsibleContent className="mt-4 space-y-2">
              {Object.keys(symptoms)?.map((key) => {
                const symptomType = key as SymptomsType;
                const symptomList = symptoms[symptomType];
                if (!symptomList || symptomList.length === 0) {
                  return null;
                }
                return (
                  <div key={key} className="mt-4">
                    <div className="text-sm font-semibold">{capitalize(symptomType)} System</div>
                    <div className="mt-2 flex flex-col gap-2">
                      {symptomList.map(({ name, notes }) => (
                        <div key={name} className="flex items-center gap-x-2 text-sm text-gray-500">
                          <span>{name}</span>
                          {notes && (
                            <span>
                              {' '}
                              <TooltipComp tip={notes}>
                                <Info size={16} />
                              </TooltipComp>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CollapsibleContent>
          )}
        </Collapsible>
      </div>
    </div>
  );
};

export default ReviewConsultation;
