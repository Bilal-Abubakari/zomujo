'use client';
import React, { JSX, useState } from 'react';
import { IAppointment } from '@/types/appointment.interface';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, FileText, FlaskConical, GitMerge, LayoutGrid } from 'lucide-react';
import { CardsView } from '@/app/dashboard/(doctor)/consultation/_components/CardsView';
import { StatusBadge } from '@/components/ui/statusBadge';
import { getFormattedDate, getTimeFromDateStamp } from '@/lib/date';
import { Card, CardHeader } from '@/components/ui/card';
import { InvestigationResultsCard } from '@/app/dashboard/(doctor)/consultation/_components/InvestigationResultsCard';
import { Badge } from '@/components/ui/badge';
import { parsePostInvestigationInitialNotes } from '@/constants/historyNotes.constant';
import { Button } from '@/components/ui/button';

interface PastConsultationViewProps {
  appointment: IAppointment;
  onViewLinkedConsultation?: (appointmentId: string) => void;
}

const PastConsultationView = ({
  appointment,
  onViewLinkedConsultation,
}: PastConsultationViewProps): JSX.Element => {
  const [viewMode, setViewMode] = useState<'cards' | 'notes' | 'investigationResults'>('cards');

  const complaints = appointment.symptoms?.complaints?.map((c) => c.complaint) || [];
  const symptomMap = appointment.symptoms || undefined;
  const historyNotes = appointment.historyNotes || undefined;
  const prescriptions = appointment.prescriptions || [];
  const radiology = appointment.radiology || undefined;
  const lab = appointment.lab;
  const postInvestigationData = parsePostInvestigationInitialNotes(appointment.ipData);

  const labFileUrls = lab?.fileUrls ?? [];
  const radiologyFileUrls = radiology?.fileUrls ?? [];
  const hasInvestigationResults =
    labFileUrls.length > 0 || radiologyFileUrls.length > 0 || !!postInvestigationData;

  return (
    <div className="space-y-6">
      {appointment.appointmentLinkId && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100">
              <GitMerge className="h-3.5 w-3.5 text-green-700" />
            </div>
            <div>
              <p className="text-xs font-semibold text-green-800">Linked Follow-Up Consultation</p>
              <p className="text-xs text-green-600">
                This consultation is linked to a previous visit for continuity of care.
              </p>
            </div>
          </div>
          {onViewLinkedConsultation && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewLinkedConsultation(appointment.appointmentLinkId!)}
              className="shrink-0 border-green-300 text-xs text-green-700 hover:bg-green-100"
              child={
                <>
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  View Linked
                </>
              }
            />
          )}
        </div>
      )}

      {/* isFollowUp flag indicator (not yet linked) */}
      {appointment.isFollowUp && !appointment.appointmentLinkId && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <GitMerge className="h-3.5 w-3.5 text-amber-700" />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-800">Follow-Up Visit</p>
            <p className="text-xs text-amber-600">
              Patient indicated this was a follow-up visit, but no past consultation was linked.
            </p>
          </div>
        </div>
      )}

      {/* Consultation Header */}
      <Card className="border-l-primary border-l-4">
        <CardHeader className="bg-gray-50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-gray-900">
                  Consultation with {appointment.patient.firstName} {appointment.patient.lastName}
                </h3>
                <StatusBadge status={appointment.status} />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span>📅 {getFormattedDate(appointment.slot.date)}</span>
                <span>🕐 {getTimeFromDateStamp(appointment.slot.startTime)}</span>
                <span>
                  👨‍⚕️ Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs for viewing modes */}
      <Tabs
        value={viewMode}
        onValueChange={(value) => setViewMode(value as 'cards' | 'notes' | 'investigationResults')}
      >
        <TabsList
          className={`grid w-full ${hasInvestigationResults ? 'grid-cols-3' : 'grid-cols-2'} lg:w-120`}
        >
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Cards View
          </TabsTrigger>
          {hasInvestigationResults && (
            <TabsTrigger value="investigationResults" className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              <span className="hidden sm:inline">Investigation</span> Results
              <Badge variant="secondary" className="ml-1 text-xs">
                {labFileUrls.length + radiologyFileUrls.length}
              </Badge>
            </TabsTrigger>
          )}
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Doctor&apos;s Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="mt-6">
          <CardsView
            complaints={complaints}
            symptoms={symptomMap?.symptoms}
            historyNotes={historyNotes}
            appointment={appointment}
            requestedLabs={undefined}
            radiology={radiology}
            prescriptions={prescriptions}
            referrals={[]}
            onRemoveReferral={() => {}}
            labInstructions={lab?.instructions}
            labClinicalHistory={lab?.history}
          />
        </TabsContent>

        {hasInvestigationResults && (
          <TabsContent value="investigationResults" className="mt-6">
            <InvestigationResultsCard
              labFileUrls={labFileUrls}
              radiologyFileUrls={radiologyFileUrls}
              postInvestigationData={postInvestigationData}
            />
          </TabsContent>
        )}

        <TabsContent value="notes" className="mt-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Doctor&apos;s Notes</h3>
            {appointment.notes ? (
              <div className="whitespace-pre-wrap text-gray-700">{appointment.notes}</div>
            ) : (
              <p className="text-gray-500 italic">No notes available for this consultation.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PastConsultationView;
