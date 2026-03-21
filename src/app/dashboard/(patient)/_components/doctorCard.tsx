'use client';
import { Calendar, Clock, Medal } from 'lucide-react';
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
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectUser } from '@/lib/features/auth/authSelector';
import { initiatePayment } from '@/lib/features/payments/paymentsThunk';
import { capitalize, showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ICheckout } from '@/types/payment.interface';
import { Role } from '@/types/shared.enum';
import { Checkbox } from '@/components/ui/checkbox';
import { DoctorProfile } from '@/components/doctor/DoctorProfile';

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
    consultationCount,
    noOfConsultations,
    id,
    profilePicture,
    fee,
  } = doctor;
  const fullName = `${firstName} ${lastName}`;
  const { register, setValue, getValues, watch } = useForm<IBookingForm>({
    resolver: zodResolver(bookingSchema),
    mode: MODE.ON_TOUCH,
    defaultValues: {
      isFollowUp: false,
    },
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
    const { slotId, isFollowUp } = getValues();
    void onSubmit(slotId, isFollowUp);
  };

  const onSubmit = async (slotId: string, isFollowUp: boolean): Promise<void> => {
    setIsInitiatingPayment(true);

    const { payload } = await dispatch(
      initiatePayment({
        additionalInfo: '',
        reason: 'Reason is not a priority now',
        slotId,
        isFollowUp,
      }),
    );

    if (payload && showErrorToast(payload)) {
      toast(payload);
      setIsInitiatingPayment(false);
      setShowPreview(false);
      return;
    }

    const { authorization_url } = payload as ICheckout;
    globalThis.location.replace(authorization_url);
  };

  const hasSlots = appointmentSlots.length > 0;

  return (
    <>
      <Modal
        open={openDoctorDetails}
        content={
          <div className="mt-3z relative flex flex-col">
            <DoctorProfile ctaLabel={'Book Appointment'} doctorId={doctor.id} />
            <div className="sticky right-0 bottom-0 left-0 z-20 flex justify-center border-t bg-white p-4">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  setOpenDoctorDetails(false);
                  router.push(`/doctor/${doctor.id}`);
                }}
                child="View Full Profile & Share"
              />
            </div>
          </div>
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
                    Processing payment... Redirecting to Payment Service
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
                      {experience ?? 1} year(s) experience &#8226;{' '}
                      {consultationCount ?? noOfConsultations ?? 0}{' '}
                      {(consultationCount ?? noOfConsultations) === 1
                        ? 'consultation'
                        : 'consultations'}
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

                <label
                  htmlFor="isFollowUp"
                  className="mt-4 flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50/50 p-4"
                >
                  <Checkbox
                    id="isFollowUp"
                    checked={watch('isFollowUp')}
                    onCheckedChange={(checked) => setValue('isFollowUp', checked === true)}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <span className="text-sm leading-none font-semibold text-gray-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      This is a follow-up consultation
                    </span>
                    <p className="text-xs text-gray-500">
                      Check this if you have seen Dr. {lastName} before for this same health
                      concern. This helps the doctor prepare for your session.
                    </p>
                  </div>
                </label>

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
      <div className="group relative flex h-full w-62.5 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <button
          className="relative block h-72 w-full shrink-0 cursor-pointer overflow-hidden bg-gray-200"
          onClick={() => setOpenDoctorDetails(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOpenDoctorDetails(true);
            }
          }}
          aria-label={`View profile of Dr. ${fullName}`}
        >
          {profilePicture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profilePicture}
              alt={`Dr. ${fullName}`}
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="from-primary-100 to-primary-200 flex h-full w-full items-center justify-center bg-linear-to-br">
              <span className="text-primary-600 text-6xl font-extrabold drop-shadow-sm">
                {firstName[0]}
                {lastName[0]}
              </span>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-36 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

          <div className="absolute top-3 left-3">
            {hasSlots ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                {''}
                Available
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white/80 backdrop-blur-sm">
                No Slots
              </span>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 px-3.5 pb-3.5">
            <h3 className="truncate text-base leading-tight font-bold text-white drop-shadow">
              Dr. {fullName}
            </h3>
            <p className="mt-0.5 truncate text-[11px] font-medium text-white/80">
              {specializations ? capitalize(specializations[0]) : 'General Practitioner'}
            </p>
          </div>
        </button>

        <div className="flex flex-col gap-3 p-3.5">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Medal size={12} className="text-primary-400 shrink-0" />
            <span className="font-medium text-gray-700">{experience ?? 1} yrs exp</span>
            <span className="text-gray-300">·</span>
            <span>{noOfConsultations ?? 0} consults</span>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
            <Calendar size={12} className="text-primary-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-400">Next available</p>
              <p className="truncate text-xs font-semibold text-gray-800">{getAvailability()}</p>
            </div>
            <span className="text-primary shrink-0 text-xs font-bold">GH&#8373;{fee?.amount}</span>
          </div>
          <Button
            disabled={!hasSlots}
            title={hasSlots ? 'Book Appointment' : 'No available slots'}
            onClick={handleBookAppointment}
            className="w-full rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
            child={hasSlots ? 'Book Appointment' : 'No Slots Available'}
          />
        </div>
      </div>
    </>
  );
};

export default DoctorCard;
