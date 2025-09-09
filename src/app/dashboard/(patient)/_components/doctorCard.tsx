'use client';
import { Calendar, Clock, Medal, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { JSX, useState } from 'react';
import { IDoctor } from '@/types/doctor.interface';
import { Button } from '@/components/ui/button';
import { AvatarComp } from '@/components/ui/avatar';
import moment from 'moment';
import { isToday } from '@/lib/date';
import AvailableDates from '@/app/dashboard/(patient)/book-appointment/[appointment]/_component/availableDates';
import { Modal } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MODE } from '@/constants/constants';
import { IBookingForm } from '@/types/booking.interface';
import { bookingSchema } from '@/schemas/booking.schema';
import DoctorDetails from '@/app/dashboard/_components/doctorDetails';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectUser } from '@/lib/features/auth/authSelector';
import { initiatePayment } from '@/lib/features/payments/paymentsThunk';
import { capitalize, showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ICheckout } from '@/types/payment.interface';

export type DoctorCardProps = {
  doctor: IDoctor;
};

const DoctorCard = ({ doctor }: DoctorCardProps): JSX.Element => {
  const {
    firstName,
    lastName,
    specializations,
    experience,
    appointmentSlots,
    noOfConsultations,
    id,
    profilePicture,
    fee,
  } = doctor;
  const fullName = `${firstName} ${lastName}`;
  const { register, setValue, getValues, watch } = useForm<IBookingForm>({
    resolver: zodResolver(bookingSchema),
    mode: MODE.ON_TOUCH,
  });
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showSlots, setShowSlots] = useState(false);
  const [openDoctorDetails, setOpenDoctorDetails] = useState(false);
  const user = useAppSelector(selectUser);
  const [isInitiatingPayment, setIsInitiatingPayment] = useState<boolean>(false);

  const handleBookAppointment = (): void => {
    setShowSlots(true);
  };

  const getAvailability = (): string => {
    if (appointmentSlots.length === 0) {
      return 'No available slots';
    }
    const date = appointmentSlots[0].date;
    return isToday(date) ? 'Today' : moment(date).format('ddd, MMM, D');
  };

  const bookAppointment = (): void => {
    const { slotId } = getValues();
    if (user) {
      void onSubmit(slotId);
      return;
    }
    router.push(`/sign-up?doctorId=${id}&slotId=${slotId}&doctor=${encodeURIComponent(fullName)}`);
  };

  const onSubmit = async (slotId: string): Promise<void> => {
    setIsInitiatingPayment(true);

    const { payload } = await dispatch(
      initiatePayment({ additionalInfo: '', reason: 'Reason is not a priority now', slotId }), // TODO: Will remove or handle reason later
    );

    if (payload && showErrorToast(payload)) {
      toast(payload);
      setIsInitiatingPayment(false);
      return;
    }

    const { authorization_url } = payload as ICheckout;
    window.location.replace(authorization_url);
    setIsInitiatingPayment(false);
  };

  return (
    <>
      <Modal
        open={openDoctorDetails}
        content={
          <DoctorDetails
            doctorId={doctor.id}
            showBookmark={true}
            bookAppointmentHandler={() => {
              setOpenDoctorDetails(false);
              setShowSlots(true);
            }}
          />
        }
        className="max-h-screen max-w-screen overflow-y-scroll md:max-h-[90vh] md:max-w-[80vw]"
        setState={setOpenDoctorDetails}
        showClose={true}
      />
      <Modal
        className="max-w-xl"
        setState={setShowSlots}
        open={showSlots}
        content={
          <div className="mt-5">
            <div className="flex gap-4">
              {' '}
              <AvatarComp imageSrc={profilePicture} name={fullName} className="h-20 w-20" />
              <div>
                <h2 className="text-lg font-bold text-gray-900 md:text-xl">Dr. {fullName}</h2>
                <p className="text-primary-600 text-sm font-medium md:text-base">
                  {specializations ? capitalize(specializations[0]) : 'General Practitioner'}
                </p>
                <p className="text-sm md:text-base">
                  {experience ?? 1} year(s) experience &#8226; {noOfConsultations}{' '}
                  {noOfConsultations === 1 ? 'consultation' : 'consultations'}
                </p>
              </div>
            </div>
            <div className="mt-8">
              <span className="text-base font-semibold md:text-lg">Available Appointments</span>
              <div className="mt-4 max-h-[50vh] overflow-y-auto">
                <AvailableDates
                  doctorId={id}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                />
              </div>
            </div>
          </div>
        }
        footer={
          <div className="mt-11 ml-auto flex justify-end">
            <Button
              isLoading={isInitiatingPayment}
              onClick={bookAppointment}
              child="Continue"
              disabled={!watch('slotId') || isInitiatingPayment}
            />
          </div>
        }
        title="Book an appointment"
        showClose={true}
      />
      <div className="hover:border-primary-100 flex h-full w-full max-w-[400px] flex-col gap-2 rounded-[14px] border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="flex flex-1 flex-col">
          <div className="mb-4 flex w-full flex-row gap-4">
            <div className="relative shrink-0">
              <AvatarComp imageSrc={profilePicture} name={fullName} className="h-14 w-14" />
              <div className="absolute -right-1 bottom-1 h-4 w-4 rounded-full border-2 border-white bg-green-400"></div>
            </div>
            <div className="flex w-full flex-col justify-center overflow-hidden">
              <div className="flex items-center gap-2">
                <span
                  title={`Dr. ${fullName}`}
                  className="truncate text-base font-bold text-gray-900 md:text-lg"
                >
                  Dr. {fullName}
                </span>
              </div>
              <p
                title={specializations ? specializations[0] : 'General Practitioner'}
                className="text-primary-600 truncate text-xs font-medium md:text-sm"
              >
                {specializations ? capitalize(specializations[0]) : 'General Practitioner'}
              </p>
            </div>
          </div>

          <hr className="mb-4 w-full border-gray-100" />

          <div className="mb-5 flex w-full flex-wrap gap-y-3">
            <div className="flex w-1/2 items-center gap-2 pr-2">
              <Medal size={16} className="text-primary-500" />
              <p
                title={`${experience ?? 1} year(s) experience`}
                className="truncate text-xs text-gray-700 md:text-sm"
              >
                {experience ?? 1} year(s) experience
              </p>
            </div>

            {noOfConsultations && (
              <div className="flex w-1/2 items-center gap-2 pl-2">
                <Users size={16} className="text-primary-500" />
                <p
                  title={`${noOfConsultations} consultations`}
                  className="truncate text-xs text-gray-700 md:text-sm"
                >
                  {noOfConsultations} consultations
                </p>
              </div>
            )}

            <div className="flex w-1/2 items-center gap-2 pr-2">
              <Clock size={16} className="text-primary-500" />
              <p
                title={`${fee.lengthOfSession} session`}
                className="truncate text-xs text-gray-700 md:text-sm"
              >
                {fee.lengthOfSession} session
              </p>
            </div>

            <div className="flex w-full items-start gap-2 pt-3">
              <Calendar size={16} className="text-primary-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700">Next available:</p>
                <p className="text-sm text-gray-700">
                  {getAvailability()}{' '}
                  <Button onClick={() => setShowSlots(true)} variant="link" child="See more" />
                </p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Button
            onClick={() => setOpenDoctorDetails(true)}
            variant="link"
            child="View Doctor Details"
            className="text-sm"
          />
        </div>
        <div className="mt-auto flex flex-row items-center justify-between border-t border-gray-100 pt-2">
          <div className="flex flex-col">
            <p className="text-primary-dark text-base font-bold md:text-lg">GHs {fee?.amount}</p>
            <p className="text-xs font-medium text-gray-500">per session</p>
          </div>

          <Button
            disabled={appointmentSlots.length === 0}
            title={appointmentSlots.length === 0 ? 'No available slots' : 'Book Appointment'}
            onClick={handleBookAppointment}
            className="bg-primary hover:bg-primary-600 h-10 shrink-0 rounded-md px-3 text-sm font-medium text-white transition-colors duration-300 md:px-4"
            child="Book Appointment"
          />
        </div>
      </div>
    </>
  );
};

export default DoctorCard;
