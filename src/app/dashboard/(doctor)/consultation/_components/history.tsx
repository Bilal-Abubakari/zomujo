import React, { JSX, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAppSelector } from '@/lib/hooks';
import { Loader2 } from 'lucide-react';
import {
  isConsultationInvestigatingProgress,
  selectHistoryNotes,
  selectPostInvestigationData,
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
  const historyNotes = useAppSelector(selectHistoryNotes);
  const isInvestigatingProgress = useAppSelector(isConsultationInvestigatingProgress);
  const postInvestigationData = useAppSelector(selectPostInvestigationData);
  const params = useParams();
  const goToLabs = goToNext;
  const [selectedView] = useState<HistoryView>(HistoryView.Notes);

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

  return <div>{renderSelectedView()}</div>;
};

export default History;
