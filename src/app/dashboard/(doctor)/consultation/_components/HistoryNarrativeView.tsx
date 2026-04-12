import React, { JSX, useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/lib/hooks';
import { updateHistoryNotes } from '@/lib/features/appointments/consultation/consultationThunk';
import { toast, Toast } from '@/hooks/use-toast';
import { cn, showErrorToast } from '@/lib/utils';
import { LocalStorageManager } from '@/lib/localStorage';
import { useSidebar } from '@/components/ui/sidebar';

interface HistoryNarrativeViewProps {
  appointmentId: string;
  initialNotes: string | undefined;
  goToLabs: () => void;
}

const HistoryNarrativeView = ({
  appointmentId,
  initialNotes,
  goToLabs,
}: HistoryNarrativeViewProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const { state, isMobile } = useSidebar();

  const extractNarrativeText = (notes: string | undefined): string => {
    if (!notes) {
      return '';
    }
    try {
      const parsed = JSON.parse(notes);
      if (parsed._format === 'narrative') {
        return parsed.history ?? '';
      }
      return '';
    } catch {
      return notes;
    }
  };

  const storageKey = `consultation_${appointmentId}_history_narrative_draft`;

  const [text, setText] = useState<string>(() => {
    const fromInitial = extractNarrativeText(initialNotes);
    if (fromInitial) {
      return fromInitial;
    }
    return LocalStorageManager.getJSON<string>(storageKey) ?? '';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const fromInitial = extractNarrativeText(initialNotes);
    if (fromInitial) {
      setText(fromInitial);
      return;
    }
    const draft = LocalStorageManager.getJSON<string>(storageKey);
    if (draft) {
      setText(draft);
    }
  }, [initialNotes, storageKey]);

  useEffect(() => {
    if (!initialNotes && hasUnsavedChanges) {
      LocalStorageManager.setJSON(storageKey, text);
    }
  }, [text, hasUnsavedChanges, initialNotes, storageKey]);

  const handleSaveAndContinue = async (): Promise<void> => {
    const payload = JSON.stringify({ _format: 'narrative', history: text });

    if (initialNotes) {
      const currentNarrative = extractNarrativeText(initialNotes);
      if (currentNarrative === text) {
        LocalStorageManager.removeJSON(storageKey);
        goToLabs();
        return;
      }
    }

    setIsLoading(true);
    const { payload: result } = await dispatch(
      updateHistoryNotes({ appointmentId, notes: payload }),
    );
    toast(result as Toast);
    setIsLoading(false);

    if (showErrorToast(result)) {
      return;
    }

    setHasUnsavedChanges(false);
    LocalStorageManager.removeJSON(storageKey);
    goToLabs();
  };

  const isValid = text.trim().length > 0;

  return (
    <div className="space-y-6 pb-24">
      <div className="rounded-lg border border-gray-200 bg-blue-50 p-4">
        <p className="text-sm text-gray-700">
          Document the patient&apos;s complete history in free-form narrative below.
        </p>
      </div>

      <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="text-primary h-5 w-5" />
          <h3 className="text-base font-semibold text-gray-800">History</h3>
        </div>
        <Textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setHasUnsavedChanges(true);
          }}
          placeholder="Document the full history here..."
          className="min-h-125 resize-y"
          name="narrativeHistory"
        />
      </div>

      <div
        className={cn(
          'fixed bottom-0 z-50 flex justify-between border-t border-gray-300 bg-white p-4 shadow-md',
          !isMobile && state === 'expanded'
            ? 'left-(--sidebar-width) w-[calc(100%-var(--sidebar-width))]'
            : 'left-0 w-full',
        )}
      >
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && !initialNotes && (
            <span className="text-sm text-amber-600">Unsaved changes (auto-saved locally)</span>
          )}
        </div>
        <Button
          isLoading={isLoading}
          disabled={!isValid || isLoading}
          onClick={handleSaveAndContinue}
          child="Continue to Investigation"
        />
      </div>
    </div>
  );
};

export default HistoryNarrativeView;
