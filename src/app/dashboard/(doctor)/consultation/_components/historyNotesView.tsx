import React, { JSX, useCallback, useEffect, useState } from 'react';
import { RichTextEditor } from '@/components/ui/richTextEditor';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/lib/hooks';
import { updateHistoryNotes } from '@/lib/features/appointments/consultation/consultationThunk';
import { toast, Toast } from '@/hooks/use-toast';
import { showErrorToast } from '@/lib/utils';
import { LocalStorageManager } from '@/lib/localStorage';

interface HistoryNotesViewProps {
  appointmentId: string;
  initialNotes: string | undefined;
  goToLabs: () => void;
}

const DEFAULT_TEMPLATE =
  '<h2><strong><u>Presenting Complaints</u></strong></h2><p></p><' +
  'h2><strong><u>History of Presenting Complaints</u></strong></h2><p></p' +
  '><h2><strong><u>Assessment</u></strong></h2><p></p>' +
  '<h2><strong><u>Plan</u></strong></h2><p></p>';

const HistoryNotesView = ({
  appointmentId,
  initialNotes,
  goToLabs,
}: HistoryNotesViewProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const [notes, setNotes] = useState<string>(initialNotes || DEFAULT_TEMPLATE);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const storageKey = `consultation_${appointmentId}_history_notes_draft`;

  useEffect(() => {
    if (!initialNotes) {
      const draft = LocalStorageManager.getJSON<string>(storageKey);
      if (draft) {
        setNotes(draft);
      }
    }
  }, [initialNotes, storageKey]);

  useEffect(() => {
    if (!initialNotes && hasUnsavedChanges) {
      LocalStorageManager.setJSON(storageKey, notes);
    }
  }, [notes, hasUnsavedChanges, initialNotes, storageKey]);

  const handleNotesChange = useCallback((value: string) => {
    setNotes(value);
    setHasUnsavedChanges(true);
  }, []);

  const handleSaveAndContinue = async (): Promise<void> => {
    setIsLoading(true);
    const { payload } = await dispatch(
      updateHistoryNotes({
        appointmentId,
        notes: notes.trim(),
      }),
    );
    toast(payload as Toast);
    setIsLoading(false);

    if (!showErrorToast(payload)) {
      setHasUnsavedChanges(false);
      LocalStorageManager.removeJSON(storageKey);
      goToLabs();
    }
  };

  const isValid = notes.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-blue-50 p-4">
        <p className="text-sm text-gray-700">
          Use the text editor below to document the patient&apos;s history. The template headings
          are provided as a guide - feel free to edit them as needed.
        </p>
      </div>

      <div className="mb-20 rounded-lg border border-gray-300 bg-white shadow-sm">
        <RichTextEditor
          value={notes}
          onChange={handleNotesChange}
          placeholder="Type your notes here..."
          className="min-h-125"
          labelName="History Notes"
          labelClassName="text-lg font-semibold mt-2 ml-2"
        />
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
