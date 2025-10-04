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

    // Stage 1 check: Profile Info
    const hasProfileInfo =
      extra.experience &&
      extra.education &&
      extra.specializations?.length > 0 &&
      extra.languages?.length > 0 &&
      extra.bio;

    if (!hasProfileInfo) {
      router.push('/dashboard/settings');
      handleDismissOnboarding();
      return;
    }

    // Stage 2 check: Fee
    if (!extra.fee) {
      router.push(`/dashboard/settings/payment?tab=${PaymentTab.Pricing}`);
      handleDismissOnboarding();
      return;
    }

    // Stage 3 check: Payment Method
    if (!extra.hasDefaultPayment) {
      router.push(`/dashboard/settings/payment?tab=${PaymentTab.PaymentMethod}`);
      handleDismissOnboarding();
    }
  };

  const OnboardingModalContent = (): JSX.Element => {
    if (!extra) {
      return <div></div>;
    }

    const doctorStatus = (extra as IDoctor).status;

    const hasProfileInfo =
      extra.experience &&
      extra.education &&
      extra.specializations?.length > 0 &&
      extra.languages?.length > 0 &&
      extra.bio;

    const isProfileComplete = hasProfileInfo && extra.fee && extra.hasDefaultPayment;

    // Scenario 1: Pending doctor with incomplete profile
    if (doctorStatus === 'pending' && !isProfileComplete) {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">Welcome to Zomujo!</h2>
            <p className="text-sm text-gray-600">
              Get ready to start receiving patient bookings by completing these important steps.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400">
                    <span className="text-sm font-medium text-white">1</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Account Verification</h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    Your account is currently <strong>pending verification</strong> based on the
                    information you submitted. Once approved by our admin team, patients will be
                    able to start booking appointments with you.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-400">
                    <span className="text-sm font-medium text-white">2</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Complete Your Profile</h3>
                  <p className="mt-1 text-sm text-blue-700">
                    While waiting for verification, you can complete your profile to be fully ready
                    for bookings. This includes adding your experience, education, specializations,
                    consultation fees, and payment methods.
                  </p>
                </div>
              </div>
            </div>
          </div>

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

          <div className="flex gap-3">
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
          </div>
        </div>
      );
    }

    // Scenario 2: Accepted doctor with incomplete profile
    if (doctorStatus === 'accepted' && !isProfileComplete) {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">🎉 Account Approved!</h2>
            <p className="text-sm text-gray-600">
              Great news! Your account has been verified and approved by our admin team.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-400">
                    <span className="text-sm font-medium text-white">✓</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-green-800">Account Verified</h3>
                  <p className="mt-1 text-sm text-green-700">
                    Your account has been successfully verified! You&#39;re almost ready to start
                    receiving patient bookings.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-400">
                    <span className="text-sm font-medium text-white">!</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Complete Your Profile</h3>
                  <p className="mt-1 text-sm text-blue-700">
                    To start receiving bookings, please complete your profile by adding your
                    experience, education, specializations, consultation fees, and payment methods.
                  </p>
                </div>
              </div>
            </div>
          </div>

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

          <div className="flex gap-3">
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
          </div>
        </div>
      );
    }

    // Scenario 3: Accepted doctor with complete profile
    if (doctorStatus === 'accepted' && isProfileComplete) {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">🎉 You&#39;re All Set!</h2>
            <p className="text-sm text-gray-600">
              Congratulations! Your account is verified and your profile is complete.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-400">
                    <span className="text-sm font-medium text-white">✓</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-green-800">Profile Complete</h3>
                  <p className="mt-1 text-sm text-green-700">
                    Excellent! You have successfully completed your profile setup. Our admin team
                    will now conduct due diligence on the information you&#39;ve provided to ensure
                    everything meets our standards.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-400">
                    <span className="text-sm font-medium text-white">💡</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">What&#39;s Next?</h3>
                  <p className="mt-1 text-sm text-blue-700">
                    While we complete our review, feel free to explore the application and
                    familiarize yourself with all the features available to you. Patients will be
                    able to book appointments with you once the review is complete.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => dispatch(dismissOnboardingModal())}
              className="rounded-md border border-transparent bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
            >
              Got it, thanks!
            </button>
          </div>
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
