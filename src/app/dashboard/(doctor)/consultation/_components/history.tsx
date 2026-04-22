import React, { JSX, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAppSelector } from '@/lib/hooks';
import { AlertTriangle, Info, Loader2 } from 'lucide-react';
import {
  selectIsConsultationInvestigatingProgress,
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
const HistoryNarrativeView = dynamic(
  () => import('@/app/dashboard/(doctor)/consultation/_components/HistoryNarrativeView'),
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

const detectFormat = (notes: string | undefined): HistoryView => {
  if (!notes) {
    return HistoryView.Notes;
  }
  try {
    const parsed = JSON.parse(notes);
    if (parsed._format === 'narrative') {
      return HistoryView.Narrative;
    }
    return HistoryView.Notes;
  } catch {
    return HistoryView.Narrative;
  }
};

const TABS: { view: HistoryView; label: string; description: string }[] = [
  {
    view: HistoryView.Notes,
    label: 'Structured',
    description:
      'Fill in dedicated sections (Presenting Complaint, History, etc.) for organized documentation.',
  },
  {
    view: HistoryView.Narrative,
    label: 'Narrative',
    description:
      'Write a free-form narrative describing the full patient history in your own words.',
  },
];

const History = ({ goToNext }: SymptomsProps): JSX.Element => {
  const historyNotes = useAppSelector(selectHistoryNotes);
  const isInvestigatingProgress = useAppSelector(selectIsConsultationInvestigatingProgress);
  const postInvestigationData = useAppSelector(selectPostInvestigationData);
  const params = useParams();
  const goToLabs = goToNext;
  const [selectedView, setSelectedView] = useState<HistoryView>(() => detectFormat(historyNotes));
  const [pendingView, setPendingView] = useState<HistoryView | null>(null);
  const [viewSwitched, setViewSwitched] = useState(false);

  const hasServerNotes = Boolean(historyNotes);

  const handleTabClick = (view: HistoryView): void => {
    if (view === selectedView) {
      return;
    }
    if (hasServerNotes) {
      setPendingView(view);
    } else {
      setSelectedView(view);
    }
  };

  const confirmSwitch = (): void => {
    if (pendingView) {
      setSelectedView(pendingView);
      setPendingView(null);
      setViewSwitched(true);
    }
  };

  // After confirming a view switch, pass undefined so the new view starts
  // completely clean — prevents old format keys (e.g. _format, history) from
  // leaking into the newly saved structured/narrative JSON.
  const notesToPass = viewSwitched ? undefined : historyNotes;

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
          initialNotes={notesToPass}
          goToLabs={goToLabs}
        />
      );
    } else if (selectedView === HistoryView.Narrative) {
      return (
        <HistoryNarrativeView
          appointmentId={String(params.appointmentId)}
          initialNotes={notesToPass}
          goToLabs={goToLabs}
        />
      );
    } else if (selectedView === HistoryView.Symptoms) {
      return <HistorySymptomsForm goToNext={goToNext} />;
    }
    return null;
  };

  const selectedTab = TABS.find((t) => t.view === selectedView);
  const pendingTab = TABS.find((t) => t.view === pendingView);

  return (
    <div className="space-y-4">
      {!hasServerNotes && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0 text-blue-600" />
            <p className="text-sm font-semibold text-blue-800">
              Two documentation styles available
            </p>
          </div>
          <ul className="space-y-1 pl-6 text-sm text-blue-700">
            {TABS.map(({ label, description }) => (
              <li key={label}>
                <span className="font-medium">{label}:</span> {description}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-blue-600">
            You can switch freely between views before saving for the first time.
          </p>
        </div>
      )}

      {pendingView && pendingTab && selectedTab && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-sm font-semibold text-amber-800">
              Switch to {pendingTab.label} view?
            </p>
          </div>
          <p className="mb-3 text-sm text-amber-700">
            You have notes already saved in <strong>{selectedTab.label}</strong> format. Switching
            and saving will overwrite them with the new format — existing content will not be
            carried over.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPendingView(null)}
              className="rounded-md border border-amber-400 bg-white px-3 py-1.5 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100"
            >
              Cancel
            </button>
            <button
              onClick={confirmSwitch}
              className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700"
            >
              Switch anyway
            </button>
          </div>
        </div>
      )}

      <div className="flex w-fit gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1">
        {TABS.map(({ view, label }) => (
          <button
            key={view}
            onClick={() => handleTabClick(view)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedView === view
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {renderSelectedView()}
    </div>
  );
};

export default History;
