import React, { JSX } from 'react';
import moment from 'moment';
import { AvatarComp } from '@/components/ui/avatar';
import { IDoctor } from '@/types/doctor.interface';
import { AppointmentSlots } from '@/types/slots.interface';

interface BookingInfoCardProps {
  doctor: IDoctor;
  appointmentSlot: AppointmentSlots;
  fullName: string;
}

const BookingInfoCard = ({
  doctor,
  appointmentSlot,
  fullName,
}: BookingInfoCardProps): JSX.Element => {
  return (
    <div className="mx-auto w-full max-w-sm rounded-lg border p-4">
      <div className="mb-4 flex w-full flex-row gap-4">
        <div>
          <AvatarComp imageSrc={doctor?.profilePicture} name={fullName} className="h-18 w-18" />
        </div>
        <div className="flex w-full flex-col justify-center gap-y-1">
          <div className="flex items-center">
            <h2 className="text-lg font-bold text-gray-900">Dr. {fullName}</h2>
          </div>
          <p className="text-primary-600 text-sm font-medium">
            {doctor?.specializations ? doctor.specializations[0] : 'General Practitioner'}
          </p>
          <p className="text-primary-600 text-sm font-medium">
            {appointmentSlot?.date && moment(appointmentSlot.date).format('ddd, MMM D')} at{' '}
            {appointmentSlot?.startTime && moment(appointmentSlot.startTime).format('h:mm A')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingInfoCard;

