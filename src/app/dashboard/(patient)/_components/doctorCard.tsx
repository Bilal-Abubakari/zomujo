'use client';
import { Calendar, Medal } from 'lucide-react';
import React, { JSX, useState } from 'react';
import { IDoctor } from '@/types/doctor.interface';
import { Button } from '@/components/ui/button';
import moment from 'moment';
import { isToday } from '@/lib/date';
import { Modal } from '@/components/ui/dialog';
import { capitalize } from '@/lib/utils';
import { DoctorProfile } from '@/components/doctor/DoctorProfile';
import BookingModals from '@/components/doctor/BookingModals';
import { useBookingFlow } from '@/hooks/useBookingFlow';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [openDoctorDetails, setOpenDoctorDetails] = useState(false);

  const {
    showSlots,
    setShowSlots,
    showPreview,
    setShowPreview,
    isInitiatingPayment,
    register,
    setValue,
    watch,
    handleContinueBooking,
    handleConfirmAndPay,
  } = useBookingFlow({ doctorId: id, fullName });

  const getAvailability = (): string => {
    if (appointmentSlots.length === 0) {
      return 'No available slots';
    }
    const date = appointmentSlots[0].date;
    return isToday(date) ? 'Today' : moment(date).format('ddd, MMM, D');
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
      <BookingModals
        showSlots={showSlots}
        setShowSlots={setShowSlots}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        isInitiatingPayment={isInitiatingPayment}
        doctor={doctor}
        doctorId={id}
        register={register}
        setValue={setValue}
        watch={watch}
        handleContinueBooking={handleContinueBooking}
        handleConfirmAndPay={handleConfirmAndPay}
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
              {specializations?.length ? capitalize(specializations[0]) : 'General Practitioner'}
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
            <span className="text-primary shrink-0 text-xs font-bold">GH&#8373;{fee}</span>
          </div>
          <Button
            disabled={!hasSlots}
            title={hasSlots ? 'Book Appointment' : 'No available slots'}
            onClick={() => setShowSlots(true)}
            className="w-full rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
            child={hasSlots ? 'Book Appointment' : 'No Slots Available'}
          />
        </div>
      </div>
    </>
  );
};

export default DoctorCard;
