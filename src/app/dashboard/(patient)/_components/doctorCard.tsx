'use client';
import { Calendar, Clock, Medal, Star, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { JSX, useState } from 'react';
import { IDoctor } from '@/types/doctor.interface';
import { MedicalAppointmentType } from '@/hooks/useQueryParam';
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
import { useAppSelector } from '@/lib/hooks';
import { selectUser } from '@/lib/features/auth/authSelector';

export type DoctorCardProps = {
  doctor: IDoctor;
};

const DoctorCard = ({ doctor }: DoctorCardProps): JSX.Element => {
  const {
    firstName,
    lastName,
    specializations,
    rate,
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
  const [showSlots, setShowSlots] = useState(false);
  const [openDoctorDetails, setOpenDoctorDetails] = useState(false);
  const user = useAppSelector(selectUser);

  const handleBookAppointment = (): void => {
    if (user) {
      router.push(
        `/dashboard/book-appointment/${id}?appointmentType=${MedicalAppointmentType.Doctor}`,
      );
      return;
    }
    setShowSlots(true);
  };

  const getAvailability = (): string => {
    if (appointmentSlots.length === 0) {
      return 'No available slots';
    }
    const date = appointmentSlots[0].date;
    return `Next available ${isToday(date) ? 'Today' : moment(date).format('ddd, MMM, D')}`;
  };

  const bookAppointment = (): void => {
    const { slotId } = getValues();
    router.push(`/sign-up?doctorId=${id}&slotId=${slotId}&doctor=${encodeURIComponent(fullName)}`);
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
                <h2 className="text-2xl font-bold text-gray-900">Dr. {fullName}</h2>
                <p className="text-primary-600 text-md font-medium">
                  {specializations ? specializations[0] : 'General Practitioner'}
                </p>
                <p>
                  {experience ?? 1} year(s) experience &#8226; {noOfConsultations}{' '}
                  {noOfConsultations === 1 ? 'consultation' : 'consultations'}
                </p>
              </div>
            </div>
            <div className="mt-8">
              <span className="text-xl font-semibold">Available Appointments</span>
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
            <Button onClick={bookAppointment} child="Continue" disabled={!watch('slotId')} />
          </div>
        }
        title="Book an appointment"
        showClose={true}
      />
      <div className="hover:border-primary-100 flex w-full max-w-[400px] shrink-0 cursor-pointer flex-col gap-2 rounded-[14px] border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="flex flex-col">
          <div className="mb-4 flex w-full flex-row gap-4">
            <div className="relative">
              <AvatarComp imageSrc={profilePicture} name={fullName} className="h-14 w-14" />
              <div className="absolute -right-1 bottom-1 h-4 w-4 rounded-full border-2 border-white bg-green-400"></div>
            </div>
            <div className="flex w-full flex-col justify-center">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">Dr. {fullName}</h2>
                <div className="bg-primary-50 flex h-fit items-center gap-1 rounded-full px-2 py-0.5">
                  <Star size={14} className="fill-warning-300 text-warning-300" />
                  <p className="text-primary-dark text-sm font-semibold">{rate}</p>
                </div>
              </div>
              <p className="text-primary-600 text-sm font-medium">
                {specializations ? specializations[0] : 'General Practitioner'}
              </p>
            </div>
          </div>

          <hr className="mb-4 w-full border-gray-100" />

          <div className="mb-5 grid w-full grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Medal size={16} className="text-primary-500" />
              <p
                title={`${experience ?? 1} year(s) experience`}
                className="truncate text-sm text-gray-700"
              >
                {experience ?? 1} year(s) experience
              </p>
            </div>

            {noOfConsultations && (
              <div className="flex items-center gap-2">
                <Users size={16} className="text-primary-500" />
                <p className="text-sm text-gray-700">{noOfConsultations} consultations</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary-500" />
              <p className="text-sm text-gray-700">{fee.lengthOfSession} session</p>
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <Calendar size={16} className="text-primary-500" />
              <p className="text-sm text-gray-700">
                {getAvailability()}{' '}
                <Button onClick={() => setShowSlots(true)} variant="link" child="See more" />
              </p>
            </div>
          </div>
        </div>
        <div>
          <Button
            onClick={() => setOpenDoctorDetails(true)}
            variant="link"
            child="View Doctor Details"
          />
        </div>
        <div className="mt-auto flex flex-row items-center justify-between border-t border-gray-100 pt-2">
          <div className="flex flex-col">
            <p className="text-primary-dark text-lg font-bold">GHs {fee?.amount}</p>
            <p className="text-xs font-medium text-gray-500">per session</p>
          </div>

          <Button
            disabled={appointmentSlots.length === 0}
            title={appointmentSlots.length === 0 ? 'No available slots' : 'Book Appointment'}
            onClick={handleBookAppointment}
            className="bg-primary hover:bg-primary-600 h-10 rounded-md px-4 font-medium text-white transition-colors duration-300"
            child="Book Appointment"
          />
        </div>
      </div>
    </>
  );
};

export default DoctorCard;
