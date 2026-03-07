import {
  DAYS_IN_WEEK,
  MILLISECONDS_IN_SECOND,
  MINUTES_IN_HOUR,
  SECONDS_IN_MINUTE,
} from '@/constants/constants';
import { cn, showErrorToast } from '@/lib/utils';
import { House, Video } from 'lucide-react';
import React, { JSX, useEffect, useRef, useState, RefObject } from 'react';
import moment from 'moment';
import { Role } from '@/types/shared.enum';
import { AppointmentStatus } from '@/types/appointmentStatus.enum';
import { IAppointment } from '@/types/appointment.interface';
import { AppointmentType } from '@/types/slots.interface';
import { mergeDateAndTime } from '@/lib/date';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectUser } from '@/lib/features/auth/authSelector';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { joinConsultation } from '@/lib/features/appointments/consultation/consultationThunk';
import { toast } from '@/hooks/use-toast';

export type CalendarRef = RefObject<HTMLDivElement | null>;

export type IAppointmentCardProps = {
  className?: string;
  appointment: IAppointment;
  handleSelectedCard: () => void;
  showDetails: boolean;
  handleCloseDetails: () => void;
  calendarRef: React.RefObject<HTMLDivElement | null>;
};
const AppointmentCard = ({
  className,
  appointment,
  handleSelectedCard,
  showDetails,
  handleCloseDetails,
  calendarRef,
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
      <button
        style={{
          height,
          top: 40 + hour * 90,
          left: 80 + 260 * day,
        }}
        className={cn(
          'absolute z-8 flex w-64.75 cursor-pointer flex-col justify-between overflow-clip rounded-md border border-[#93C4F0] bg-[#E0EFFE] p-3.5 duration-150 hover:scale-[1.02]',
          height < 101 && 'p-2.5',
          status === AppointmentStatus.Pending && 'border-[#93C4F0] bg-[#E0EFFE]',
          status === AppointmentStatus.Accepted && 'border-green-300 bg-green-100',
          status === AppointmentStatus.Declined && 'border-error-300 bg-error-100',
          className,
        )}
        onClick={() => handleSelectedCard()}
        type="button"
      >
        <div className="flex flex-row items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold">
                {type === AppointmentType.Visit ? 'Visit' : 'Virtual'}
              </p>
              {/*{appointment.isFollowUp && (*/}
              {/*  <Badge variant="blue" className="flex items-center gap-1 px-1.5 py-0.5 text-xs">*/}
              {/*    <CalendarCheck className="h-3 w-3" />*/}
              {/*    Follow-up*/}
              {/*  </Badge>*/}
              {/*)}*/}
            </div>
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
      </button>
      {showDetails && (
        <AppointmentDetails
          {...{ ...appointment, day, hour, handleClose: handleCloseDetails, calendarRef }}
        />
      )}
    </>
  );
};

export default AppointmentCard;

