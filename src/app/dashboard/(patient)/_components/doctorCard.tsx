'use client';
import { Calendar, Clock, Medal, Star, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { JSX } from 'react';
import { IDoctor } from '@/types/doctor.interface';
import { MedicalAppointmentType } from '@/hooks/useQueryParam';
import { Button } from '@/components/ui/button';
import { AvatarComp } from '@/components/ui/avatar';

const DoctorCard = ({
  firstName,
  lastName,
  specializations,
  rate,
  experience,
  noOfConsultations,
  id,
  profilePicture,
  fee,
}: IDoctor): JSX.Element => {
  const router = useRouter();

  const handleBookAppointment = (event: React.MouseEvent): void => {
    event.stopPropagation();
    router.push(
      `/dashboard/book-appointment/${id}?appointmentType=${MedicalAppointmentType.Doctor}`,
    );
  };

  const handleCardClick = (): void => {
    router.push(`/dashboard/doctor/${id}`);
  };

  return (
    <div
      role="button"
      onClick={handleCardClick}
      className="hover:border-primary-100 flex w-full max-w-[400px] shrink-0 cursor-pointer flex-col gap-2 rounded-[14px] border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md"
    >
      <div className="flex flex-col">
        <div className="mb-4 flex w-full flex-row gap-4">
          <div className="relative">
            <AvatarComp
              imageSrc={profilePicture}
              name={`${firstName} ${lastName}`}
              className="h-14 w-14"
            />
            <div className="absolute -right-1 bottom-1 h-4 w-4 rounded-full border-2 border-white bg-green-400"></div>
          </div>
          <div className="flex w-full flex-col justify-center">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Dr. {`${firstName} ${lastName}`}</h2>
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
            <p className="text-sm text-gray-700">45 min session</p>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-primary-500" />
            <p className="text-sm text-gray-700">Available today</p>
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-row items-center justify-between border-t border-gray-100 pt-2">
        <div className="flex flex-col">
          <p className="text-primary-dark text-lg font-bold">GHs {fee?.amount}</p>
          <p className="text-xs font-medium text-gray-500">per session</p>
        </div>

        <Button
          onClick={handleBookAppointment}
          className="bg-primary hover:bg-primary-600 h-10 rounded-md px-4 font-medium text-white transition-colors duration-300"
          child="Book Appointment"
        />
      </div>
    </div>
  );
};

export default DoctorCard;
