'use client';
import React, { JSX, useEffect, useState } from 'react';
import { showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Modal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import PastConsultationView from '@/app/dashboard/(doctor)/_components/PastConsultationView';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';
import { IAppointment } from '@/types/appointment.interface';
import axios from '@/lib/axios';
import { IResponse } from '@/types/shared.interface';

interface ConsultationViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string | null;
}

const ConsultationViewModal = ({
  open,
  onOpenChange,
  appointmentId,
}: ConsultationViewModalProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [consultationData, setConsultationData] = useState<IAppointment | null>(null);
  const [navigationStack, setNavigationStack] = useState<string[]>([]);
  const [currentViewId, setCurrentViewId] = useState<string | null>(appointmentId);

  const fetchConsultationDetails = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { data } = await axios.get<IResponse<IAppointment>>(`appointments/${id}`);
      setConsultationData(data.data);
    } catch (error) {
      if (showErrorToast(error)) {
        toast({
          title: 'Error',
          description: 'Failed to load consultation details',
          variant: 'destructive',
        });
      }
      onOpenChange(false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (open && appointmentId) {
      setCurrentViewId(appointmentId);
      setNavigationStack([]);
      void fetchConsultationDetails(appointmentId);
    } else if (!open) {
      setConsultationData(null);
      setNavigationStack([]);
      setCurrentViewId(null);
    }
  }, [open, appointmentId]);

  const handleViewLinked = (linkedId: string): void => {
    if (currentViewId) {
      setNavigationStack((prev) => [...prev, currentViewId]);
    }
    setCurrentViewId(linkedId);
    void fetchConsultationDetails(linkedId);
  };

  const handleGoBack = (): void => {
    const stack = [...navigationStack];
    const previousId = stack.pop();
    setNavigationStack(stack);
    if (previousId) {
      setCurrentViewId(previousId);
      void fetchConsultationDetails(previousId);
    }
  };

  const handleClose = (): void => {
    onOpenChange(false);
  };

  const handleSetState = (value: React.SetStateAction<boolean>): void => {
    const newValue = typeof value === 'function' ? value(open) : value;
    onOpenChange(newValue);
  };

  const canGoBack = navigationStack.length > 0;

  return (
    <Modal
      open={open}
      setState={handleSetState}
      showClose={false}
      className="h-[90vh] max-h-[90vh] max-w-6xl overflow-auto p-0"
      dialogOverlayClassName="bg-black/60"
      content={
        <div className="flex h-full flex-col">
          {isLoading && <LoadingOverlay />}

          <div className="sticky top-0 shrink-0 border-b bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-1 items-center gap-3">
                {canGoBack && (
                  <Button
                    onClick={handleGoBack}
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 shrink-0 rounded-full p-0 hover:bg-gray-100"
                    aria-label="Go back"
                    child={<ArrowLeft className="h-5 w-5 text-gray-500" />}
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {canGoBack ? 'Linked Consultation' : 'Consultation Details'}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {canGoBack
                      ? 'Viewing a linked past consultation'
                      : 'Review the details of this past consultation'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleClose}
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 shrink-0 rounded-full p-0 hover:bg-gray-100"
                  aria-label="Close modal"
                  child={<X className="h-5 w-5 text-gray-500" />}
                />
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 px-6 py-4">
            {!isLoading && consultationData && (
              <PastConsultationView
                appointment={consultationData}
                onViewLinkedConsultation={handleViewLinked}
              />
            )}
          </div>
        </div>
      }
    />
  );
};

export default ConsultationViewModal;
