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
import { Role } from '@/types/shared.enum';

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
  const [showPreview, setShowPreview] = useState(false);
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
    const { slotId, date, time } = getValues();
    if (!slotId || !date || !time) {
      toast({
        title: 'Please select a time slot',
        description: 'You need to select a date and time before proceeding',
        variant: 'default',
      });
      return;
    }

    if (user) {
      if (user.role !== Role.Patient) {
        toast({
          title: 'Please use a patient account',
          description: 'Only patients can book appointments',
          variant: 'default',
        });
        return;
      }
      setShowSlots(false);
      setShowPreview(true);
      return;
    }
    router.push(`/sign-up?doctorId=${id}&slotId=${slotId}&doctor=${encodeURIComponent(fullName)}`);
  };

  const handleConfirmAndProceed = (): void => {
    const { slotId } = getValues();
    void onSubmit(slotId);
  };

  const onSubmit = async (slotId: string): Promise<void> => {
    setIsInitiatingPayment(true);

    const { payload } = await dispatch(
      initiatePayment({ additionalInfo: '', reason: 'Reason is not a priority now', slotId }), // TODO: Will remove or handle reason later
    );

    if (payload && showErrorToast(payload)) {
      toast(payload);
      setIsInitiatingPayment(false);
      setShowPreview(false);
      return;
    }

    const { authorization_url } = payload as ICheckout;
    window.location.replace(authorization_url);
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
        className="max-h-[95vh] max-w-xl overflow-y-auto p-5"
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
              <div className="mt-4 max-h-[45vh] overflow-y-auto">
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
          <div className="mt-4 ml-auto flex justify-end gap-x-4">
            <Button
              onClick={() => setShowSlots(false)}
              variant="outline"
              className="mr-3"
              child="Close"
              disabled={isInitiatingPayment}
            />
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
      <Modal
        className="max-h-[95vh] max-w-xl overflow-y-auto p-5"
        setState={(value) => {
          if (!isInitiatingPayment) {
            setShowPreview(value);
          }
        }}
        open={showPreview}
        content={
          <div className="mt-5">
            {isInitiatingPayment && (
              <div className="mb-4 flex items-center justify-center rounded-lg bg-blue-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                  <p className="text-sm font-medium text-blue-700">
                    Processing payment... Redirecting to Paystack
                  </p>
                </div>
              </div>
            )}
            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Appointment Preview</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <AvatarComp imageSrc={profilePicture} name={fullName} className="h-16 w-16" />
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900">Dr. {fullName}</h2>
                    <p className="text-primary-600 text-sm font-medium">
                      {specializations ? capitalize(specializations[0]) : 'General Practitioner'}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {experience ?? 1} year(s) experience &#8226; {noOfConsultations}{' '}
                      {noOfConsultations === 1 ? 'consultation' : 'consultations'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar size={20} className="text-primary-500" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Appointment Date</p>
                        <p className="text-base font-semibold text-gray-900">
                          {watch('date')
                            ? moment(watch('date')).format('dddd, MMMM Do, YYYY')
                            : 'Not selected'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-primary-500" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Appointment Time</p>
                        <p className="text-base font-semibold text-gray-900">
                          {watch('time') || 'Not selected'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Medal size={20} className="text-primary-500" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Session Duration</p>
                        <p className="text-base font-semibold text-gray-900">
                          {fee?.lengthOfSession || '45'} minutes
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-primary-200 bg-primary-50 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Total Amount</p>
                      <p className="text-primary-600 text-xl font-bold">GHS {fee?.amount || '0'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        footer={
          <div className="mt-4 flex justify-end gap-x-4">
            <Button
              onClick={() => {
                setShowPreview(false);
                setShowSlots(true);
              }}
              variant="outline"
              child="Go Back"
              disabled={isInitiatingPayment}
            />
            <Button
              isLoading={isInitiatingPayment}
              onClick={handleConfirmAndProceed}
              className="bg-primary hover:bg-primary-600"
              child="Confirm & Proceed to Payment"
              disabled={isInitiatingPayment}
            />
          </div>
        }
        title="Confirm Appointment"
        showClose={!isInitiatingPayment}
      />
      <div className="hover:border-primary-100 flex h-full w-full max-w-100 flex-col gap-2 rounded-[14px] border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
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
                title={`${fee?.lengthOfSession} session`}
                className="truncate text-xs text-gray-700 md:text-sm"
              >
                {fee?.lengthOfSession} session
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
