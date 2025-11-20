'use client';
import React, { JSX } from 'react';
import { Modal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AvatarComp } from '@/components/ui/avatar';
import { capitalize } from '@/lib/utils';
import AvailableDates from '@/app/dashboard/(patient)/book-appointment/[appointment]/_component/availableDates';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { IBookingForm } from '@/types/booking.interface';

export type SlotSelectionModalProps = {
  open: boolean;
  onCloseAction: () => void;
  onConfirmAction: () => void;
  isLoading: boolean;
  doctorId: string;
  doctorName: string;
  doctorProfilePicture: string;
  specializations?: string[];
  experience?: number;
  noOfConsultations?: number;
  registerAction: UseFormRegister<IBookingForm>;
  setValueAction: UseFormSetValue<IBookingForm>;
  watch: UseFormWatch<IBookingForm>;
  title?: string;
  confirmButtonText?: string;
};

export const SlotSelectionModal = ({
  open,
  onCloseAction,
  onConfirmAction,
  isLoading,
  doctorId,
  doctorName,
  doctorProfilePicture,
  specializations,
  experience,
  noOfConsultations,
  registerAction,
  setValueAction,
  watch,
  title = 'Book an appointment',
  confirmButtonText = 'Continue',
}: SlotSelectionModalProps): JSX.Element => (
  <Modal
    className="max-h-[95vh] max-w-xl overflow-y-auto p-5"
    setState={onCloseAction}
    open={open}
    content={
      <div className="mt-5">
        <div className="flex gap-4">
          <AvatarComp imageSrc={doctorProfilePicture} name={doctorName} className="h-20 w-20" />
          <div>
            <h2 className="text-lg font-bold text-gray-900 md:text-xl">Dr. {doctorName}</h2>
            <p className="text-primary-600 text-sm font-medium md:text-base">
              {specializations ? capitalize(specializations[0]) : 'General Practitioner'}
            </p>
            {(experience || noOfConsultations) && (
              <p className="text-sm md:text-base">
                {experience && `${experience} year(s) experience`}
                {experience && noOfConsultations && ' \u2022 '}
                {noOfConsultations &&
                  `${noOfConsultations} ${noOfConsultations === 1 ? 'consultation' : 'consultations'}`}
              </p>
            )}
          </div>
        </div>
        <div className="mt-8">
          <span className="text-base font-semibold md:text-lg">Available Appointments</span>
          <div className="mt-4 max-h-[45vh] overflow-y-auto">
            <AvailableDates
              doctorId={doctorId}
              register={registerAction}
              setValue={setValueAction}
              watch={watch}
            />
          </div>
        </div>
      </div>
    }
    footer={
      <div className="mt-4 ml-auto flex justify-end gap-x-4">
        <Button
          onClick={onCloseAction}
          variant="outline"
          className="mr-3"
          child="Close"
          disabled={isLoading}
        />
        <Button
          isLoading={isLoading}
          onClick={onConfirmAction}
          child={confirmButtonText}
          disabled={!watch('slotId') || isLoading}
        />
      </div>
    }
    title={title}
    showClose={true}
  />
);
