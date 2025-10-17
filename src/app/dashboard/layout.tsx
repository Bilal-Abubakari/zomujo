'use client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { JSX, ReactNode, useState, useEffect } from 'react';
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
import { IDoctor } from '@/types/doctor.interface';
import { useRouter } from 'next/navigation';
import { PaymentTab } from '@/hooks/useQueryParam';
import { AcceptDeclineStatus } from '@/types/shared.enum';
import {
  ActionButtons,
  CheckboxSection,
  InfoCard,
} from '@/app/dashboard/_components/onboardingGuide';

export default function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
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
    const hasProfileInfo =
      !!doctorExtra.experience &&
      doctorExtra.education &&
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
    router.push('/dashboard/settings/availability');
    handleDismissOnboarding();
  };

  const OnboardingModalContent = (): JSX.Element => {
    if (!extra) {
      return <div></div>;
    }

    const doctorStatus = extra.status;
    const { isComplete } = getProfileCompletionStatus(extra);

    // Scenario 1: Pending doctor with incomplete profile
    if (doctorStatus === AcceptDeclineStatus.Pending && !isComplete) {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">Welcome to Zomujo!</h2>
            <p className="text-sm text-gray-600">
              Get ready to start receiving patient bookings by completing these important steps.
            </p>
          </div>

          <div className="space-y-4">
            <InfoCard
              icon="1"
              title="Account Verification"
              description="Your account is currently pending verification based on the information you submitted. Once approved by our admin team, patients will be able to start booking appointments with you."
              bgColor="border-yellow-200 bg-yellow-50"
              textColor="text-yellow-800"
            />
            <InfoCard
              icon="2"
              title="Complete Your Profile"
              description="While waiting for verification, you can complete your profile to be fully ready for bookings. This includes adding your experience, education, specializations, consultation fees, payment methods, and availability slots."
              bgColor="border-blue-200 bg-blue-50"
              textColor="text-blue-800"
            />
          </div>

          <CheckboxSection
            dontShowAgain={dontShowAgain}
            setDontShowAgain={(value) => setDontShowAgain(value)}
          />
          <ActionButtons
            handleDismissOnboarding={handleDismissOnboarding}
            handleCompleteProfileClick={handleCompleteProfileClick}
          />
        </div>
      );
    }

    // Scenario 2: Accepted doctor with incomplete profile
    if (doctorStatus === AcceptDeclineStatus.Accepted && !isComplete) {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">🎉 Account Approved!</h2>
            <p className="text-sm text-gray-600">
              Great news! Your account has been verified and approved by our admin team.
            </p>
          </div>

          <div className="space-y-4">
            <InfoCard
              icon="✓"
              title="Account Verified"
              description="Your account has been successfully verified! You're almost ready to start receiving patient bookings."
              bgColor="border-green-200 bg-green-50"
              textColor="text-green-800"
            />
            <InfoCard
              icon="!"
              title="Complete Your Profile"
              description="To start receiving bookings, please complete your profile by adding your experience, education, specializations, consultation fees, payment methods, and availability slots."
              bgColor="border-blue-200 bg-blue-50"
              textColor="text-blue-800"
            />
          </div>

          <CheckboxSection
            dontShowAgain={dontShowAgain}
            setDontShowAgain={(value) => setDontShowAgain(value)}
          />
          <ActionButtons
            handleDismissOnboarding={handleDismissOnboarding}
            handleCompleteProfileClick={handleCompleteProfileClick}
          />
        </div>
      );
    }

    // TODO: Difficult to handle this third scenario hence will handle later
    // Scenario 3: Accepted doctor with complete profile
    // if (doctorStatus === AcceptDeclineStatus.Accepted && isComplete) {
    //   return (
    //     <div className="space-y-6">
    //       <div className="space-y-2">
    //         <h2 className="text-xl font-semibold text-gray-900">🎉 You&#39;re All Set!</h2>
    //         <p className="text-sm text-gray-600">
    //           Congratulations! Your account is verified and your profile is complete.
    //         </p>
    //       </div>
    //
    //       <div className="space-y-4">
    //         <InfoCard
    //           icon="✓"
    //           title="Profile Complete & Approved"
    //           description="Excellent! You have successfully completed your profile setup and your account has been approved by our admin team."
    //           bgColor="border-green-200 bg-green-50"
    //           textColor="text-green-800"
    //         />
    //         <InfoCard
    //           icon="⏳"
    //           title="Setting Up Your Availability"
    //           description="We are currently setting up your appointment slots based on the availability pattern you provided. This process will be completed shortly, and you should expect to receive patient bookings soon."
    //           bgColor="border-blue-200 bg-blue-50"
    //           textColor="text-blue-800"
    //         />
    //       </div>
    //
    //       <ActionButtons
    //         showCompleteProfile={false}
    //         handleDismissOnboarding={() => handleDismissOnboarding(true)}
    //         handleCompleteProfileClick={handleCompleteProfileClick}
    //       />
    //     </div>
    //   );
    // }

    return <div></div>;
  };

  return (
    <>
      <Modal open={patientMustUpdateMandatoryInfo} content={<UpdatePatientInfo />} />
      <Modal className="max-w-xl" open={mustUpdatePassword} content={<UpdatePassword />} />
      <Modal className="max-w-2xl" open={modalOpen} content={<OnboardingModalContent />} />
      <DashboardProvider>
        <SidebarProvider>
          <SidebarLayout />
          <main className="bg-grayscale-100 me:border flex h-screen flex-1 flex-col overflow-hidden px-4 2xl:px-6">
            <Toolbar />
            <div className="flex-1 overflow-auto">{children}</div>
          </main>
        </SidebarProvider>
      </DashboardProvider>
      <NotificationActions />
    </>
  );
}
