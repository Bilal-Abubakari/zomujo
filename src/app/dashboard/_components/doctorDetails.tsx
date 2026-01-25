'use client';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { GraduationCap } from 'lucide-react';
import { IDoctor } from '@/types/doctor.interface';
import React, { JSX, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { doctorInfo } from '@/lib/features/doctors/doctorsThunk';
import { showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useAppDispatch } from '@/lib/hooks';

type DoctorDetailsProps = {
  showBookmark?: boolean;
  doctorId: string;
  bookAppointmentHandler?: () => void;
};

const DoctorDetails = ({
  showBookmark,
  doctorId,
  bookAppointmentHandler,
}: DoctorDetailsProps): JSX.Element | null => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [doctor, setDoctor] = useState<IDoctor | null>(null);

  useEffect(() => {
    async function getDoctorDetails(): Promise<void> {
      setIsLoading(true);
      try {
        const { payload } = await dispatch(doctorInfo(doctorId));
        if (payload && showErrorToast(payload)) {
          toast(payload);
          return;
        }
        setDoctor(payload as IDoctor);
      } finally {
        setIsLoading(false);
      }
    }
    if (doctorId) {
      void getDoctorDetails();
    } else {
      setDoctor(null);
    }
  }, [dispatch, doctorId]);

  if (isLoading) {
    return <p>Loading doctor&apos;s details...</p>;
  }

  if (!doctor) {
    return null;
  }

  const bookAppointment = (): void => {
    bookAppointmentHandler?.();
  };

  return (
    <div className="flex flex-col gap-7.5 md:flex-row">
      <section className="max-w-71">
        <Image
          src={doctor.profilePicture}
          alt="DoctorImage"
          className="h-64.5 w-71 rounded-4xl object-cover"
          width={400}
          height={400}
        />

        <div className="mt-9.5 flex flex-col">
          <p className="text-primary-dark text-base font-bold md:text-lg">
            GHs {doctor.fee?.amount}
          </p>
          <p className="text-md font-medium text-gray-500">per consultation</p>
        </div>
      </section>
      <section className="w-full">
        <div>
          <p className="text-2xl font-bold">
            Dr. {doctor.firstName} {doctor.lastName}
          </p>
          <div className="flex justify-between">
            <p className="mt-4 font-medium text-gray-500"> {doctor.MDCRegistration}</p>
            {showBookmark && <Button child="Book Appointment" onClick={() => bookAppointment()} />}
          </div>
          {doctor.experience > 0 && (
            <div className="mt-8 flex gap-6 font-semibold">
              <p> 💼 {doctor.experience} years of experience</p>
              {/*/!*<p>🤩 200+ Consultations</p>*!/ TODO: Bring once consultation statistics is ready*/}
            </div>
          )}
        </div>
        <div className="mt-6 flex-wrap">
          {doctor.specializations.map((specialization) => (
            <Badge variant={'gray'} key={specialization} className="mr-2 mb-2">
              {specialization}
            </Badge>
          ))}
        </div>

        <div>
          <hr className="my-8" />
          {doctor.bio && (
            <div>
              <h3 className="text-xl font-bold">About</h3>
              <p className="mt-6 text-gray-500">{doctor.bio}</p>
            </div>
          )}
          {doctor.education && (
            <div>
              <h3 className="mt-12 text-xl font-bold">Education</h3>
              <EducationCard {...doctor.education} />
            </div>
          )}

          {doctor.languages.length > 0 && (
            <div>
              <h3 className="mt-12 text-xl font-bold">Language</h3>
              <div className="mt-5 flex gap-2">
                {doctor.languages.map((language) => (
                  <Badge variant={'blue'} key={language}>
                    {language}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {doctor.awards.length > 0 && (
            <div>
              <h3 className="mt-12 mb-5 text-xl font-bold">Awards</h3>
              {doctor.awards.map((award) => (
                <Badge variant={'destructive'} key={award}>
                  {award}
                </Badge>
              ))}
            </div>
          )}
        </div>
        {doctor.IDs && (
          <div className="mt-5">
            <h3 className="mt-12 mb-5 text-xl font-bold">Identification Card</h3>
            <div className="flex flex-wrap gap-4">
              <Image
                src={doctor.IDs.front}
                alt="front Id"
                width={409}
                height={244}
                className="h-61 w-102.25 rounded-lg object-cover"
              />
              <Image
                src={doctor.IDs.back}
                alt="back Id"
                width={409}
                height={244}
                className="h-61 w-102.25 rounded-lg object-cover"
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default DoctorDetails;
const EducationCard = ({ school, degree }: { school: string; degree: string }): JSX.Element => (
  <div className="mt-6 flex items-center justify-start gap-3">
    <div className="bg-light-orange flex h-8.75 w-8.75 items-center justify-center rounded-[6.74px]">
      <GraduationCap className="text-deep-orange" />
    </div>
    <div>
      <h4 className="font-medium text-gray-600">{degree}</h4>
      <p className="flex text-sm text-gray-500">{school}</p>
    </div>
  </div>
);
