import Image from 'next/image';
import { PdfFile } from '@/assets/images';
import { StatusBadge } from '@/components/ui/statusBadge';
import { RequestStatus } from '@/types/shared.enum';
import { getFormattedDate } from '@/lib/date';
import React, { JSX, useState } from 'react';
import { Modal } from '@/components/ui/dialog';
import { TooltipComp } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

type InvestigationCardProps = {
  testName: string;
  fileUrl: string | null;
  status: RequestStatus;
  date: string;
  notes?: string;
  type?: 'lab' | 'radiology';
  additionalInfo?: string;
};

export const InvestigationCard = ({
  testName,
  fileUrl,
  status,
  date,
  notes,
  type = 'lab',
  additionalInfo,
}: InvestigationCardProps): JSX.Element => {
  const [showPdf, setShowPdf] = useState(false);

  const tooltipContent = [notes, additionalInfo].filter(Boolean).join('\n');
  const investigationType = type === 'lab' ? 'lab' : 'radiology';
  const emptyMessage = `The ${investigationType} result has not been uploaded by the patient.`;

  return (
    <>
      <Modal
        showClose={true}
        setState={setShowPdf}
        className="w-full max-w-4xl"
        open={showPdf}
        content={
          <div className="mt-6">
            {fileUrl ? (
              <iframe
                src={fileUrl}
                className="h-[90vh] w-full rounded-lg border"
                title="PDF Viewer"
              />
            ) : (
              <div className="flex h-[90vh] w-full items-center justify-center rounded-lg border bg-gray-50">
                <span className="text-lg text-gray-500">{emptyMessage}</span>
              </div>
            )}
          </div>
        }
      />
      <div
        role="button"
        onClick={() => setShowPdf(true)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setShowPdf(true);
          }
        }}
        className="hover:border-primary-500 cursor-pointer rounded-[8px] border border-gray-300 p-4 transition-shadow hover:shadow-md"
      >
        <div className="flex items-center gap-x-2">
          <TooltipComp tip={testName}>
            <span className="text-grayscale-600 max-w-xs truncate font-medium">{testName}</span>
          </TooltipComp>
          {tooltipContent && (
            <TooltipComp tip={tooltipContent}>
              <Info size={16} className="shrink-0" />
            </TooltipComp>
          )}
        </div>
        <div className="mt-2 flex w-full flex-col items-center justify-center gap-2 bg-[#F5F5F5] px-8 py-4">
          <Image src={PdfFile} alt="Pdf file" />
          <TooltipComp tip={`${testName} ${type === 'lab' ? 'Lab' : 'Radiology'} request.pdf`}>
            <span className="max-w-xs truncate text-xs">
              {testName} {type === 'lab' ? 'Lab' : 'Radiology'} request.pdf
            </span>
          </TooltipComp>
        </div>
        <StatusBadge status={status} approvedTitle="Completed" />
        <div className="mt-3 flex justify-between">
          <span className="text-grayscale-600 text-xs">{getFormattedDate(date)}</span>
        </div>
      </div>
    </>
  );
};

// Export LabCard as alias for backward compatibility
export const LabCard = InvestigationCard;

// Export RadiologyCard as alias
export const RadiologyCard = (props: Omit<InvestigationCardProps, 'type'>): JSX.Element => (
  <InvestigationCard {...props} type="radiology" />
);
