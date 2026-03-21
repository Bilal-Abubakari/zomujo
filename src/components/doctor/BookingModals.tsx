'use client';

import React, { Dispatch, JSX, SetStateAction } from 'react';
import { Modal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AvailableDates from '@/app/dashboard/(patient)/book-appointment/[appointment]/_component/availableDates';
import { AvatarComp } from '@/components/ui/avatar';
import { capitalize } from '@/lib/utils';
import moment from 'moment';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, Medal } from 'lucide-react';
import { IDoctor } from '@/types/doctor.interface';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { IBookingForm } from '@/types/booking.interface';

interface BookingModalsProps {
  showSlots: boolean;
  setShowSlots: Dispatch<SetStateAction<boolean>>;
  showPreview: boolean;
  setShowPreview: Dispatch<SetStateAction<boolean>>;
  isInitiatingPayment: boolean;
  doctor: IDoctor | null;
  doctorId: string;
  register: UseFormRegister<IBookingForm>;
  setValue: UseFormSetValue<IBookingForm>;
  watch: UseFormWatch<IBookingForm>;
  handleContinueBooking: () => void;
  handleConfirmAndPay: () => void;
}

export default function BookingModals({
  showSlots,
  setShowSlots,
  showPreview,
  setShowPreview,
  isInitiatingPayment,
  doctor,
  doctorId,
  register,
  setValue,
  watch,
  handleContinueBooking,
  handleConfirmAndPay,
}: Readonly<BookingModalsProps>): JSX.Element {
  const fullName = doctor ? `${doctor.firstName} ${doctor.lastName}` : '';

  return (
    <>
      {/* ── Slot Selection Modal ───────────────────────────── */}
      <Modal
        className="max-h-[95vh] max-w-xl overflow-y-auto p-5"
        setState={setShowSlots}
        open={showSlots}
        content={
          <div className="mt-5">
            <div className="flex gap-4">
              <AvatarComp imageSrc={doctor?.profilePicture} name={fullName} className="h-20 w-20" />
              <div>
                <h2 className="text-lg font-bold text-gray-900 md:text-xl">Dr. {fullName}</h2>
                <p className="text-primary-600 text-sm font-medium md:text-base">
                  {doctor?.specializations.length
                    ? capitalize(doctor.specializations[0])
                    : 'General Practitioner'}
                </p>
                <p className="text-sm md:text-base">
                  {doctor?.experience ?? 1} year(s) experience &#8226;{' '}
                  {doctor?.consultationCount ?? 0}{' '}
                  {doctor?.consultationCount === 1 ? 'consultation' : 'consultations'}
                </p>
              </div>
            </div>
            <div className="mt-8">
              <span className="text-base font-semibold md:text-lg">Available Appointments</span>
              <div className="mt-4 max-h-[45vh] overflow-y-auto">
                <AvailableDates
                  doctorId={doctorId}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                />
              </div>
            </div>
          </div>
        }
        footer={
          <div className="mt-4 ml-auto flex justify-end gap-x-4">
            <Button
              onClick={() => setShowSlots(false)}
              variant="outline"
              className="mr-3"
              child="Close"
              disabled={isInitiatingPayment}
            />
            <Button
              onClick={handleContinueBooking}
              child="Continue"
              disabled={!watch('slotId') || isInitiatingPayment}
            />
          </div>
        }
        title="Book an appointment"
        showClose={true}
      />

      {/* ── Appointment Preview / Payment Modal ───────────── */}
      <Modal
        className="max-h-[95vh] max-w-xl overflow-y-auto p-5"
        setState={(value) => {
          if (!isInitiatingPayment) {
            setShowPreview(value);
          }
        }}
        open={showPreview}
        content={
          <div className="mt-5">
            {isInitiatingPayment && (
              <div className="mb-4 flex items-center justify-center rounded-lg bg-blue-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  <p className="text-sm font-medium text-blue-700">
                    Processing payment... Redirecting to Payment Service
                  </p>
                </div>
              </div>
            )}
            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Appointment Preview</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <AvatarComp
                    imageSrc={doctor?.profilePicture}
                    name={fullName}
                    className="h-16 w-16"
                  />
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900">Dr. {fullName}</h2>
                    <p className="text-primary-600 text-sm font-medium">
                      {doctor?.specializations.length
                        ? capitalize(doctor.specializations[0])
                        : 'General Practitioner'}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {doctor?.experience ?? 1} year(s) experience &#8226;{' '}
                      {doctor?.consultationCount ?? 0} consultations
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar size={20} className="text-primary-500" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Appointment Date</p>
                        <p className="text-base font-semibold text-gray-900">
                          {watch('date')
                            ? moment(watch('date')).format('dddd, MMMM Do, YYYY')
                            : 'Not selected'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-primary-500" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Appointment Time</p>
                        <p className="text-base font-semibold text-gray-900">
                          {watch('time') || 'Not selected'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Medal size={20} className="text-primary-500" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Session Duration</p>
                        <p className="text-base font-semibold text-gray-900">
                          {doctor?.fee?.lengthOfSession || '45'} minutes
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <label
                  htmlFor="isFollowUp"
                  className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-blue-100 bg-blue-50/50 p-4"
                >
                  <Checkbox
                    id="isFollowUp"
                    checked={watch('isFollowUp')}
                    onCheckedChange={(checked) => setValue('isFollowUp', checked === true)}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <span className="text-sm leading-none font-semibold text-gray-900">
                      This is a follow-up consultation
                    </span>
                    <p className="text-xs text-gray-500">
                      Check this if you have seen Dr. {doctor?.lastName} before for the same health
                      concern.
                    </p>
                  </div>
                </label>

                <div className="border-primary-200 bg-primary-50 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Total Amount</p>
                      <p className="text-primary-600 text-xl font-bold">
                        GHS {doctor?.fee?.amount || '0'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        footer={
          <div className="mt-4 ml-auto flex justify-end gap-x-4">
            <Button
              onClick={() => {
                if (!isInitiatingPayment) {
                  setShowPreview(false);
                  setShowSlots(true);
                }
              }}
              variant="outline"
              child="Back"
              disabled={isInitiatingPayment}
            />
            <Button
              isLoading={isInitiatingPayment}
              onClick={() => handleConfirmAndPay()}
              child="Confirm & Pay"
              disabled={isInitiatingPayment}
            />
          </div>
        }
        title="Confirm Appointment"
        showClose={true}
      />
    </>
  );
}
