'use client';
import React, { JSX, useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestTube2, Microscope, AlertCircle } from 'lucide-react';
import Labs from './labs';
import Radiology from './radiology';
import { Modal } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { selectDoctorSignature } from '@/lib/features/doctors/doctorsSelector';
import { Button } from '@/components/ui/button';
import Signature from '@/components/signature/signature';
import {
  selectCurrentLabRequest,
  selectCurrentRadiologyRequest,
  selectHasInvestigation,
} from '@/lib/features/appointments/consultation/consultationSelector';
import { toast, Toast } from '@/hooks/use-toast';
import { LocalStorageManager } from '@/lib/localStorage';
import { useParams } from 'next/navigation';
import {
  setCurrentLabRequest,
  setCurrentRadiologyRequest,
} from '@/lib/features/appointments/consultation/consultationSlice';
import { ILaboratoryRequest } from '@/types/labs.interface';
import { IRadiologyRequest } from '@/types/radiology.interface';
import {
  addLabRequests,
  addRadiologyRequests,
} from '@/lib/features/appointments/consultation/consultationThunk';
import { selectRecordId } from '@/lib/features/patients/patientsSelector';
import { showErrorToast } from '@/lib/utils';

type InvestigationProps = {
  updateInvestigation: boolean;
  setUpdateInvestigation: (value: boolean) => void;
  goToDiagnoseAndPrescribe: () => void;
};

