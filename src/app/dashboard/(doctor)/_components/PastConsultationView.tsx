'use client';
import React, { JSX, useState } from 'react';
import { IAppointment } from '@/types/appointment.interface';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, FlaskConical, LayoutGrid } from 'lucide-react';
import { CardsView } from '@/app/dashboard/(doctor)/consultation/_components/CardsView';
import { StatusBadge } from '@/components/ui/statusBadge';
import { getFormattedDate, getTimeFromDateStamp } from '@/lib/date';
import { Card, CardHeader } from '@/components/ui/card';
import { InvestigationResultsCard } from '@/app/dashboard/(doctor)/consultation/_components/InvestigationResultsCard';
import { Badge } from '@/components/ui/badge';
import { parsePostInvestigationInitialNotes } from '@/constants/historyNotes.constant';

interface PastConsultationViewProps {
  appointment: IAppointment;
}

const PastConsultationView = ({ appointment }: PastConsultationViewProps): JSX.Element => {
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
