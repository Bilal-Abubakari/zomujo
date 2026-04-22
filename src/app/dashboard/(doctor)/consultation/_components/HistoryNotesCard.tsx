import React, { JSX } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivitySquare, FileText, Info, Stethoscope } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TooltipComp } from '@/components/ui/tooltip';
import { capitalize } from '@/lib/utils';
import { IAppointment } from '@/types/appointment.interface';
import { IPatientSymptomMap, SymptomsType } from '@/types/consultation.interface';

interface HistoryNotesCardProps {
  historyNotes?: string;
  complaints?: string[];
  appointment?: IAppointment | null;
  symptoms?: IPatientSymptomMap;
}

const SectionDivider = (): JSX.Element => <hr className="border-gray-100" />;

const SectionLabel = ({ label, icon }: { label: string; icon?: JSX.Element }): JSX.Element => (
  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
    {icon}
    {label}
  </p>
);

const HistoryNotesCard = ({
  historyNotes,
  complaints,
  appointment,
  symptoms,
}: HistoryNotesCardProps): JSX.Element => {
  const hasComplaints = complaints && complaints.length > 0;
  const hasSymptoms = symptoms && Object.values(symptoms).some((list) => list && list.length > 0);

  const renderChiefComplaints = (): JSX.Element | null => {
    if (!hasComplaints) {
      return null;
    }
    return (
      <div>
        <SectionLabel label="Chief Complaints" icon={<Stethoscope className="h-3.5 w-3.5" />} />
        <div className="flex flex-wrap gap-2">
          {complaints.map((complaint) => (
            <Badge key={complaint} variant="secondary" className="px-3 py-1.5 text-sm font-medium">
              {complaint}
            </Badge>
          ))}
        </div>
        {appointment?.symptoms?.complaints && appointment.symptoms.complaints.length > 0 && (
          <div className="mt-3 space-y-1 rounded-md bg-gray-50 p-3">
            <span className="text-sm font-medium text-gray-700">Durations:</span>
            {appointment.symptoms.complaints.map(({ complaint, duration }) => (
              <div key={complaint} className="text-xs text-gray-600">
                <span className="font-semibold">{complaint}:</span> {duration.value} {duration.type}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSymptoms = (): JSX.Element | null => {
    if (!hasSymptoms) {
      return null;
    }
    return (
      <div>
        <SectionLabel
          label="Symptoms by System"
          icon={<ActivitySquare className="h-3.5 w-3.5" />}
        />
        <div className="space-y-3">
          {Object.keys(symptoms).map((key) => {
            const symptomType = key as SymptomsType;
            const symptomList = symptoms[symptomType];
            if (!symptomList || symptomList.length === 0) {
              return null;
            }
            return (
              <div key={key} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <h3 className="mb-1.5 text-sm font-semibold text-gray-800">
                  {capitalize(symptomType)} System
                </h3>
                <ul className="space-y-1">
                  {symptomList.map(({ name, notes }) => (
                    <li key={name} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
                      <span>{name}</span>
                      {notes && (
                        <TooltipComp tip={notes}>
                          <Info size={14} className="text-gray-400" />
                        </TooltipComp>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderHistoryNotes = (): JSX.Element | null => {
    if (!historyNotes) {
      return null;
    }

    let parsedNotes: Record<string, string>;
    try {
      parsedNotes = JSON.parse(historyNotes);
    } catch {
      // Legacy plain-text format
      return (
        <div>
          <SectionLabel
            label="History of Present Illness"
            icon={<FileText className="h-3.5 w-3.5" />}
          />
          <p className="text-sm whitespace-pre-wrap text-gray-700">{historyNotes}</p>
        </div>
      );
    }

    if (parsedNotes._format === 'narrative') {
      return (
        <div>
          <SectionLabel label="History" icon={<FileText className="h-3.5 w-3.5" />} />
          <p className="text-sm whitespace-pre-wrap text-gray-700">{parsedNotes.history || ''}</p>
        </div>
      );
    }

    const sections = Object.entries(parsedNotes).filter(
      ([key, value]) => key !== '_format' && value && value.trim() !== '',
    );

    if (sections.length === 0) {
      return null;
    }

    return (
      <>
        {sections.map(([key, value], index) => {
          const displayLabel =
            key === 'assessment'
              ? 'Assessment / Impression'
              : key.replaceAll(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

          return (
            <div key={key}>
              {(hasComplaints || hasSymptoms || index > 0) && <SectionDivider />}
              <div className={index > 0 ? 'pt-4' : ''}>
                <SectionLabel label={displayLabel} icon={<FileText className="h-3.5 w-3.5" />} />
                <p className="text-sm whitespace-pre-wrap text-gray-700">{value}</p>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  const chiefComplaints = renderChiefComplaints();
  const symptomsSection = renderSymptoms();
  const notesSection = renderHistoryNotes();
  const isEmpty = !chiefComplaints && !symptomsSection && !notesSection;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="text-primary h-5 w-5" />
          History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <p className="text-sm text-gray-500">No history recorded.</p>
        ) : (
          <div className="space-y-4">
            {chiefComplaints}
            {chiefComplaints && symptomsSection && <SectionDivider />}
            {symptomsSection}
            {notesSection}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { HistoryNotesCard };
