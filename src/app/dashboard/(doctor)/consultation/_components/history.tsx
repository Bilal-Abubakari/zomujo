import React, { JSX, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAppSelector } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { Loader2, FileText, List } from 'lucide-react';
import {
  selectHistoryNotes,
  selectPostInvestigationData,
  selectSymptoms,
  isConsultationInvestigatingProgress,
} from '@/lib/features/appointments/appointmentSelector';
import { HistoryView } from '@/types/history.enum';
import { useParams } from 'next/navigation';

const HistorySymptomsForm = dynamic(
  () => import('@/app/dashboard/(doctor)/consultation/_components/HistorySymptomsForm'),
  { loading: () => <LoadingFallback />, ssr: false },
);
const HistoryNotesView = dynamic(
  () => import('@/app/dashboard/(doctor)/consultation/_components/historyNotesView'),
  { loading: () => <LoadingFallback />, ssr: false },
);
const PostInvestigationHistoryView = dynamic(
  () => import('@/app/dashboard/(doctor)/consultation/_components/PostInvestigationHistoryView'),
  { loading: () => <LoadingFallback />, ssr: false },
);

type SymptomsProps = {
  goToNext: () => void;
};

const LoadingFallback = (): JSX.Element => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="animate-spin" size={24} />
  </div>
);

const History = ({ goToNext }: SymptomsProps): JSX.Element => {
  const symptoms = useAppSelector(selectSymptoms);
  const historyNotes = useAppSelector(selectHistoryNotes);
  const isInvestigatingProgress = useAppSelector(isConsultationInvestigatingProgress);
  const postInvestigationData = useAppSelector(selectPostInvestigationData);
  const params = useParams();
  const goToLabs = goToNext;
  const [selectedView, setSelectedView] = useState<HistoryView | null>(null);
  const [isViewLocked, setIsViewLocked] = useState(false);

  // Determine if data exists and lock view accordingly
  useEffect(() => {
    if (historyNotes) {
      setSelectedView(HistoryView.Notes);
      setIsViewLocked(true);
    } else if (symptoms) {
      setSelectedView(HistoryView.Symptoms);
      setIsViewLocked(true);
    } else if (selectedView === null) {
      setSelectedView(HistoryView.Notes);
    }
  }, [historyNotes, symptoms, selectedView]);

  // For post-investigation consultations, render the dedicated view
  if (isInvestigatingProgress) {
    return (
      <PostInvestigationHistoryView
        appointmentId={String(params.appointmentId)}
        previousHistoryNotes={historyNotes}
        initialPostData={postInvestigationData}
        goToNext={goToNext}
      />
    );
  }

  const renderSelectedView = (): JSX.Element | null => {
    if (selectedView === HistoryView.Notes) {
      return (
        <HistoryNotesView
          appointmentId={String(params.appointmentId)}
          initialNotes={historyNotes}
          goToLabs={goToLabs}
        />
      );
    } else if (selectedView === HistoryView.Symptoms) {
      return <HistorySymptomsForm goToNext={goToNext} />;
    }
    return null;
  };

  return (
    <div>
      {!isViewLocked && selectedView && (
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">History Method:</span>
            <span className="text-xs text-gray-500">(Cannot change after saving)</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedView(HistoryView.Notes)}
              className={cn(
                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
                selectedView === HistoryView.Notes
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100',
              )}
            >
              <FileText size={16} />
              Text Editor
            </button>
            <button
              type="button"
              onClick={() => setSelectedView(HistoryView.Symptoms)}
              className={cn(
                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
                selectedView === HistoryView.Symptoms
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100',
              )}
            >
              <List size={16} />
              Structured Form
            </button>
          </div>
        </div>
      )}

      {renderSelectedView()}
    </div>
  );
};

export default History;
