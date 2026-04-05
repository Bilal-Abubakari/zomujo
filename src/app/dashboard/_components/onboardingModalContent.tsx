'use client';
import { JSX, useEffect } from 'react';
import { IDoctor } from '@/types/doctor.interface';
import { AcceptDeclineStatus } from '@/types/shared.enum';
import {
  ActionButtons,
  CheckboxSection,
  InfoCard,
} from '@/app/dashboard/_components/onboardingGuide';
import { BRANDING } from '@/constants/branding.constant';

interface OnboardingModalContentProps {
  extra: IDoctor;
  isComplete: boolean;
  dontShowAgain: boolean;
  setDontShowAgain: (value: boolean) => void;
  handleDismissOnboarding: (dismiss?: boolean) => void;
  handleCompleteProfileClick: () => void;
}

const OnboardingModalContent = ({
  extra,
  isComplete,
  dontShowAgain,
  setDontShowAgain,
  handleDismissOnboarding,
  handleCompleteProfileClick,
}: OnboardingModalContentProps): JSX.Element => {
  useEffect(() => {
    if (!extra) {
      handleDismissOnboarding();
      return;
    }

    const doctorStatus = extra.status;

    const isPendingIncomplete = doctorStatus === AcceptDeclineStatus.Pending && !isComplete;
    const isAcceptedIncomplete = doctorStatus === AcceptDeclineStatus.Accepted && !isComplete;
    const isPendingComplete = doctorStatus === AcceptDeclineStatus.Pending && isComplete;

    if (!isPendingIncomplete && !isAcceptedIncomplete && !isPendingComplete) {
      handleDismissOnboarding();
    }
  }, [extra, isComplete, handleDismissOnboarding]);

  if (!extra) {
    return null as unknown as JSX.Element;
  }

  const doctorStatus = extra.status;

  // Scenario 1: Pending doctor with incomplete profile
  if (doctorStatus === AcceptDeclineStatus.Pending && !isComplete) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Welcome to {BRANDING.APP_NAME}!</h2>
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
            bgColor="border-gray-200 bg-blue-50"
            textColor="text-gray-800"
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

  // Scenario 4: Pending doctor with complete profile
  if (doctorStatus === AcceptDeclineStatus.Pending && isComplete) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Profile Complete!</h2>
          <p className="text-sm text-gray-600">
            You&#39;ve successfully completed your profile. We&#39;re now reviewing your
            information.
          </p>
        </div>

        <div className="space-y-4">
          <InfoCard
            icon="⏳"
            title="Verification in Progress"
            description="Our admin team is currently verifying your profile and credentials. You'll be notified once your account is fully approved and ready to accept bookings."
            bgColor="border-blue-200 bg-blue-50"
            textColor="text-blue-800"
          />
        </div>

        <CheckboxSection
          dontShowAgain={dontShowAgain}
          setDontShowAgain={(value) => setDontShowAgain(value)}
        />
        <ActionButtons
          showCompleteProfile={false}
          handleDismissOnboarding={() => handleDismissOnboarding()}
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

  // TODO: Difficult to handle this third scenario hence will handle later because sync between backend and frontend is complex
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

  return null as unknown as JSX.Element;
};

export default OnboardingModalContent;
