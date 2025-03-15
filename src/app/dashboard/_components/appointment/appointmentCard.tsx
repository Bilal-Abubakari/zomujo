import { AvatarComp } from '@/components/ui/avatar';
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
import { AppointmentStatus } from '@/types/shared.enum';
import { AppointmentType } from '@/types/appointment.interface';

export type IAppointmentCardProps = {
  id: string;
  className?: string;
  startDate: Date;
  endDate: Date;
  visitType: AppointmentType;
  status: AppointmentStatus;
  patient?: {
    firstName: string;
    lastName: string;
  };
};
const AppointmentCard = ({
  endDate,
  startDate,
  status,
  visitType,
  className,
  patient,
}: IAppointmentCardProps): JSX.Element => {
  const day = (startDate.getDay() + (DAYS_IN_WEEK - 1)) % DAYS_IN_WEEK;

  const hour = startDate.getHours() + startDate.getMinutes() / MINUTES_IN_HOUR;
  const duration =
    (endDate.getTime() - startDate.getTime()) /
    MILLISECONDS_IN_SECOND /
    MINUTES_IN_HOUR /
    SECONDS_IN_MINUTE;

  const height = 60 * duration;

  return (
    <div
      style={{
        height,
        top: 40 + hour * 60,
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
    >
      <div className="flex flex-row items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold">
            {visitType === AppointmentType.Visit ? 'Visit' : 'Virtual'}
          </p>
          <p className="text-xs font-medium text-gray-500">
            {moment(startDate).format('LT')} - {moment(endDate).format('LT')}
          </p>
        </div>
        {visitType === AppointmentType.Virtual ? <Video /> : <House className="h-4 w-4" />}
      </div>
      {patient && (
        <div className={cn('flex flex-row items-center gap-2', height < 101 && 'hidden')}>
          <AvatarComp name="Theta" />
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
