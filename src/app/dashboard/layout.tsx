'use client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { JSX, ReactNode, useState, useEffect, useRef } from 'react';
import { SidebarLayout } from './_components/sidebar/sidebarLayout';
import Toolbar from '@/app/dashboard/_components/toolbar';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import {
  selectMustUpdatePassword,
  selectPatientMustUpdateMandatoryInfo,
  selectShouldShowDoctorOnboardingModal,
  selectExtra,
} from '@/lib/features/auth/authSelector';
import { dismissOnboardingModal } from '@/lib/features/auth/authSlice';
import { DashboardProvider } from '@/app/dashboard/_components/providers/dashboardProvider';
import { Modal } from '@/components/ui/dialog';
import UpdatePassword from '@/app/dashboard/_components/updatePassword';
import NotificationActions from '@/app/dashboard/_components/notificationActions';
import UpdatePatientInfo from '@/app/dashboard/(patient)/_components/updatePatientInfo';
import ReviewModal from '@/app/dashboard/_components/reviewModal';
import { IDoctor } from '@/types/doctor.interface';
import { useRouter } from 'next/navigation';
import { PaymentTab } from '@/hooks/useQueryParam';
import { ScrollContext } from '@/context/scroll-context';
import OnboardingModalContent from '@/app/dashboard/_components/onboardingModalContent';

export default function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const mustUpdatePassword = useAppSelector(selectMustUpdatePassword);
  const patientMustUpdateMandatoryInfo = useAppSelector(selectPatientMustUpdateMandatoryInfo);
  const shouldShowOnboardingModal = useAppSelector(selectShouldShowDoctorOnboardingModal);
  const extra = useAppSelector(selectExtra) as IDoctor;
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setModalOpen(shouldShowOnboardingModal);
  }, [shouldShowOnboardingModal]);

  const getProfileCompletionStatus = (
    doctorExtra: IDoctor,
  ): {
    hasProfileInfo: boolean;
    hasFee: boolean;
    hasPayment: boolean;
    hasSlots: boolean;
    isComplete: boolean;
  } => {
    if (!doctorExtra) {
      return {
        hasProfileInfo: false,
        hasFee: false,
        hasPayment: false,
        hasSlots: false,
        isComplete: false,
      };
    }
    const hasProfileInfo =
      !!doctorExtra.experience &&
      doctorExtra.specializations?.length > 0 &&
      doctorExtra.languages?.length > 0 &&
      !!doctorExtra.bio;

    return {
      hasProfileInfo,
      hasFee: !!doctorExtra.fee,
      hasPayment: doctorExtra.hasDefaultPayment,
      hasSlots: doctorExtra.hasSlot,
      isComplete:
        hasProfileInfo && !!doctorExtra.fee && doctorExtra.hasDefaultPayment && doctorExtra.hasSlot,
    };
  };

  const handleDismissOnboarding = (dismiss?: boolean): void => {
    if (dontShowAgain || dismiss) {
      dispatch(dismissOnboardingModal());
    }
    setModalOpen(false);
  };

  const handleCompleteProfileClick = (): void => {
    if (!extra) {
      return;
    }

    const { hasProfileInfo, hasFee, hasPayment } = getProfileCompletionStatus(extra);

    if (!hasProfileInfo) {
      router.push('/dashboard/settings');
      handleDismissOnboarding();
      return;
    }
    if (!hasFee) {
      router.push(`/dashboard/settings/payment?tab=${PaymentTab.Pricing}`);
      handleDismissOnboarding();
      return;
    }
    if (!hasPayment) {
      router.push(`/dashboard/settings/payment?tab=${PaymentTab.PaymentMethod}`);
      handleDismissOnboarding();
      return;
    }

    // If all previous steps are complete, go to availability
    router.push('/dashboard/availability');
    handleDismissOnboarding();
  };

  return (
    <ScrollContext.Provider value={scrollContainerRef}>
      <Modal open={patientMustUpdateMandatoryInfo} content={<UpdatePatientInfo />} />
      <Modal className="max-w-xl" open={mustUpdatePassword} content={<UpdatePassword />} />
      <Modal
        className="max-w-2xl"
        open={modalOpen}
        content={
          <OnboardingModalContent
            extra={extra}
            isComplete={getProfileCompletionStatus(extra).isComplete}
            dontShowAgain={dontShowAgain}
            setDontShowAgain={setDontShowAgain}
            handleDismissOnboarding={handleDismissOnboarding}
            handleCompleteProfileClick={handleCompleteProfileClick}
          />
        }
      />
      <DashboardProvider>
        <SidebarProvider>
          <SidebarLayout />
          <main className="bg-grayscale-100 me:border flex h-screen flex-1 flex-col overflow-hidden px-4 2xl:px-6">
            <Toolbar />
            <div ref={scrollContainerRef} className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </SidebarProvider>
      </DashboardProvider>
      <NotificationActions />
      <ReviewModal />
    </ScrollContext.Provider>
  );
}
