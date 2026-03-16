'use client';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Award, BookOpen, Calendar, GraduationCap, Languages, Stethoscope } from 'lucide-react';
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
    <div className="flex flex-col overflow-hidden">
      <div className="relative h-52 w-full shrink-0 overflow-hidden bg-gray-900 sm:h-64">
        {doctor.profilePicture && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={doctor.profilePicture}
            alt=""
            aria-hidden="true"
            className="h-full w-full scale-110 object-cover object-top blur-sm brightness-50"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/70" />

        {showBookmark && (
          <div className="absolute top-4 right-4 z-10">
            <Button
              child="Book Appointment"
              onClick={() => bookAppointment()}
              className="rounded-full px-5 py-2 text-sm font-semibold shadow-lg"
            />
          </div>
        )}

        <div className="absolute -bottom-16 left-1/2 z-10 -translate-x-1/2 sm:left-8 sm:translate-x-0">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-2xl sm:h-36 sm:w-36">
            {doctor.profilePicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={doctor.profilePicture}
                alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <div className="from-primary-100 to-primary-200 flex h-full w-full items-center justify-center bg-linear-to-br">
                <span className="text-primary-600 text-4xl font-extrabold">
                  {doctor.firstName[0]}
                  {doctor.lastName[0]}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center sm:bottom-5 sm:left-52 sm:translate-x-0 sm:text-left">
          <h2 className="text-xl font-extrabold text-white drop-shadow sm:text-2xl">
            Dr. {doctor.firstName} {doctor.lastName}
          </h2>
          {doctor.MDCRegistration && (
            <p className="mt-0.5 text-xs font-medium text-white/70">{doctor.MDCRegistration}</p>
          )}
        </div>
      </div>

      <div className="mt-20 flex flex-col gap-6 px-5 pb-8 sm:mt-8 sm:flex-row sm:gap-8 sm:px-6 sm:pt-2">
        {/* Left sidebar — fee + quick stats */}
        <aside className="flex shrink-0 flex-row flex-wrap gap-3 sm:w-44 sm:flex-col sm:gap-4">
          <div className="flex flex-col rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 shadow-sm">
            <span className="text-[10px] font-medium tracking-wide text-gray-400 uppercase">
              Consultation Fee
            </span>
            <span className="text-primary-dark mt-1 text-xl font-extrabold">
              GHs {doctor.fee?.amount}
            </span>
            <span className="text-xs text-gray-400">per session</span>
          </div>

          {doctor.experience > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 shadow-sm">
              <Calendar size={16} className="text-primary-500 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-800">{doctor.experience} yrs</p>
                <p className="text-[10px] text-gray-400">experience</p>
              </div>
            </div>
          )}

          {doctor.consultationCount > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 shadow-sm">
              <Stethoscope size={16} className="text-primary-500 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-800">{doctor.consultationCount}+</p>
                <p className="text-[10px] text-gray-400">consultations</p>
              </div>
            </div>
          )}
        </aside>

        <div className="min-w-0 flex-1">
          {doctor.specializations.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {doctor.specializations.map((s) => (
                  <Badge variant="gray" key={s} className="text-xs">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <hr className="mb-6 border-gray-100" />

          {doctor.bio && (
            <section className="mb-6">
              <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
                <BookOpen size={16} className="text-primary-500" /> About
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">{doctor.bio}</p>
            </section>
          )}

          {doctor.education && (
            <section className="mb-6">
              <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
                <GraduationCap size={16} className="text-primary-500" /> Education
              </h3>
              <EducationCard {...doctor.education} />
            </section>
          )}

          {doctor.languages.length > 0 && (
            <section className="mb-6">
              <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
                <Languages size={16} className="text-primary-500" /> Languages
              </h3>
              <div className="flex flex-wrap gap-2">
                {doctor.languages.map((language) => (
                  <Badge variant="blue" key={language}>
                    {language}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {doctor.awards.length > 0 && (
            <section className="mb-6">
              <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
                <Award size={16} className="text-primary-500" /> Awards
              </h3>
              <div className="flex flex-wrap gap-2">
                {doctor.awards.map((award) => (
                  <Badge variant="destructive" key={award}>
                    {award}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {doctor.IDs && (
            <section className="mb-2">
              <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
                Identification Card
              </h3>
              <div className="flex flex-wrap gap-4">
                <Image
                  src={doctor.IDs.front}
                  alt="Front ID"
                  width={409}
                  height={244}
                  className="h-auto w-full max-w-xs rounded-xl object-cover shadow"
                />
                <Image
                  src={doctor.IDs.back}
                  alt="Back ID"
                  width={409}
                  height={244}
                  className="h-auto w-full max-w-xs rounded-xl object-cover shadow"
                />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
const EducationCard = ({ school, degree }: { school: string; degree: string }): JSX.Element => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
    <div className="bg-light-orange flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
      <GraduationCap size={18} className="text-deep-orange" />
    </div>
    <div>
      <p className="text-sm font-semibold text-gray-800">{degree}</p>
      <p className="text-xs text-gray-500">{school}</p>
    </div>
  </div>
);
