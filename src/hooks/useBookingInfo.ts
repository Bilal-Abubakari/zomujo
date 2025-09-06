import { useEffect, useMemo, useState } from 'react';
import { useQueryParam } from '@/hooks/useQueryParam';
import { useAppDispatch } from '@/lib/hooks';
import { doctorInfo } from '@/lib/features/doctors/doctorsThunk';
import { getAppointmentSlot } from '@/lib/features/appointments/appointmentsThunk';
import { showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ToastStatus } from '@/types/shared.enum';
import { AppointmentSlots } from '@/types/slots.interface';
import { IDoctor } from '@/types/doctor.interface';

export interface IUseBookingInfo {
  isLoading: boolean;
  appointmentSlot: AppointmentSlots | null;
  doctor: IDoctor | null;
  hasBookingInfo: boolean;
  fullName: string;
  doctorId: string | null;
  slotId: string | null;
}

export const useBookingInfo = (): IUseBookingInfo => {
  const { getQueryParam } = useQueryParam();
  const dispatch = useAppDispatch();

  const doctorId = getQueryParam('doctorId');
  const slotId = getQueryParam('slotId');

  const [isLoading, setIsLoading] = useState(true);
  const [appointmentSlot, setAppointmentSlot] = useState<AppointmentSlots | null>(null);
  const [doctor, setDoctor] = useState<IDoctor | null>(null);

  const hasBookingInfo = useMemo(() => !!doctorId && !!slotId, [doctorId, slotId]);
  const fullName = useMemo(
    () => (doctor ? `${doctor.firstName} ${doctor.lastName}` : ''),
    [doctor],
  );

  useEffect(() => {
    const fetchBookingInfo = async (): Promise<void> => {
      if (hasBookingInfo) {
        setIsLoading(true);
        const [{ payload: doctorInfoResponse }, { payload: slotResponse }] = await Promise.all([
          dispatch(doctorInfo(doctorId)),
          dispatch(getAppointmentSlot(slotId)),
        ]);
        if (showErrorToast(doctorInfoResponse) || showErrorToast(slotResponse)) {
          toast({
            title: ToastStatus.Error,
            description: 'Failed to load booking info',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
        setAppointmentSlot(slotResponse as AppointmentSlots);
        setDoctor(doctorInfoResponse as IDoctor);
      }
      setIsLoading(false);
    };
    void fetchBookingInfo();
  }, [dispatch, doctorId, hasBookingInfo, slotId]);

  return {
    isLoading,
    appointmentSlot,
    doctor,
    hasBookingInfo,
    fullName,
    doctorId,
    slotId,
  };
};
