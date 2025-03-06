'use client';
import { MapPin, Navigation, ExternalLink, Building2, X } from 'lucide-react';
import Image from 'next/image';
import React, { JSX, useState } from 'react';
import { Button } from '@/components/ui/button';
import { IHospital } from '@/types/hospital.interface';
import { METERS_TO_KM_FACTOR } from '@/constants/constants';
import { Modal } from '@/components/ui/dialog';
import HospitalPreview from '@/app/dashboard/(patient)/find-doctor/_components/hospitalPreview';
import { openExternalUrls } from '@/lib/utils';

const HospitalCard = (hospital: IHospital): JSX.Element => {
  const [showPreview, setShowPreview] = useState(false);
  const [showHospitalPreview, setShowHospitalPreview] = useState(false);
  const { name, location, gpsLink, specialties, image, distance } = hospital;

  return (
    <>
      <Modal
        open={showHospitalPreview}
        content={<HospitalPreview {...hospital} />}
        className="max-w-screen max-h-screen overflow-y-scroll md:max-h-[90vh] md:max-w-[80vw]"
        setState={setShowHospitalPreview}
        showClose={true}
      />
      {showPreview && image && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute -right-4 -top-4 rounded-full bg-white p-2 shadow-lg"
            >
              <X size={20} />
            </button>
            <Image
              src={image}
              alt={name}
              width={800}
              height={600}
              className="rounded-lg object-contain"
            />
          </div>
        </div>
      )}

      <div className="flex w-full max-w-[360px] shrink-0 flex-col rounded-[14px] border border-gray-200 bg-white">
        {image ? (
          <div className="relative h-48 w-full cursor-pointer" onClick={() => setShowPreview(true)}>
            <Image
              src={image}
              alt={name}
              fill
              className="rounded-t-[14px] object-cover transition-opacity duration-200 hover:opacity-90"
            />
          </div>
        ) : (
          <div className="flex h-48 w-full items-center justify-center rounded-t-[14px] border border-gray-100 bg-primary/10">
            <Building2 size={48} className="text-primary" />
          </div>
        )}
        <div className="flex flex-col gap-2 p-6">
          <div className="flex flex-col">
            <div className="mb-4 flex w-full flex-col gap-2">
              <p className="text-lg font-bold">{name}</p>
              <div className="flex items-center gap-1 text-sm font-medium text-gray-400">
                <MapPin size={14} />
                {location}
              </div>
              <hr className="mt-2 w-full" />
            </div>
            <div className="mb-6 flex flex-col gap-4">
              <div className="shadow-2xs flex h-fit w-fit flex-row items-center gap-1 rounded-full border border-gray-100 px-2 py-1">
                <Navigation size={14} className="text-primary" />
                <p className="text-sm font-medium leading-3">
                  {(distance / METERS_TO_KM_FACTOR).toFixed(1)} km away
                </p>
              </div>
              <div className="flex flex-col gap-4">
                {specialties?.slice(0, 2).map((specialty, index) => (
                  <div key={index} className="flex flex-row items-center gap-1.5">
                    <div className="h-[5px] w-[5px] rounded-full bg-primary"></div>
                    <p className="text-sm leading-[14px]">{specialty}</p>
                  </div>
                ))}
                {(specialties?.length || 0) > 2 && (
                  <p className="text-sm text-gray-400">
                    +{(specialties?.length || 0) - 2} more specialities
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <Button
              variant="secondary"
              onClick={() => setShowHospitalPreview(true)}
              child="View Details"
            />
            <Button
              onClick={() => openExternalUrls(gpsLink)}
              child={
                <>
                  <ExternalLink size={14} />
                  Open in Maps
                </>
              }
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default HospitalCard;
