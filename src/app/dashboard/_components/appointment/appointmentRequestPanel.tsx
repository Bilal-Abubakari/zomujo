'use client';
import React, { JSX, useMemo, useState } from 'react';
import AppointmentRequestCard from './appointmentRequestCard';
import { Badge } from '@/components/ui/badge';
import { Confirmation } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ModalProps } from '@/types/appointment.interface';
import { AppointmentStatus, VisitType } from '@/types/shared.enum';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

const AppointmentRequestPanel = (): JSX.Element => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<ModalProps | undefined>();

  const suggestSmallScreen = useMemo(
    () => (
      <Carousel>
        <CarouselContent className="m-auto">
          <CarouselItem>
            <AppointmentRequestCard
              request={{
                id: 1,
                date: '2025-01-2',
                startTime: '10:00 AM',
                endTime: '12:00 PM',
                slotId: '12345',
                type: VisitType.Virtual,
                patient: {
                  id: 'P001',
                  firstName: 'John',
                  lastName: 'Doe',
                  profilePicture: null,
                },
                reason: 'Blood pressure',
                notes: 'Patient is on medication for hypertension.',
                status: AppointmentStatus.Declined,
              }}
              setShowModal={setOpenModal}
              setSelectedPatient={setSelectedPatient}
            />
          </CarouselItem>
          <CarouselItem>
            <AppointmentRequestCard
              request={{
                id: 1,
                date: '2025-01-2',
                startTime: '10:00 AM',
                endTime: '12:00 PM',
                slotId: '12345',
                type: VisitType.Virtual,
                patient: {
                  id: 'P001',
                  firstName: 'John',
                  lastName: 'Doe',
                  profilePicture: null,
                },
                reason: 'Blood pressure',
                notes: 'Patient is on medication for hypertension.',
                status: AppointmentStatus.Declined,
              }}
              setShowModal={setOpenModal}
              setSelectedPatient={setSelectedPatient}
            />
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    ),
    [],
  );
  return (
    <>
      <Confirmation
        open={openModal}
        description={
          <>
            Are you sure you want to
            <span
              className={cn(
                'px-1',
                selectedPatient?.option == 'Accept' ? 'text-primary' : 'text-error-400',
              )}
            >
              {selectedPatient?.option}
            </span>
            <span className={'pr-1 font-semibold'}>
              {selectedPatient?.patient.firstName} {selectedPatient?.patient.lastName}
            </span>
            request?
          </>
        }
        acceptCommand={() => setOpenModal && setOpenModal(false)}
        rejectCommand={() => setOpenModal && setOpenModal(false)}
      />
      <div className="h-[calc(100vh-203px)] w-full overflow-y-scroll rounded-2xl border bg-white pt-6 max-md:h-[380px]">
        <div className="flex flex-row items-center justify-center gap-2">
          <p className="text-xl font-bold">Appointment Requests</p>
          <Badge variant={'brown'}>5</Badge>
        </div>
        <hr className="mx-6 mt-6 border border-gray-200" />
        <div className="hidden md:block">
          <AppointmentRequestCard
            request={{
              id: 1,
              date: '2025-01-2',
              startTime: '10:00 AM',
              endTime: '12:00 PM',
              slotId: '12345',
              type: VisitType.Virtual,
              patient: {
                id: 'P001',
                firstName: 'John',
                lastName: 'Doe',
                profilePicture: null,
              },
              reason: 'Blood pressure',
              notes: 'Patient is on medication for hypertension.',
              status: AppointmentStatus.Declined,
            }}
            setShowModal={setOpenModal}
            setSelectedPatient={setSelectedPatient}
          />
          <AppointmentRequestCard
            request={{
              id: 2,
              date: '2025-01-10',
              startTime: '12:00 pM',
              endTime: '2:00 PM',
              slotId: '12345',
              type: VisitType.Virtual,
              patient: {
                id: 'P001',
                firstName: 'killer',
                lastName: 'lapopo',
                profilePicture: null,
              },
              reason: 'Cold',
              notes: 'Patient is on medication for hypertension.',
              status: AppointmentStatus.Declined,
            }}
            setShowModal={setOpenModal}
            setSelectedPatient={setSelectedPatient}
          />
          <AppointmentRequestCard
            request={{
              id: 3,
              date: '2025-01-20',
              startTime: '12:00 pM',
              endTime: '2:00 PM',
              slotId: '12345',
              type: VisitType.Virtual,
              patient: {
                id: 'P001',
                firstName: 'killer',
                lastName: 'lapopo',
                profilePicture: null,
              },
              reason: 'Cold',
              notes: 'Patient is on medication for hypertension.',
              status: AppointmentStatus.Declined,
            }}
            setShowModal={setOpenModal}
            setSelectedPatient={setSelectedPatient}
          />
        </div>
        <div className="mx-2 md:hidden">{suggestSmallScreen}</div>
      </div>
    </>
  );
};

export default AppointmentRequestPanel;
