'use client';

import React, { JSX, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  selectShowReviewModal,
  selectReviewAppointmentId,
  selectReviewRecordId,
  selectAppointment,
} from '@/lib/features/appointments/appointmentSelector';
import { hideReviewModal } from '@/lib/features/appointments/appointmentsSlice';
import { getConsultationAppointment } from '@/lib/features/appointments/consultation/consultationThunk';
import { getPatientRecords } from '@/lib/features/records/recordsThunk';
import { Modal } from '@/components/ui/dialog';
import Review from '@/components/review/review';
import { showErrorToast } from '@/lib/utils';
import { toast, Toast } from '@/hooks/use-toast';
import { selectRecordId } from '@/lib/features/patients/patientsSelector';

const DoctorReviewModal = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const showModal = useAppSelector(selectShowReviewModal);
  const appointmentId = useAppSelector(selectReviewAppointmentId);
  const storedRecordId = useAppSelector(selectReviewRecordId);
  const currentRecordId = useAppSelector(selectRecordId);

  const appointment = useAppSelector(selectAppointment);

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

  useEffect(() => {
    if (showModal && appointment?.patient?.id && !currentRecordId) {
      const fetchPatientData = async (): Promise<void> => {
        const { payload } = await dispatch(getPatientRecords(appointment.patient.id));
        if (showErrorToast(payload)) {
          toast(payload as Toast);
        }
      };

      void fetchPatientData();
    }
  }, [showModal, appointment, currentRecordId, dispatch]);

  const handleClose = (): void => {
    dispatch(hideReviewModal());
  };

  const handleReviewSuccess = (): void => {
    dispatch(hideReviewModal());
  };

  const recordId = storedRecordId || currentRecordId;

  if (!showModal || !appointmentId || !recordId) {
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

export default DoctorReviewModal;