const Investigation = ({
  updateInvestigation,
  setUpdateInvestigation,
  goToDiagnoseAndPrescribe,
}: InvestigationProps): JSX.Element => {
  const [activeTab, setActiveTab] = useState<'labs' | 'radiology'>('labs');
  const [updateLabs, setUpdateLabs] = useState(false);
  const [updateRadiology, setUpdateRadiology] = useState(false);
  const [openAddSignature, setOpenAddSignature] = useState(false);
  const [addSignature, setAddSignature] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const doctorSignature = useAppSelector(selectDoctorSignature);
  const currentLabRequests = useAppSelector(selectCurrentLabRequest);
  const currentRadiologyRequest = useAppSelector(selectCurrentRadiologyRequest);
  const hasInvestigation = useAppSelector(selectHasInvestigation);
  const hasSignature = !!doctorSignature;
  const recordId = useAppSelector(selectRecordId);
  const dispatch = useAppDispatch();
  const params = useParams();
  const appointmentId = String(params.appointmentId);

  useEffect(() => {
    if (updateInvestigation) {
      if (activeTab === 'labs') {
        setUpdateLabs(true);
      } else {
        setUpdateRadiology(true);
      }
      setUpdateInvestigation(false);
    }
  }, [updateInvestigation, activeTab, setUpdateInvestigation]);

  const handleSubmitAndGoToExamination = async (): Promise<void> => {
    // If no investigations to submit, proceed to next stage
    if (currentLabRequests.length === 0 && !currentRadiologyRequest) {
      goToDiagnoseAndPrescribe();
      return;
    }

    if (!recordId) {
      toast({
        title: 'Error',
        description: 'Patient record ID is missing',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create array of promises for concurrent submission
      const submissionPromises: Promise<Toast>[] = [];

      // Add lab request submission if there are labs
      if (currentLabRequests.length > 0) {
        const labPayload = {
          recordId,
          appointmentId,
          labs: currentLabRequests,
        };
        submissionPromises.push(dispatch(addLabRequests(labPayload)).unwrap());
      }

      // Add radiology request submission if there is radiology
      if (currentRadiologyRequest) {
        const radiologyPayload = {
          recordId,
          appointmentId,
          tests: currentRadiologyRequest.tests,
          procedureRequest: currentRadiologyRequest.procedureRequest,
          history: currentRadiologyRequest.history,
          questions: currentRadiologyRequest.questions,
        };
        submissionPromises.push(dispatch(addRadiologyRequests(radiologyPayload)).unwrap());
      }

      // Wait for all submissions to complete
      const results = await Promise.all(submissionPromises);

      // Display all responses
      let hasError = false;
      results.forEach((result) => {
        toast(result);
        if (showErrorToast(result)) {
          hasError = true;
        }
      });

      // Proceed to next stage regardless of errors (or only if no errors - your choice)
      if (!hasError) {
        clearDraft();
        // Clear the state after successful submission
        dispatch(setCurrentLabRequest([]));
        dispatch(setCurrentRadiologyRequest(null));
        goToDiagnoseAndPrescribe();
      }
    } catch {
      toast({
        title: 'Submission Error',
        description: 'Failed to submit investigation requests. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (addSignature) {
      setOpenAddSignature(true);
    }
  }, [addSignature]);

  useEffect(() => {
    if (!openAddSignature) {
      setAddSignature(false);
    }
  }, [openAddSignature]);

  useEffect(() => {
    // Show signature alert if no signature exists
    if (!hasSignature && hasInvestigation) {
      setTimeout(() => {
        const alertElement = document.getElementById('signature-alert');
        if (alertElement) {
          alertElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [hasInvestigation]);

  useEffect(() => {
    // Restore drafts for both labs and radiology on page load
    const labsDraft = LocalStorageManager.getJSON<{
      currentRequestedLabs: ILaboratoryRequest[];
      selectedTests: [string, { category: string; categoryType: string }][];
      categorySpecimens: [string, string][];
      fasting: boolean;
    }>(`consultation_${appointmentId}_labs_draft`);
    if (labsDraft?.currentRequestedLabs) {
      dispatch(setCurrentLabRequest(labsDraft.currentRequestedLabs));
    }

    const radiologyDraft = LocalStorageManager.getJSON<{
      currentRequestedRadiology: IRadiologyRequest | null;
      selectedTests: [string, { category: string; categoryType: string }][];
      categoryInfo: [
        string,
        {
          clinicalIndication: string;
          anatomicalSite: string;
          contrast: boolean;
          urgency: 'routine' | 'urgent' | 'emergency';
        },
      ][];
    }>(`consultation_${appointmentId}_radiology_draft`);
    if (radiologyDraft?.currentRequestedRadiology) {
      dispatch(setCurrentRadiologyRequest(radiologyDraft.currentRequestedRadiology));
    }
  }, [appointmentId, dispatch]);

  const clearDraft = (): void => {
    // Clear both labs and radiology drafts
    LocalStorageManager.removeJSON(`consultation_${appointmentId}_labs_draft`);
    LocalStorageManager.removeJSON(`consultation_${appointmentId}_radiology_draft`);
  };

  return (
    <>
      <Modal
        setState={setOpenAddSignature}
        open={openAddSignature}
        content={
          <Signature
            signatureAdded={() => setOpenAddSignature(false)}
            hasExistingSignature={hasSignature}
          />
        }
        showClose={true}
      />
      <div className="investigation-container">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Investigation</h1>
          <p className="mt-1 text-sm text-gray-600">
            Request laboratory tests and radiology investigations for the patient
          </p>
        </div>
        {hasInvestigation && (
          <Alert id="signature-alert" variant="info" className="my-4 border-amber-500 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-amber-800">
                {hasSignature
                  ? 'You can edit your digital signature if needed.'
                  : 'Lab requests require your digital signature before proceeding.'}
              </span>
              <button
                onClick={() => setOpenAddSignature(true)}
                className="ml-4 text-sm font-semibold text-amber-700 underline hover:text-amber-900"
              >
                {hasSignature ? 'Edit signature' : 'Add now'}
              </button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'labs' | 'radiology')}
          className="w-full"
        >
          <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="labs" className="flex items-center gap-2">
              <TestTube2 className="h-4 w-4" />
              <span>Laboratory Tests</span>
            </TabsTrigger>
            <TabsTrigger value="radiology" className="flex items-center gap-2">
              <Microscope className="h-4 w-4" />
              <span>Radiology</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="labs" className="mt-0">
            <Labs updateLabs={updateLabs} setUpdateLabs={setUpdateLabs} />
          </TabsContent>

          <TabsContent value="radiology" className="mt-0">
            <Radiology updateRadiology={updateRadiology} setUpdateRadiology={setUpdateRadiology} />
          </TabsContent>
        </Tabs>
        {hasInvestigation && (
          <div className="fixed right-4 bottom-16 flex items-center space-x-2 rounded-lg border bg-white p-4 shadow-lg">
            <Label htmlFor="signature-labs">
              {hasSignature ? 'Edit digital Signature' : 'Add digital Signature'}
            </Label>
            <Switch
              checked={addSignature}
              id="signature-labs"
              onCheckedChange={() => setAddSignature((prev) => !prev)}
            />
          </div>
        )}
        <div className="fixed bottom-0 left-0 z-50 flex w-full justify-end border-t border-gray-300 bg-white p-4 shadow-md">
          <Button
            onClick={() => void handleSubmitAndGoToExamination()}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            child={hasInvestigation ? 'Submit Investigations & Continue' : 'Continue to Diagnosis'}
          />
        </div>
      </div>
    </>
  );
};

export default Investigation;
