import Image from 'next/image';
import { PdfFile } from '@/assets/images';
import { StatusBadge } from '@/components/ui/statusBadge';
import { RequestStatus } from '@/types/shared.enum';
import { getFormattedDate } from '@/lib/date';
import React, { JSX, useState } from 'react';
import { Modal } from '@/components/ui/dialog';
import { TooltipComp } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

type LabCardProps = {
  testName: string;
  fileUrl: string | null;
  status: RequestStatus;
  date: string;
  notes: string;
};
export const LabCard = ({ testName, fileUrl, status, date, notes }: LabCardProps): JSX.Element => {
  const [showPdf, setShowPdf] = useState(false);
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
                <span className="text-lg text-gray-500">
                  The lab result has not been uploaded by the patient.
                </span>
              </div>
            )}
          </div>
        }
      />
      <div
        role="button"
        onClick={() => setShowPdf(true)}
        className="hover:border-primary-500 cursor-pointer rounded-[8px] border border-gray-300 p-4 transition-colors transition-shadow hover:shadow-md"
      >
        <div className="flex items-center gap-x-2">
          <TooltipComp tip={testName}>
            <span className="text-grayscale-600 max-w-xs truncate font-medium">{testName}</span>
          </TooltipComp>
          <TooltipComp tip={notes}>
            <Info size={16} className="flex-shrink-0" />
          </TooltipComp>
        </div>
        <div className="mt-2 flex w-full flex-col items-center justify-center gap-2 bg-[#F5F5F5] px-8 py-4">
          <Image src={PdfFile} alt="Pdf file" />
          <TooltipComp tip={`${testName} Lab request.pdf`}>
            <span className="max-w-xs truncate text-xs">{testName} Lab request.pdf</span>
          </TooltipComp>
        </div>
        <StatusBadge status={status} approvedTitle="Completed" />
        <div className="mt-3 flex justify-between">
          {/*TODO: Maybe we will add the doctor who requested the lab*/}
          {/*<span className="text-grayscale-600 text-xs">Dr. Amuzu Jacob</span>*/}
          <span className="text-grayscale-600 text-xs">{getFormattedDate(date)}</span>
        </div>
      </div>
    </>
  );
};
