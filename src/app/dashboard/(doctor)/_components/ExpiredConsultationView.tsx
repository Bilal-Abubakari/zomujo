'use client';
import { JSX } from 'react';
import { Button } from '@/components/ui/button';
import { ClockIcon, FileTextIcon, ArrowLeftIcon } from 'lucide-react';

interface ExpiredConsultationViewProps {
  onViewPastConsultation: () => void;
  onGoBack: () => void;
}

const ExpiredConsultationView = ({
  onViewPastConsultation,
  onGoBack,
}: ExpiredConsultationViewProps): JSX.Element => (
  <div className="flex min-h-[600px] items-center justify-center p-6">
    <div className="w-full max-w-2xl">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-amber-100 p-6 dark:bg-amber-900/30">
            <ClockIcon className="h-16 w-16 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        <h2 className="mb-4 text-center text-3xl font-bold text-gray-900 dark:text-white">
          Consultation Session Expired
        </h2>

        <div className="mb-8 space-y-3 text-center">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            It looks like this consultation session may have expired or has already been completed.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">This typically happens when:</p>
          <ul className="mx-auto max-w-md space-y-2 text-left text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start">
              <span className="mt-0.5 mr-2 text-amber-600 dark:text-amber-400">•</span>
              <span>The consultation was already started and completed</span>
            </li>
            <li className="flex items-start">
              <span className="mt-0.5 mr-2 text-amber-600 dark:text-amber-400">•</span>
              <span>The appointment time window has passed</span>
            </li>
            <li className="flex items-start">
              <span className="mt-0.5 mr-2 text-amber-600 dark:text-amber-400">•</span>
              <span>The session link is no longer valid</span>
            </li>
          </ul>
        </div>

        <div className="mb-8 border-t border-gray-200 dark:border-gray-700"></div>

        <div className="space-y-4">
          <p className="text-center text-sm font-medium text-gray-900 dark:text-white">
            What would you like to do?
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={onViewPastConsultation}
              className="flex-1 gap-2"
              size="lg"
              child={
                <>
                  <FileTextIcon className="h-5 w-5" />
                  View Past Consultation
                </>
              }
            />

            <Button
              onClick={onGoBack}
              variant="outline"
              className="flex-1 gap-2"
              size="lg"
              child={
                <>
                  <ArrowLeftIcon className="h-5 w-5" />
                  Back to Appointments
                </>
              }
            />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          If you believe this is an error, please contact support or try refreshing the page.
        </p>
      </div>
    </div>
  </div>
);

export default ExpiredConsultationView;
