'use client';
import React, { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, Calendar } from 'lucide-react';
import ReviewConsultation from '../consultation/_components/ReviewConsultation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ReviewPastConsultation = (): JSX.Element => {
  const router = useRouter();

  const handleGoBack = (): void => {
    router.back();
  };

  const handleGoToAppointments = (): void => {
    router.push('/dashboard/appointment');
  };

  return (
    <div className="space-y-6 pb-8">
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-transparent p-6 dark:from-blue-950/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                Past Consultation Review
              </h1>
              <Badge variant="secondary" className="px-3 py-1 text-xs">
                Read-only
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Viewing completed consultation details and prescription history
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="gap-2"
              child={
                <>
                  <ArrowLeftIcon className="h-4 w-4" />
                  Go Back
                </>
              }
            />
            <Button
              onClick={handleGoToAppointments}
              variant="default"
              className="gap-2"
              child={
                <>
                  <Calendar className="h-4 w-4" />
                  View Appointments
                </>
              }
            />
          </div>
        </div>
      </Card>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/50">
            <svg
              className="h-5 w-5 text-blue-600 dark:text-blue-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Historical Record
            </h3>
            <p className="mt-1 text-xs text-blue-800 dark:text-blue-200">
              This consultation has been completed. You&#39;re viewing a historical record of the
              diagnosis, prescriptions, and treatment plan that was provided.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <ReviewConsultation isPastConsultation={true} />
      </div>
    </div>
  );
};

export default ReviewPastConsultation;
