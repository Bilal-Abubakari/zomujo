'use client';
import { Button } from '@/components/ui/button';
import React, { JSX } from 'react';
import { Badge } from '@/components/ui/badge';
import moment from 'moment';
import { IAppointment } from '@/types/appointment.interface';
import { Calendar, Clock } from 'lucide-react';
import { getInitials } from '@/lib/utils';

export type AppointmentCardProps = {
  request: IAppointment;
  approveRequest: () => void;
  rejectRequest: () => void;
};

const AppointmentRequestCard = ({
  request,
  approveRequest,
  rejectRequest,
}: AppointmentCardProps): JSX.Element => {
  const {
    patient: { firstName, lastName },
    slot: { date, startTime, endTime },
  } = request;

  const formattedDate = moment(date).format('MMM DD, YYYY');
  const timeRange = `${moment(startTime).format('hh:mm A')} - ${moment(endTime).format('hh:mm A')}`;
  const timeAgo = moment(date).fromNow();

  return (
    <div className="group hover:border-primary/30 mt-4 w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between md:flex-col">
        <div className="flex flex-1 items-center gap-3">
          <div className="from-primary to-primary/70 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white shadow-sm sm:h-14 sm:w-14 sm:text-base">
            {getInitials(`${firstName} ${lastName}`)}
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="truncate text-base font-semibold text-gray-900 sm:text-lg">
              {firstName} {lastName}
            </h3>
            <Badge variant={'brown'} className="w-fit">
              <span className="text-xs">New Request</span>
            </Badge>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 self-start rounded-lg bg-gray-50 px-3 py-2 sm:px-3.5 sm:py-2.5">
          <span className="text-xs font-medium text-gray-600 sm:text-sm">{timeAgo}</span>
        </div>
      </div>

      <hr className="my-4 border-gray-100" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:flex-col">
        <div className="flex flex-col gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="text-primary h-4 w-4 shrink-0 sm:h-[18px] sm:w-[18px]" />
            <span className="text-sm font-medium sm:text-base">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="text-primary h-4 w-4 shrink-0 sm:h-[18px] sm:w-[18px]" />
            <span className="text-sm font-medium sm:text-base">{timeRange}</span>
          </div>
        </div>
        <div className="flex flex-row gap-2.5 sm:flex-col sm:gap-2 lg:flex-row">
          <Button
            type="button"
            onClick={() => approveRequest()}
            className="border-primary bg-primary hover:bg-primary/90 h-9 flex-1 border-[1.5px] text-sm font-medium text-white shadow-sm transition-all hover:shadow sm:h-10 sm:min-w-[120px] sm:flex-none sm:text-base"
            child="Accept"
          />
          <Button
            type="button"
            onClick={() => rejectRequest()}
            className="h-9 flex-1 border-[1.5px] border-gray-300 bg-transparent text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 sm:h-10 sm:min-w-[100px] sm:flex-none sm:text-base"
            child="Decline"
          />
        </div>
      </div>
    </div>
  );
};

export default AppointmentRequestCard;
