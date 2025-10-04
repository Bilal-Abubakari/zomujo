import { JSX } from 'react';

export const InfoCard = ({
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
}): JSX.Element => {
  const isNotPendingColorClass = textColor.includes('green') ? 'bg-green-400' : 'bg-blue-400';
  const textColorClass = `${textColor.includes('yellow') ? 'bg-yellow-400' : isNotPendingColorClass}`;
  return (
    <div className={`rounded-lg border p-4 ${bgColor}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full ${textColorClass}`}
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
};

type ActionButtonsProps = {
  showCompleteProfile?: boolean;
  handleCompleteProfileClick: () => void;
  handleDismissOnboarding: () => void;
};
export const ActionButtons = ({
  showCompleteProfile = true,
  handleCompleteProfileClick,
  handleDismissOnboarding,
}: ActionButtonsProps): JSX.Element => (
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
        onClick={handleDismissOnboarding}
        className="rounded-md border border-transparent bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
      >
        Got it, thanks!
      </button>
    )}
  </div>
);

type CheckboxSectionProps = {
  dontShowAgain: boolean;
  setDontShowAgain: (value: boolean) => void;
};
export const CheckboxSection = ({
  setDontShowAgain,
  dontShowAgain,
}: CheckboxSectionProps): JSX.Element => (
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
