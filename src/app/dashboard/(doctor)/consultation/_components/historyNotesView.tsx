import React, { JSX, useCallback, useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/lib/hooks';
import { updateHistoryNotes } from '@/lib/features/appointments/consultation/consultationThunk';
import { toast, Toast } from '@/hooks/use-toast';
import { showErrorToast } from '@/lib/utils';
import { LocalStorageManager } from '@/lib/localStorage';
import { HistoryNotesData, SECTIONS, parseInitialNotes } from '@/constants/historyNotes.constant';

interface HistoryNotesViewProps {
  appointmentId: string;
  initialNotes: string | undefined;
  goToLabs: () => void;
}

const HistoryNotesView = ({
  appointmentId,
  initialNotes,
  goToLabs,
}: HistoryNotesViewProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const [notes, setNotes] = useState<HistoryNotesData>(parseInitialNotes(initialNotes));
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const storageKey = `consultation_${appointmentId}_history_notes_draft`;

  useEffect(() => {
    if (initialNotes) {
      setNotes(parseInitialNotes(initialNotes));
      return;
    }
    const draft = LocalStorageManager.getJSON<HistoryNotesData>(storageKey);
    if (draft) {
      setNotes(draft);
    }
  }, [initialNotes, storageKey]);

  useEffect(() => {
    if (!initialNotes && hasUnsavedChanges) {
      LocalStorageManager.setJSON(storageKey, notes);
    }
  }, [notes, hasUnsavedChanges, initialNotes, storageKey]);

  const handleNotesChange = useCallback((key: keyof HistoryNotesData, value: string) => {
    setNotes((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  }, []);

  const handleSaveAndContinue = async (): Promise<void> => {
    const currentNotesJson = JSON.stringify(notes);

    if (initialNotes) {
      const parsedInitialNotes = parseInitialNotes(initialNotes);
      const initialNotesJson = JSON.stringify(parsedInitialNotes);

      if (currentNotesJson === initialNotesJson) {
        LocalStorageManager.removeJSON(storageKey);
        goToLabs();
        return;
      }
    }

    setIsLoading(true);
    const { payload } = await dispatch(
      updateHistoryNotes({
        appointmentId,
        notes: currentNotesJson,
      }),
    );
    toast(payload as Toast);
    setIsLoading(false);

    if (showErrorToast(payload)) {
      return;
    }
    setHasUnsavedChanges(false);
    LocalStorageManager.removeJSON(storageKey);
    goToLabs();
  };

  const isValid = Object.values(notes).some((value) => value.trim().length > 0);

  return (
    <div className="space-y-6 pb-24">
      <div className="rounded-lg border border-gray-200 bg-blue-50 p-4">
        <p className="text-sm text-gray-700">
          Complete the patient&apos;s history by filling in the sections below. Each section has its
          own text area for organized documentation.
        </p>
      </div>

      <div className="space-y-4">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.key}
              className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2">
                <Icon className="text-primary h-5 w-5" />
                <h3 className="text-base font-semibold text-gray-800">{section.label}</h3>
              </div>
              <Textarea
                value={notes[section.key]}
                onChange={(e) => handleNotesChange(section.key, e.target.value)}
                placeholder={section.placeholder}
                className="min-h-25 resize-y"
                name={section.key}
              />
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 z-50 flex w-full justify-between border-t border-gray-300 bg-white p-4 shadow-md">
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && !initialNotes && (
            <span className="text-sm text-amber-600">Unsaved changes (auto-saved locally)</span>
          )}
        </div>
        <Button
          isLoading={isLoading}
          disabled={!isValid || isLoading}
          onClick={handleSaveAndContinue}
          child="Save & Continue to Labs"
        />
      </div>
    </div>
  );
};

export default HistoryNotesView;
