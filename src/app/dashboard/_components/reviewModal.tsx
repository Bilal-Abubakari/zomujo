'use client';

import React, { JSX, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  selectShowReviewModal,
  selectReviewAppointmentId,
} from '@/lib/features/appointments/appointmentSelector';
import { hideReviewModal } from '@/lib/features/appointments/appointmentsSlice';
import { getConsultationAppointment } from '@/lib/features/appointments/consultation/consultationThunk';
import { Modal } from '@/components/ui/dialog';
import Review from '@/components/review/review';
import { showErrorToast } from '@/lib/utils';
import { toast, Toast } from '@/hooks/use-toast';

const ReviewModal = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const showModal = useAppSelector(selectShowReviewModal);
  const appointmentId = useAppSelector(selectReviewAppointmentId);

  useEffect(() => {
    if (showModal && appointmentId) {
      const fetchData = async (): Promise<void> => {
        const appointmentPayload = await dispatch(
          getConsultationAppointment(appointmentId),
        ).unwrap();
        if (showErrorToast(appointmentPayload)) {
          toast(appointmentPayload as Toast);
        }
      };

      void fetchData();
    }
  }, [showModal, appointmentId, dispatch]);

  const handleClose = (): void => {
    dispatch(hideReviewModal());
  };

  const handleReviewSuccess = (): void => {
    dispatch(hideReviewModal());
  };

  if (!showModal || !appointmentId) {
    return <></>;
  }

  return (
    <Modal
      open={showModal}
      content={<Review onSuccess={handleReviewSuccess} />}
      showClose={true}
      setState={handleClose}
      className="max-h-[90vh] max-w-4xl overflow-y-auto"
    />
  );
};

export default ReviewModal;
