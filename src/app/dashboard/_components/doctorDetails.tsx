'use client';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Award, BookOpen, Calendar, GraduationCap, Languages, Stethoscope } from 'lucide-react';
import { IDoctor } from '@/types/doctor.interface';
import React, { JSX, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { doctorInfo } from '@/lib/features/doctors/doctorsThunk';
import { showErrorToast, pesewasToGhc } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useAppDispatch } from '@/lib/hooks';

type DoctorDetailsProps = {
  showBookmark?: boolean;
  doctorId: string;
  doctor?: IDoctor;
  bookAppointmentHandler?: () => void;
};

const DoctorDetails = ({
  showBookmark,
  doctorId,
  doctor: doctorProp,
  bookAppointmentHandler,
}: DoctorDetailsProps): JSX.Element | null => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [doctor, setDoctor] = useState<IDoctor | null>(doctorProp || null);

  useEffect(() => {
    if (doctorProp) {
      setDoctor(doctorProp);
      return;
    }

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
      {/* Hero Section - Full image displayed prominently */}
      <div className="flex flex-col sm:flex-row">
        {/* Doctor full photo */}
        <div className="relative w-full shrink-0 bg-gray-100 sm:min-h-80 sm:w-64">
          {doctor.profilePicture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={doctor.profilePicture}
              alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
              className="h-72 w-full object-contain object-center sm:h-full"
              style={{ backgroundColor: '#f3f4f6' }}
            />
          ) : (
            <div className="from-primary-100 to-primary-200 flex h-72 w-full items-center justify-center bg-linear-to-br sm:h-full">
              <span className="text-primary-600 text-6xl font-extrabold">
                {doctor.firstName[0]}
                {doctor.lastName[0]}
              </span>
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="from-primary-900 to-primary-700 relative flex flex-1 flex-col justify-between bg-linear-to-br p-6 sm:p-8">
          {showBookmark && (
            <div className="flex justify-end">
              <Button
                child="Book Appointment"
                onClick={() => bookAppointment()}
                className="rounded-full px-5 py-2 text-sm font-semibold shadow-lg"
              />
            </div>
          )}

          <div className="mt-4 sm:mt-auto">
            <h2 className="text-2xl font-extrabold text-white drop-shadow sm:text-3xl">
              Dr. {doctor.firstName} {doctor.lastName}
            </h2>
            {doctor.MDCRegistration && (
              <p className="mt-1 text-xs font-medium text-white/70">{doctor.MDCRegistration}</p>
            )}

            {doctor.specializations.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {doctor.specializations.map((s) => (
                  <Badge variant="gray" key={s} className="text-xs">
                    {s}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80">
              {doctor.experience > 0 && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-white/60" />
                  {doctor.experience} yrs experience
                </span>
              )}
              {doctor.consultationCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <Stethoscope size={14} className="text-white/60" />
                  {doctor.consultationCount}+ consultations
                </span>
              )}
            </div>

            {doctor.fee && (
              <div className="mt-4 inline-flex flex-col rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm">
                <span className="text-[10px] font-medium tracking-wide text-white/60 uppercase">
                  Consultation Fee
                </span>
                <span className="mt-0.5 text-xl font-extrabold text-white">GHs {pesewasToGhc(doctor.fee)}</span>
                <span className="text-[10px] text-white/50">per session</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-5 py-8 sm:px-6">
        <div className="min-w-0 flex-1">
          {doctor.specializations.length > 0 && <hr className="mb-6 border-gray-100" />}

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
