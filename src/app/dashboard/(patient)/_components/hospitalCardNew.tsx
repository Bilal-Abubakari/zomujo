'use client';
import { MapPin, CalendarCheck, Building2, X, Phone, Mail } from 'lucide-react';
import Image from 'next/image';
import React, { JSX, useState } from 'react';
import { Button } from '@/components/ui/button';
import { IHospitalListItem } from '@/types/hospital.interface';
import { useRouter } from 'next/navigation';
import HospitalAppointmentModal, { HospitalAppointmentFormData } from '@/app/dashboard/(patient)/find-hospitals/_components/hospitalAppointmentModal';
import { useAppDispatch } from '@/lib/hooks';
import { createHospitalAppointment } from '@/lib/features/appointments/appointmentsThunk';
import { toast } from '@/hooks/use-toast';
import { showErrorToast } from '@/lib/utils';

interface HospitalCardProps {
  hospital: IHospitalListItem;
}

const HospitalCard = ({ hospital }: HospitalCardProps): JSX.Element => {
  const [showPreview, setShowPreview] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    id,
    name,
    slug,
    description,
    organizationType,
    hasEmergency,
    telemedicine,
    primaryAddress,
    images,
    mainPhone,
    website,
    mainEmail,
  } = hospital;

  const primaryImage = images && images.length > 0 ? images[0] : null;

  const handleViewDetails = () => {
    if (!slug) {
      console.error('Hospital slug is missing');
      return;
    }
    router.push(`/dashboard/find-hospitals/${slug}`);
  };

  const handleAppointmentSubmit = async (formData: HospitalAppointmentFormData): Promise<void> => {
    const { payload } = await dispatch(
      createHospitalAppointment({
        hospitalId: id,
        name: formData.name,
        telephone: formData.telephone,
        serviceType: formData.serviceType,
        additionalInfo: formData.additionalInfo,
        date: formData.date,
      }),
    );

    if (showErrorToast(payload)) {
      toast(payload);
      throw new Error('Failed to submit appointment request');
    } else {
      toast(payload);
    }
  };

  return (
    <>
      {showPreview && primaryImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute -top-4 -right-4 rounded-full bg-white p-2 shadow-lg"
            >
              <X size={20} />
            </button>
            <Image
              src={primaryImage.url}
              alt={name}
              width={800}
              height={600}
              className="rounded-lg object-contain"
            />
          </div>
        </div>
      )}

      <div className="flex w-full max-w-[360px] shrink-0 flex-col rounded-[14px] border border-gray-200 bg-white">
        {primaryImage ? (
          <div className="relative h-48 w-full cursor-pointer" onClick={() => setShowPreview(true)}>
            <Image
              src={primaryImage.url}
              alt={name}
              fill
              className="rounded-t-[14px] object-cover transition-opacity duration-200 hover:opacity-90"
            />
          </div>
        ) : (
          <div className="bg-primary/10 flex h-48 w-full items-center justify-center rounded-t-[14px] border border-gray-100">
            <Building2 size={48} className="text-primary" />
          </div>
        )}
        <div className="flex flex-col gap-2 p-6">
          <div className="flex flex-col">
            <div className="mb-4 flex w-full flex-col gap-2">
              <p className="text-lg font-bold">{name}</p>
              {primaryAddress && (
                <div className="flex items-center gap-1 text-sm font-medium text-gray-400">
                  <MapPin size={14} />
                  {primaryAddress.city && primaryAddress.state
                    ? `${primaryAddress.city}, ${primaryAddress.state}`
                    : primaryAddress.city || primaryAddress.state || primaryAddress.street}
                </div>
              )}
              {description && <p className="line-clamp-2 text-sm text-gray-600">{description}</p>}
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                  {organizationType}
                </span>
                {hasEmergency && (
                  <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                    Emergency
                  </span>
                )}
                {telemedicine && (
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    Telemedicine
                  </span>
                )}
              </div>
              <hr className="mt-2 w-full" />
            </div>
            {(mainPhone || mainEmail) && (
              <div className="mb-4 flex flex-col gap-2 text-sm text-gray-600">
                {mainPhone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    <span>{mainPhone}</span>
                  </div>
                )}
                {mainEmail && (
                  <div className="flex items-center gap-2">
                    <Mail size={14} />
                    <span>{mainEmail}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-row items-center justify-between">
            <Button variant="secondary" onClick={handleViewDetails} child="View Details" />
            <Button
              onClick={() => setShowAppointmentModal(true)}
              child={
                <>
                  <CalendarCheck size={14} />
                  Book Appointment
                </>
              }
            />
          </div>
        </div>
      </div>
      <HospitalAppointmentModal
        open={showAppointmentModal}
        setOpen={setShowAppointmentModal}
        hospitalId={id}
        hospitalName={name}
        onSubmit={handleAppointmentSubmit}
      />
    </>
  );
};

export default HospitalCard;
