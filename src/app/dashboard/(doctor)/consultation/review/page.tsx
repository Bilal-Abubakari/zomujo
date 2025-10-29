'use client';
import React, { JSX, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks';
import { getConsultationAppointment } from '@/lib/features/appointments/consultation/consultationThunk';
import { showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import LoadingOverlay from '@/components/loadingOverlay/loadingOverlay';
import ReviewPastConsultation from '../../_components/ReviewPastConsultation';
import { RoleProvider } from '@/app/dashboard/_components/providers/roleProvider';
import { Role } from '@/types/shared.enum';

const PastConsultationPage = (): JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const appointmentId = searchParams.get('appointmentId');

  const fetchConsultationData = async (): Promise<void> => {
    if (!appointmentId) {
      toast({
        title: 'Error',
        description: 'No appointment ID provided',
        variant: 'destructive',
      });
      router.push('/dashboard/appointment');
      return;
    }

    setIsLoading(true);
    const appointmentPayload = await dispatch(getConsultationAppointment(appointmentId)).unwrap();
    if (showErrorToast(appointmentPayload)) {
      toast(appointmentPayload);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    void fetchConsultationData();
  }, [appointmentId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <LoadingOverlay message="Loading past consultation..." />
      </div>
    );
  }

  return (
    <RoleProvider role={Role.Doctor}>
      <ReviewPastConsultation />
    </RoleProvider>
  );
};

export default PastConsultationPage;
