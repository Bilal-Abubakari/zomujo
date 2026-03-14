'use client';
import React, { JSX, useCallback, useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/lib/hooks';
import { savePostInvestigationData } from '@/lib/features/appointments/consultation/consultationThunk';
import { toast, Toast } from '@/hooks/use-toast';
import { showErrorToast } from '@/lib/utils';
import { LocalStorageManager } from '@/lib/localStorage';
import {
  parseInitialNotes,
  parsePostInvestigationInitialNotes,
} from '@/constants/historyNotes.constant';
import { IPostInvestigationData } from '@/types/appointment.interface';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  History,
  FileText,
  ClipboardCheck,
  PenLine,
  ChevronRight,
  Lock,
  AlertTriangle,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PostInvestigationHistoryViewProps {
  appointmentId: string;
  previousHistoryNotes: string | undefined;
  initialPostData: string | undefined;
  goToNext: () => void;
}

const PostInvestigationHistoryView = ({
  appointmentId,
  previousHistoryNotes,
  initialPostData,
  goToNext,
}: PostInvestigationHistoryViewProps): JSX.Element => {
  const initialPostInvestigationNotes = parsePostInvestigationInitialNotes(initialPostData);
  const dispatch = useAppDispatch();
  const [postData, setPostData] = useState<IPostInvestigationData>(initialPostInvestigationNotes);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const storageKey = `consultation_${appointmentId}_post_investigation_draft`;

  // Parse previous history notes for display
  const parsedPreviousNotes = parseInitialNotes(previousHistoryNotes);
  const previousNotesSections = Object.entries(parsedPreviousNotes).filter(
    ([, value]) => value && value.trim() !== '',
  );

  useEffect(() => {
    if (initialPostData) {
      setPostData(parsePostInvestigationInitialNotes(initialPostData));
      return;
    }
    const draft = LocalStorageManager.getJSON<IPostInvestigationData>(storageKey);
    if (draft) {
      setPostData(draft);
    }
  }, [initialPostData, storageKey]);

  useEffect(() => {
    if (!initialPostData && hasUnsavedChanges) {
      LocalStorageManager.setJSON(storageKey, postData);
    }
  }, [postData, hasUnsavedChanges, initialPostData, storageKey]);

  const handleChange = useCallback((key: keyof IPostInvestigationData, value: string) => {
    setPostData((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  }, []);

  const handleSaveAndContinue = async (): Promise<void> => {
    if (initialPostData) {
      const isUnchanged =
        postData.historyOfPresentingComplaints ===
          initialPostInvestigationNotes.historyOfPresentingComplaints &&
        postData.assessmentImpression === initialPostInvestigationNotes.assessmentImpression &&
        postData.plan === initialPostInvestigationNotes.plan &&
        postData.addendum === initialPostInvestigationNotes.addendum;

      if (isUnchanged) {
        goToNext();
        return;
      }
    }

    setIsLoading(true);
    const { payload } = await dispatch(
      savePostInvestigationData({ appointmentId, data: postData }),
    );
    toast(payload as Toast);
    setIsLoading(false);

    if (showErrorToast(payload)) {
      return;
    }
    setHasUnsavedChanges(false);
    LocalStorageManager.removeJSON(storageKey);
    goToNext();
  };

  const isValid = Object.values(postData).some((v) => v.trim().length > 0);

  const getSectionLabel = (key: string): string => {
    const labels: Record<string, string> = {
      presentingComplaint: 'Presenting Complaint',
      historyOfPresentingComplaint: 'History of Presenting Complaint',
      onDirectQuestions: 'On Direct Questions',
      systematicEnquiry: 'Systematic Enquiry',
      pastMedicalSurgicalHistory: 'Past Medical / Surgical History',
      drugHistory: 'Drug History',
      familyHistory: 'Family History',
      socialHistory: 'Social History',
      assessment: 'Assessment / Impression',
      plan: 'Plan',
    };
    return (
      labels[key] ?? key.replaceAll(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())
    );
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Context Banner */}
      <div className="rounded-xl border border-indigo-200 bg-linear-to-r from-indigo-50 to-purple-50 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-indigo-100 p-2">
            <History className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-indigo-900">Post-Investigation History</h2>
            <p className="mt-0.5 text-xs text-indigo-700">
              This is a post-investigation consultation. Review the previous history below, then
              complete the new fields based on the investigation results.
            </p>
          </div>
        </div>
      </div>

      {/* Previous History — Collapsed */}
      {previousNotesSections.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50">
          <Accordion type="single" collapsible>
            <AccordionItem value="previous-history" className="border-none">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Previous Consultation History
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {previousNotesSections.length} section
                    {previousNotesSections.length === 1 ? '' : 's'}
                  </Badge>
                  <Badge variant="outline" className="border-gray-300 text-xs text-gray-500">
                    Read-only
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="mt-1 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                    <p className="text-xs text-amber-700">
                      These notes are from the previous consultation and cannot be edited.
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  {previousNotesSections.map(([key, value]) => (
                    <Card key={key} className="border border-gray-200 bg-white">
                      <CardHeader className="px-3 py-2">
                        <CardTitle className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText className="h-3.5 w-3.5" />
                          {getSectionLabel(key)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-3 pt-0 pb-3">
                        <p className="text-sm whitespace-pre-wrap text-gray-700">{value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-medium tracking-wide text-gray-500 uppercase">
          New Post-Investigation Fields
        </span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* New Fields */}
      <div className="space-y-4">
        {/* History of Presenting Complaints */}
        <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="text-primary h-5 w-5" />
            <h3 className="text-base font-semibold text-gray-800">
              History of Presenting Complaints
            </h3>
          </div>
          <Textarea
            value={postData.historyOfPresentingComplaints}
            onChange={(e) => handleChange('historyOfPresentingComplaints', e.target.value)}
            placeholder="Document the history of presenting complaints as updated after the investigations..."
            className="min-h-28 resize-y"
            name="historyOfPresentingComplaints"
          />
        </div>

        {/* Assessment / Impression */}
        <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <ClipboardCheck className="text-primary h-5 w-5" />
            <h3 className="text-base font-semibold text-gray-800">Assessment / Impression</h3>
          </div>
          <Textarea
            value={postData.assessmentImpression}
            onChange={(e) => handleChange('assessmentImpression', e.target.value)}
            placeholder="Enter your updated clinical assessment and impression based on the investigation results..."
            className="min-h-28 resize-y"
            name="assessmentImpression"
          />
        </div>

        {/* Plan */}
        <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Target className="text-primary h-5 w-5" />
            <h3 className="text-base font-semibold text-gray-800">Plan</h3>
          </div>
          <Textarea
            value={postData.plan}
            onChange={(e) => handleChange('plan', e.target.value)}
            placeholder="Enter your treatment plan based on the investigation results..."
            className="min-h-28 resize-y"
            name="plan"
          />
        </div>

        {/* Addendum */}
        <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <PenLine className="text-primary h-5 w-5" />
            <h3 className="text-base font-semibold text-gray-800">Addendum</h3>
          </div>
          <Textarea
            value={postData.addendum}
            onChange={(e) => handleChange('addendum', e.target.value)}
            placeholder="Add any additional notes, corrections, or addendum to this consultation record..."
            className="min-h-28 resize-y"
            name="addendum"
          />
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 z-50 flex w-full justify-between border-t border-gray-300 bg-white p-4 shadow-md">
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && !initialPostData && (
            <span className="text-sm text-amber-600">Unsaved changes (auto-saved locally)</span>
          )}
        </div>
        <Button
          isLoading={isLoading}
          disabled={!isValid || isLoading}
          onClick={handleSaveAndContinue}
          child={
            <span className="flex items-center gap-2">
              Continue to Investigation
              <ChevronRight className="h-4 w-4" />
            </span>
          }
        />
      </div>
    </div>
  );
};

export default PostInvestigationHistoryView;
