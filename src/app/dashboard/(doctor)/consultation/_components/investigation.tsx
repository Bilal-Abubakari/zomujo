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
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectDoctorSignature } from '@/lib/features/doctors/doctorsSelector';
import { Button } from '@/components/ui/button';
import Signature from '@/components/signature/signature';
import { selectHasInvestigation } from '@/lib/features/appointments/consultation/consultationSelector';
import { setInvestigationHistory } from '@/lib/features/appointments/consultation/consultationSlice';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

const Investigation = ({
  goToNext,
  goToPrevious,
}: {
  goToNext: () => void;
  goToPrevious: () => void;
}): JSX.Element => {
  const { state, isMobile } = useSidebar();
  const dispatch = useAppDispatch();
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
    dispatch(setInvestigationHistory(''));
  }, []);

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
        {hasInvestigation && (
          <Alert
            id="signature-alert"
            variant="info"
            className="mb-1 border-amber-500 bg-amber-50 p-2"
          >
            <AlertDescription className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span className="text-amber-800">
                  {hasSignature
                    ? 'You can edit your digital signature if needed.'
                    : 'Lab requests require your digital signature before proceeding.'}
                </span>
              </div>
              <button
                onClick={() => setOpenAddSignature(true)}
                className="ml-4 font-semibold text-amber-700 underline hover:text-amber-900"
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
          <TabsList className="mb-2 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="labs" className="flex cursor-pointer items-center gap-2">
              <TestTube2 className="h-4 w-4" />
              <span>Laboratory Tests</span>
            </TabsTrigger>
            <TabsTrigger value="radiology" className="flex cursor-pointer items-center gap-2">
              <Microscope className="h-4 w-4" />
              <span>Radiology & Others</span>
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
          <div className="fixed right-4 bottom-14 z-100 flex items-center space-x-2 rounded-lg border bg-white p-4 shadow-lg">
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
        <div
          className={cn(
            'fixed bottom-0 z-50 flex justify-between border-t border-gray-300 bg-white px-4 py-2 shadow-md',
            !isMobile && state === 'expanded'
              ? 'left-(--sidebar-width) w-[calc(100%-var(--sidebar-width))]'
              : 'left-0 w-full',
          )}
        >
          <Button onClick={goToPrevious} variant="outline" child="Back to History" />
          <Button onClick={handleSubmitAndGoToExamination} child="Continue to Prescription" />
        </div>
      </div>
    </>
  );
};

export default Investigation;
