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
import { DashboardProvider } from '@/app/dashboard/_components/dashboardProvider';
import { Modal } from '@/components/ui/dialog';
import UpdatePassword from '@/app/dashboard/_components/updatePassword';
import NotificationActions from '@/app/dashboard/_components/notificationActions';
import UpdatePatientInfo from '@/app/dashboard/(patient)/_components/updatePatientInfo';
import { IDoctor } from '@/types/doctor.interface';
import { useRouter } from 'next/navigation';
import { PaymentTab } from '@/hooks/useQueryParam';
import { AcceptDeclineStatus } from '@/types/shared.enum';

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
  ): { hasProfileInfo: boolean; hasFee: boolean; hasPayment: boolean; isComplete: boolean } => {
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
      isComplete: hasProfileInfo && !!doctorExtra.fee && doctorExtra.hasDefaultPayment,
    };
  };

  const handleDismissOnboarding = (): void => {
    if (dontShowAgain) {
      dispatch(dismissOnboardingModal());
    }
    setModalOpen(false);
  };

  const handleCompleteProfileClick = (): void => {
    if (!extra) {
      return;
    }

    const { hasProfileInfo, hasFee } = getProfileCompletionStatus(extra);

    if (!hasProfileInfo) {
      router.push('/dashboard/settings');
    } else if (!hasFee) {
      router.push(`/dashboard/settings/payment?tab=${PaymentTab.Pricing}`);
    } else {
      router.push(`/dashboard/settings/payment?tab=${PaymentTab.PaymentMethod}`);
    }

    handleDismissOnboarding();
  };

  const InfoCard = ({
    icon,
    title,
    description,
    bgColor,
    textColor,
  }: {
    icon: string;
    title: string;
    description: string;
    bgColor: string;
    textColor: string;
  }): JSX.Element => (
    <div className={`rounded-lg border p-4 ${bgColor}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full ${textColor.includes('yellow') ? 'bg-yellow-400' : textColor.includes('green') ? 'bg-green-400' : 'bg-blue-400'}`}
          >
            <span className="text-sm font-medium text-white">{icon}</span>
          </div>
        </div>
        <div>
          <h3 className={`text-sm font-medium ${textColor}`}>{title}</h3>
          <p className={`mt-1 text-sm ${textColor.replace('-800', '-700')}`}>{description}</p>
        </div>
      </div>
    </div>
  );

  const ActionButtons = ({
    showCompleteProfile = true,
  }: {
    showCompleteProfile?: boolean;
  }): JSX.Element => (
    <div className={showCompleteProfile ? 'flex gap-3' : 'flex justify-center'}>
      {showCompleteProfile ? (
        <>
          <button
            onClick={handleDismissOnboarding}
            className="flex-1 rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
          >
            I&#39;ll do this later
          </button>
          <button
            onClick={handleCompleteProfileClick}
            className="flex-1 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            Complete Profile
          </button>
        </>
      ) : (
        <button
          onClick={() => dispatch(dismissOnboardingModal())}
          className="rounded-md border border-transparent bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
        >
          Got it, thanks!
        </button>
      )}
    </div>
  );

  const CheckboxSection = (): JSX.Element => (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id="dontShowAgain"
        checked={dontShowAgain}
        onChange={(e) => setDontShowAgain(e.target.checked)}
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <label htmlFor="dontShowAgain" className="text-sm text-gray-600">
        Don&#39;t show this message again
      </label>
    </div>
  );

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
              description="While waiting for verification, you can complete your profile to be fully ready for bookings. This includes adding your experience, education, specializations, consultation fees, and payment methods."
              bgColor="border-blue-200 bg-blue-50"
              textColor="text-blue-800"
            />
          </div>

          <CheckboxSection />
          <ActionButtons />
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
              description="To start receiving bookings, please complete your profile by adding your experience, education, specializations, consultation fees, and payment methods."
              bgColor="border-blue-200 bg-blue-50"
              textColor="text-blue-800"
            />
          </div>

          <CheckboxSection />
          <ActionButtons />
        </div>
      );
    }

    // Scenario 3: Accepted doctor with complete profile
    if (doctorStatus === AcceptDeclineStatus.Accepted && isComplete) {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">🎉 You&#39;re All Set!</h2>
            <p className="text-sm text-gray-600">
              Congratulations! Your account is verified and your profile is complete.
            </p>
          </div>

          <div className="space-y-4">
            <InfoCard
              icon="✓"
              title="Profile Complete"
              description="Excellent! You have successfully completed your profile setup. Our admin team will now conduct due diligence on the information you've provided to ensure everything meets our standards."
              bgColor="border-green-200 bg-green-50"
              textColor="text-green-800"
            />
            <InfoCard
              icon="💡"
              title="What's Next?"
              description="While we complete our review, feel free to explore the application and familiarize yourself with all the features available to you. Patients will be able to book appointments with you once the review is complete."
              bgColor="border-blue-200 bg-blue-50"
              textColor="text-blue-800"
            />
          </div>

          <ActionButtons showCompleteProfile={false} />
        </div>
      );
    }

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
