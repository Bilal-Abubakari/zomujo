import {
  DAYS_IN_WEEK,
  MILLISECONDS_IN_SECOND,
  MINUTES_IN_HOUR,
  SECONDS_IN_MINUTE,
} from '@/constants/constants';
import { cn } from '@/lib/utils';
import { House, Video } from 'lucide-react';
import React, { JSX } from 'react';
import moment from 'moment';
import { AppointmentStatus, Role } from '@/types/shared.enum';
import { AppointmentType, IAppointment } from '@/types/appointment.interface';
import { mergeDateAndTime } from '@/lib/date';
import { useAppSelector } from '@/lib/hooks';
import { selectUser } from '@/lib/features/auth/authSelector';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export type IAppointmentCardProps = {
  className?: string;
  appointment: IAppointment;
  handleSelectedCard: () => void;
  showDetails: boolean;
};
const AppointmentCard = ({
  className,
  appointment,
  handleSelectedCard,
  showDetails,
}: IAppointmentCardProps): JSX.Element => {
  const { role } = useAppSelector(selectUser)!;
  const { status, slot, type, patient, doctor } = appointment;
  const startDate = mergeDateAndTime(slot.date, slot.startTime);
  const endDate = mergeDateAndTime(slot.date, slot.endTime);
  const day = (startDate.getDay() + (DAYS_IN_WEEK - 1)) % DAYS_IN_WEEK;

  const hour = startDate.getHours() + startDate.getMinutes() / MINUTES_IN_HOUR;
  const duration =
    (endDate.getTime() - startDate.getTime()) /
    MILLISECONDS_IN_SECOND /
    MINUTES_IN_HOUR /
    SECONDS_IN_MINUTE;

  const height = 90 * duration;

  const getName = (): string => {
    if (role === Role.Patient) {
      return `${doctor.firstName} ${doctor.lastName}`;
    }
    return `${patient.firstName} ${patient.lastName}`;
  };

  return (
    <>
      <div
        style={{
          height,
          top: 40 + hour * 90,
          left: 80 + 260 * day,
        }}
        className={cn(
          'absolute z-8 flex w-[259px] cursor-pointer flex-col justify-between overflow-clip rounded-md border border-[#93C4F0] bg-[#E0EFFE] p-3.5 duration-150 hover:scale-[1.02]',
          height < 101 && 'p-2.5',
          status === AppointmentStatus.Pending && 'border-[#93C4F0] bg-[#E0EFFE]',
          status === AppointmentStatus.Accepted && 'border-green-300 bg-green-100',
          status === AppointmentStatus.Declined && 'border-error-300 bg-error-100',
          className,
        )}
        onClick={() => handleSelectedCard()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectedCard()}
      >
        <div className="flex flex-row items-start justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold">
              {type === AppointmentType.Visit ? 'Visit' : 'Virtual'}
            </p>
            <p className="text-xs font-medium text-gray-500">
              {moment(startDate).format('LT')} - {moment(endDate).format('LT')}
            </p>
          </div>
          {type === AppointmentType.Virtual ? <Video /> : <House className="h-4 w-4" />}
        </div>
        <div
          className={cn(
            'flex flex-row items-center justify-end gap-2 text-xs',
            height < 51 && 'hidden',
          )}
        >
          {getName()}
        </div>
      </div>
      {showDetails && <AppointmentDetails {...{ ...appointment, day, hour }} />}
    </>
  );
};

export default AppointmentCard;

type AppointmentDetails = IAppointment & {
  day: number;
  hour: number;
};
const AppointmentDetails = ({
  day,
  hour,
  status,
  reason,
  meetingLink,
  additionalInfo,
  patient: { firstName, id },
  slot: { date },
}: AppointmentDetails): JSX.Element => {
  const position = day > 4 ? -300 : 350;
  const statusStyles: Record<AppointmentStatus, string> = {
    [AppointmentStatus.Pending]: 'border-[#93C4F0] bg-[#E0EFFE]',
    [AppointmentStatus.Accepted]: 'border-green-300 bg-green-100',
    [AppointmentStatus.Declined]: 'border-error-300 bg-error-100',
    [AppointmentStatus.Completed]: 'border-green-300 bg-green-100',
  };

  const user = useAppSelector(selectUser);
  const isDoctor = user?.role === Role.Doctor;
  const router = useRouter();
  const redirectToPatient = (patientId: string): void => {
    router.push(`/dashboard/patients/${patientId}`);
  };

  return (
    <div
      style={{
        top: 40 + hour * 80,
        left: position + 260 * day,
      }}
      className={`absolute z-10 w-[350px] rounded-lg border-2 p-4 shadow-lg ${statusStyles[status]} hover:z-20`}
    >
      <p className="mb-2 text-lg font-semibold">Meeting with {firstName}</p>

      <Button
        child={
          <a
            href={meetingLink || '#'}
            target={meetingLink ? '_blank' : '_self'}
            rel="noopener noreferrer"
          >
            Join
          </a>
        }
        className={`rounded-full border border-black bg-black px-4 py-2 text-white transition duration-300 hover:bg-green-600 hover:text-white`}
      />
      <div className="my-4 border-t border-b border-current"></div>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-semibold">Date:</span>
        <span className="text-sm">{moment(date).format('dddd, LL')}</span>
      </div>

      <div className="mt-4">
        <p className="font-semibold">Reason for Visit:</p>
        <div className={`bg-opacity-50 mt-2 rounded-lg border p-2 text-sm ${statusStyles[status]}`}>
          <p>{reason}</p>
        </div>
      </div>

      {additionalInfo && (
        <div className="mt-4">
          <p className="font-semibold">Additional Notes</p>
          <p className="mt-2 text-sm">{additionalInfo}</p>
        </div>
      )}

      <div className="mt-4 flex justify-center">
        {isDoctor && (
          <Button
            child={'Start Consultation'}
            className="rounded-full border-2 border-black bg-black px-6 py-2 text-white transition duration-300 hover:bg-green-700"
            onClick={() => redirectToPatient(id)}
          />
        )}
      </div>
    </div>
  );
};
