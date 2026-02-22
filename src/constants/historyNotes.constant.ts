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

export interface HistoryNotesData {
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

export interface SectionConfig {
  key: keyof HistoryNotesData;
  label: string;
  icon: React.ElementType;
  placeholder: string;
}

export const SECTIONS: SectionConfig[] = [
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

export const DEFAULT_NOTES: HistoryNotesData = {
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

export const parseInitialNotes = (initialNotes: string | null | undefined): HistoryNotesData => {
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
