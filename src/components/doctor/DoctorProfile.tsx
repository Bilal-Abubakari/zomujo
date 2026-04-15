import { Button } from '@/components/ui/button';
import {
  Award,
  BookOpen,
  ClipboardClock,
  GraduationCap,
  IdCard,
  Languages,
  Mail,
  Medal,
  Phone,
  Stethoscope,
} from 'lucide-react';
import { capitalize, pesewasToGhc, showErrorToast } from '@/lib/utils';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import React, { JSX, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectUser } from '@/lib/features/auth/authSelector';
import { IDoctor } from '@/types/doctor.interface';
import { Toast, toast } from '@/hooks/use-toast';
import BookingModals from '@/components/doctor/BookingModals';
import { useBookingFlow } from '@/hooks/useBookingFlow';
import { doctorInfo as getDoctorInfo } from '@/lib/features/doctors/doctorsThunk';
import Loading from '@/components/loadingOverlay/loading';

type DoctorProfileProps = {
  ctaLabel: string | null;
  doctorId: string;
  doctor?: IDoctor;
  showContactInfo?: boolean;
};
export const DoctorProfile = ({
  doctor,
  doctorId,
  ctaLabel,
  showContactInfo,
}: DoctorProfileProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const [doctorData, setDoctorData] = useState<IDoctor | null>(null);
  const user = useAppSelector(selectUser);
  const doctorInfo = useMemo(() => doctor ?? doctorData, [doctor, doctorData]);
  const fullName = useMemo(
    () => (doctorInfo ? `${doctorInfo.firstName} ${doctorInfo.lastName}` : ''),
    [doctorInfo],
  );

  const {
    showSlots,
    setShowSlots,
    showPreview,
    setShowPreview,
    isInitiatingPayment,
    register,
    setValue,
    watch,
    handleContinueBooking,
    handleConfirmAndPay,
  } = useBookingFlow({ doctorId, fullName });

  useEffect(() => {
    async function getDoctorDetails(): Promise<void> {
      const payload = await dispatch(getDoctorInfo(doctorId)).unwrap();
      if (payload && showErrorToast(payload)) {
        toast(payload as Toast);
        return;
      }
      setDoctorData(payload as IDoctor);
    }
    if (!doctor) {
      void getDoctorDetails();
    }
  }, [dispatch, doctorId]);

  return doctorInfo ? (
    <>
      <div className="overflow-hidden rounded-2xl shadow-lg">
        {/* Image fills full width */}
        <div className="relative mt-3 w-full" style={{ height: '480px' }}>
          {doctorInfo.profilePicture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={doctorInfo.profilePicture}
              alt={`Dr. ${fullName}`}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, #1e3a5f 0%, #0f6e6e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '8rem', fontWeight: 900, color: 'rgba(255,255,255,0.2)' }}>
                {doctorInfo.firstName[0]}
                {doctorInfo.lastName[0]}
              </span>
            </div>
          )}

          {/* Strong gradient overlay from bottom */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)',
            }}
          />

          {/* Book Appointment — top right */}
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
            {ctaLabel && (
              <Button
                onClick={() => setShowSlots(true)}
                child={
                  <span className="flex items-center gap-2">
                    {user ? null : <ClipboardClock size={16} />}
                    {ctaLabel}
                  </span>
                }
                className="rounded-full px-5 py-2 text-sm font-bold shadow-xl hover:bg-gray-100"
              />
            )}
          </div>

          {/* Doctor info — anchored to the bottom */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              padding: '2rem 2rem 1.75rem',
            }}
          >
            {/* Name */}
            <h1
              style={{
                fontSize: 'clamp(1.75rem, 5vw, 3rem)',
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: '#FFD166',
                textShadow: '0 2px 12px rgba(0,0,0,0.8)',
                margin: 0,
              }}
            >
              Dr. {fullName}
            </h1>

            {/* Specializations */}
            {doctorInfo.specializations?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {doctorInfo.specializations.map((s) => (
                  <span
                    key={s}
                    style={{
                      background: 'rgba(255,209,102,0.18)',
                      border: '1px solid rgba(255,209,102,0.4)',
                      color: '#FFD166',
                      borderRadius: '999px',
                      padding: '2px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {capitalize(s)}
                  </span>
                ))}
              </div>
            )}

            {/* Stats row */}
            <div
              className="mt-3 flex flex-wrap gap-4 text-sm"
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
              {(doctorInfo.experience || 0) > 0 && (
                <span className="flex items-center gap-1.5">
                  <Stethoscope size={14} />
                  {doctorInfo.experience} yrs experience
                </span>
              )}
              {doctorInfo.consultationCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <Medal size={14} />
                  {doctorInfo.consultationCount}+ consultations
                </span>
              )}
            </div>

            {/* Fee */}
            {doctorInfo.fee && (
              <div
                className="mt-3 inline-flex flex-col rounded-xl px-4 py-2"
                style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
              >
                <span
                  style={{
                    fontSize: '0.625rem',
                    color: 'rgba(255,255,255,0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Consultation Fee
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                  GHs {pesewasToGhc(doctorInfo.fee)}
                </span>
                <span style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.5)' }}>
                  per session
                </span>
              </div>
            )}

            {!user && (
              <p className="mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Don&apos;t have an account?{' '}
                <Link href={`/sign-up?redirect=/doctor/${doctorId}`} className="underline">
                  Sign up free
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Body — bio, education, etc. */}
        <div className="flex flex-col gap-6 bg-white px-5 py-8 sm:px-6">
          {showContactInfo && (doctorInfo.email || doctorInfo.contact || doctorInfo.MDCRegistration) && (
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
                Contact Information
              </h3>
              <div className="flex flex-col gap-2">
                {doctorInfo.MDCRegistration && (
                  <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <div className="bg-light-orange flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                      <IdCard size={18} className="text-deep-orange" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">MDC Registration</p>
                      <p className="text-sm text-gray-800">{doctorInfo.MDCRegistration}</p>
                    </div>
                  </div>
                )}
                {doctorInfo.email && (
                  <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <div className="bg-light-orange flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                      <Mail size={18} className="text-deep-orange" />
                    </div>
                    <p className="text-sm text-gray-800">{doctorInfo.email}</p>
                  </div>
                )}
                {doctorInfo.contact && (
                  <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <div className="bg-light-orange flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                      <Phone size={18} className="text-deep-orange" />
                    </div>
                    <p className="text-sm text-gray-800">{doctorInfo.contact}</p>
                  </div>
                )}
              </div>
            </section>
          )}
          {doctorInfo.bio && (
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
                <BookOpen size={16} className="text-primary-500" /> About
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">{doctorInfo.bio}</p>
            </section>
          )}

          {doctorInfo.education && (
            <>
              <Separator />
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
                  <GraduationCap size={16} className="text-primary-500" /> Education
                </h3>
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <div className="bg-light-orange flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    <GraduationCap size={18} className="text-deep-orange" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {doctorInfo.education.degree}
                    </p>
                    <p className="text-xs text-gray-500">{doctorInfo.education.school}</p>
                  </div>
                </div>
              </section>
            </>
          )}

          {doctorInfo.languages?.length > 0 && (
            <>
              <Separator />
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
                  <Languages size={16} className="text-primary-500" /> Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {doctorInfo.languages.map((lang) => (
                    <Badge variant="blue" key={lang}>
                      {lang}
                    </Badge>
                  ))}
                </div>
              </section>
            </>
          )}

          {doctorInfo.awards?.length > 0 && (
            <>
              <Separator />
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
                  <Award size={16} className="text-primary-500" /> Awards
                </h3>
                <div className="flex flex-wrap gap-2">
                  {doctorInfo.awards.map((award) => (
                    <Badge variant="destructive" key={award}>
                      {award}
                    </Badge>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
      <BookingModals
        showSlots={showSlots}
        setShowSlots={setShowSlots}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        isInitiatingPayment={isInitiatingPayment}
        doctor={doctorInfo}
        doctorId={doctorId}
        register={register}
        setValue={setValue}
        watch={watch}
        handleContinueBooking={handleContinueBooking}
        handleConfirmAndPay={handleConfirmAndPay}
      />
    </>
  ) : (
    <Loading message="Loading doctor details..." />
  );
};
