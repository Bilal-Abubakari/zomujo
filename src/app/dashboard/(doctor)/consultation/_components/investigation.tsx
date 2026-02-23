'use client';
import React, { JSX, useEffect, useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestTube2, Microscope, AlertCircle } from 'lucide-react';
import Labs, { LabsRef } from './labs';
import Radiology, { RadiologyRef } from './radiology';
import { Modal } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppSelector } from '@/lib/hooks';
import { selectDoctorSignature } from '@/lib/features/doctors/doctorsSelector';
import { Button } from '@/components/ui/button';
import Signature from '@/components/signature/signature';
import { selectHasInvestigation } from '@/lib/features/appointments/consultation/consultationSelector';

const Investigation = ({ goToNext }: { goToNext: () => void }): JSX.Element => {
  const [activeTab, setActiveTab] = useState<'labs' | 'radiology'>('labs');
  const [openAddSignature, setOpenAddSignature] = useState(false);
  const [addSignature, setAddSignature] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const doctorSignature = useAppSelector(selectDoctorSignature);
  const hasInvestigation = useAppSelector(selectHasInvestigation);
  const hasSignature = !!doctorSignature;
  const labsRef = useRef<LabsRef>(null);
  const radiologyRef = useRef<RadiologyRef>(null);

  const handleSubmitAndGoToExamination = (): void => {
    // Check if there are unsaved changes in Labs or Radiology
    const hasLabUnsavedChanges = labsRef.current?.hasUnsavedChanges;
    const hasRadiologyUnsavedChanges = radiologyRef.current?.hasUnsavedChanges;

    if (hasLabUnsavedChanges || hasRadiologyUnsavedChanges) {
      setShowUnsavedWarning(true);
      return;
    }
    goToNext();
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

      <Modal
        setState={setShowUnsavedWarning}
        open={showUnsavedWarning}
        content={
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">Unsaved Changes</h3>
            <p className="mt-2 text-sm text-gray-600">
              You have unsaved laboratory test changes. Do you want to continue without saving?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                onClick={() => setShowUnsavedWarning(false)}
                variant="outline"
                child="Cancel"
              />
              <Button
                onClick={() => {
                  setShowUnsavedWarning(false);
                  goToNext();
                }}
                child="Continue Without Saving"
              />
            </div>
          </div>
        }
        showClose={true}
      />

      <div className="investigation-container">
        {/*<div className="mb-6">*/}
        {/*  <h1 className="text-2xl font-bold">Investigation</h1>*/}
        {/*  <p className="mt-1 text-sm text-gray-600">*/}
        {/*    Request laboratory tests and radiology investigations for the patient*/}
        {/*  </p>*/}
        {/*</div>*/}
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
          <TabsList className="mb-3 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="labs" className="flex items-center gap-2">
              <TestTube2 className="h-4 w-4" />
              <span>Laboratory Tests</span>
            </TabsTrigger>
            <TabsTrigger value="radiology" className="flex items-center gap-2">
              <Microscope className="h-4 w-4" />
              <span>Radiology</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="labs" className="max-h-fit">
            <Labs ref={labsRef} />
          </TabsContent>

          <TabsContent value="radiology" className="overflow-visible">
            <Radiology ref={radiologyRef} />
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
          <Button onClick={handleSubmitAndGoToExamination} child={'Continue to Diagnosis'} />
        </div>
      </div>
    </>
  );
};

export default Investigation;
