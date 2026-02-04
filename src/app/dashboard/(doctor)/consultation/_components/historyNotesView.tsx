import React, { JSX, useCallback, useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/lib/hooks';
import { updateHistoryNotes } from '@/lib/features/appointments/consultation/consultationThunk';
import { toast, Toast } from '@/hooks/use-toast';
import { showErrorToast } from '@/lib/utils';
import { LocalStorageManager } from '@/lib/localStorage';
import {
  ClipboardList,
  FileText,
  MessageSquare,
  Activity,
  Stethoscope,
  Pill,
  Users,
  Home,
  ClipboardCheck,
  Target,
} from 'lucide-react';

interface HistoryNotesViewProps {
  appointmentId: string;
  initialNotes: string | undefined;
  goToLabs: () => void;
}

interface HistoryNotesData {
  presentingComplaint: string;
  historyOfPresentingComplaint: string;
  onDirectQuestions: string;
  systematicEnquiry: string;
  pastMedicalSurgicalHistory: string;
  drugHistory: string;
  familyHistory: string;
  socialHistory: string;
  assessment: string;
  plan: string;
}

interface SectionConfig {
  key: keyof HistoryNotesData;
  label: string;
  icon: React.ElementType;
  placeholder: string;
}

const SECTIONS: SectionConfig[] = [
  {
    key: 'presentingComplaint',
    label: 'Presenting Complaint',
    icon: ClipboardList,
    placeholder: 'Enter the main presenting complaint...',
  },
  {
    key: 'historyOfPresentingComplaint',
    label: 'History of Presenting Complaint',
    icon: FileText,
    placeholder: 'Enter the history of the presenting complaint...',
  },
  {
    key: 'onDirectQuestions',
    label: 'On Direct Questions',
    icon: MessageSquare,
    placeholder: 'Enter responses to direct questions...',
  },
  {
    key: 'systematicEnquiry',
    label: 'Systematic Enquiry',
    icon: Activity,
    placeholder: 'Enter systematic enquiry findings...',
  },
  {
    key: 'pastMedicalSurgicalHistory',
    label: 'Past Medical/Surgical History',
    icon: Stethoscope,
    placeholder: 'Enter past medical and surgical history...',
  },
  {
    key: 'drugHistory',
    label: 'Drug History',
    icon: Pill,
    placeholder: 'Enter current medications and drug history...',
  },
  {
    key: 'familyHistory',
    label: 'Family History',
    icon: Users,
    placeholder: 'Enter relevant family history...',
  },
  {
    key: 'socialHistory',
    label: 'Social History',
    icon: Home,
    placeholder: 'Enter social history (occupation, lifestyle, etc.)...',
  },
  {
    key: 'assessment',
    label: 'Assessment',
    icon: ClipboardCheck,
    placeholder: 'Enter your clinical assessment...',
  },
  {
    key: 'plan',
    label: 'Plan',
    icon: Target,
    placeholder: 'Enter the management plan...',
  },
];

const DEFAULT_NOTES: HistoryNotesData = {
  presentingComplaint: '',
  historyOfPresentingComplaint: '',
  onDirectQuestions: '',
  systematicEnquiry: '',
  pastMedicalSurgicalHistory: '',
  drugHistory: '',
  familyHistory: '',
  socialHistory: '',
  assessment: '',
  plan: '',
};

const parseInitialNotes = (initialNotes: string | undefined): HistoryNotesData => {
  if (!initialNotes) {
    return DEFAULT_NOTES;
  }

  try {
    const parsed = JSON.parse(initialNotes);
    return { ...DEFAULT_NOTES, ...parsed };
  } catch {
    // If it's not JSON (old format), return default
    return DEFAULT_NOTES;
  }
};

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
    if (!initialNotes) {
      const draft = LocalStorageManager.getJSON<HistoryNotesData>(storageKey);
      if (draft) {
        setNotes(draft);
      }
    } else {
      setNotes(parseInitialNotes(initialNotes));
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

    if (!showErrorToast(payload)) {
      setHasUnsavedChanges(false);
      LocalStorageManager.removeJSON(storageKey);
      goToLabs();
    }
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