type AppointmentDetails = IAppointment & {
  day: number;
  hour: number;
  handleClose: () => void;
  calendarRef: CalendarRef;
};
const AppointmentDetails = ({
  day,
  hour,
  status,
  patient: { firstName, id: patientId },
  id,
  slot: { date },
  handleClose,
  calendarRef,
}: AppointmentDetails): JSX.Element => {
  const detailsRef = useRef<HTMLDivElement>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dispatch = useAppDispatch();
  const statusStyles: Record<AppointmentStatus, string> = {
    [AppointmentStatus.Pending]: 'border-[#93C4F0] bg-[#E0EFFE]',
    [AppointmentStatus.Accepted]: 'border-green-300 bg-green-100',
    [AppointmentStatus.Declined]: 'border-error-300 bg-error-100',
    [AppointmentStatus.Completed]: 'border-green-300 bg-green-100',
    [AppointmentStatus.Progress]: 'border-yellow-300 bg-yellow-100',
    [AppointmentStatus.Investigating]: 'border-yellow-300 bg-yellow-100',
    [AppointmentStatus.InvestigatingScheduled]: 'border-yellow-300 bg-yellow-100',
    [AppointmentStatus.Cancelled]: 'border-error-300 bg-error-100',
    [AppointmentStatus.Incomplete]: 'border-gray-300 bg-gray-100',
  };

  const user = useAppSelector(selectUser);
  const isDoctor = user?.role === Role.Doctor;
  const isPatient = user?.role === Role.Patient;
  const router = useRouter();

  // Calculate optimal position based on viewport space
  useEffect(() => {
    const calculatePosition = (): void => {
      if (!calendarRef.current) {
        return;
      }

      const POPUP_WIDTH = 350; // w-87.5 = 350px
      const POPUP_HEIGHT = 300; // Estimated height
      const CARD_WIDTH = 259; // w-64.75 = 259px
      const GAP = 10; // Gap between card and popup

      // Calculate card position relative to calendar
      const cardLeftRelative = 80 + 260 * day;
      const cardTopRelative = 40 + hour * 90;

      // Get calendar position on viewport
      const calendarRect = calendarRef.current.getBoundingClientRect();
      const scrollTop = calendarRef.current.scrollTop;
      const scrollLeft = calendarRef.current.scrollLeft;

      // Card position in viewport
      const cardLeftViewport = calendarRect.left + cardLeftRelative - scrollLeft;
      const cardTopViewport = calendarRect.top + cardTopRelative - scrollTop;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left: number;
      let top = cardTopViewport;

      // Try to position to the right of the card first
      const rightPosition = cardLeftViewport + CARD_WIDTH + GAP;
      if (rightPosition + POPUP_WIDTH <= viewportWidth - 20) {
        left = rightPosition;
      }
      // Try to position to the left of the card
      else if (cardLeftViewport - POPUP_WIDTH - GAP >= 20) {
        left = cardLeftViewport - POPUP_WIDTH - GAP;
      }
      // Position at right edge if card is too far left
      else if (cardLeftViewport < viewportWidth / 2) {
        left = Math.min(rightPosition, viewportWidth - POPUP_WIDTH - 20);
      }
      // Position at left edge if card is too far right
      else {
        left = Math.max(20, cardLeftViewport - POPUP_WIDTH - GAP);
      }

      // Adjust vertical position to keep popup in viewport
      const bottomPosition = cardTopViewport + POPUP_HEIGHT;
      if (bottomPosition > viewportHeight - 20) {
        // If popup would go below viewport, align it to bottom with margin
        top = Math.max(20, viewportHeight - POPUP_HEIGHT - 20);
      } else if (cardTopViewport < 20) {
        top = 20;
      }

      left = Math.max(20, Math.min(left, viewportWidth - POPUP_WIDTH - 20));

      setPosition({ top, left });
    };

    calculatePosition();

    // Recalculate on window resize
    window.addEventListener('resize', calculatePosition);
    return (): void => {
      window.removeEventListener('resize', calculatePosition);
    };
  }, [day, hour, calendarRef]);

  const redirectToPatient = (): void => {
    router.push(`/dashboard/patients/${patientId}?appointmentId=${id}`);
  };

  const redirectToConsultation = (): void => {
    router.push(`/dashboard/consultation-patient/${id}`);
  };

  const handleJoinMeeting = async (): Promise<void> => {
    setIsJoining(true);

    const { payload } = await dispatch(joinConsultation(id));

    if (payload && showErrorToast(payload)) {
      toast(payload);
      setIsJoining(false);
      return;
    }

    const meetingLink = payload as string;
    if (meetingLink) {
      window.open(meetingLink, '_blank', 'noopener,noreferrer');
    }

    setIsJoining(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClose]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return (): void => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [handleClose]);

  return (
    <div
      ref={detailsRef}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      className={`fixed z-50 w-87.5 rounded-lg border-2 p-4 shadow-xl ${statusStyles[status]}`}
    >
      <p className="mb-2 text-lg font-semibold">Meeting with {firstName}</p>

      <Button
        child="Join Meeting"
        onClick={handleJoinMeeting}
        isLoading={isJoining}
        disabled={isJoining}
        className={`rounded-full border border-black bg-black px-4 py-2 text-white transition duration-300 hover:bg-green-600 hover:text-white`}
      />
      <div className="my-4 border-t border-b border-current"></div>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-semibold">Date:</span>
        <span className="text-sm">{moment(date).format('dddd, LL')}</span>
      </div>
      <div className="mt-4 flex justify-center">
        {isDoctor && (
          <Button
            child={'View Patient Record'}
            className="rounded-full border-2 border-black bg-black px-6 py-2 text-white transition duration-300 hover:bg-green-700"
            onClick={() => redirectToPatient()}
          />
        )}
        {isPatient && (
          <Button
            child={'View Consultation'}
            className="rounded-full border-2 border-black bg-black px-6 py-2 text-white transition duration-300 hover:bg-green-700"
            onClick={() => redirectToConsultation()}
          />
        )}
      </div>
    </div>
  );
};
