'use client';

import React, { ChangeEvent, JSX, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  CircleCheck,
  Download,
  FileText,
  Paperclip,
  Pill,
  Stethoscope,
  TestTubeDiagonal,
  Upload,
  X,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFormattedDate, getTimeFromDateStamp } from '@/lib/date';
import { TooltipComp } from '@/components/ui/tooltip';
import { RoleProvider } from '@/app/dashboard/_components/providers/roleProvider';
import { Role } from '@/types/shared.enum';
import { IConsultationDetails } from '@/types/consultation.interface';
import { useAppDispatch } from '@/lib/hooks';
import {
  addLabFile,
  addRadiologyFile,
  downloadLabRequestPdf,
  downloadRadiologyRequestPdf,
  downloadReferralLetter,
  getConsultationDetail,
} from '@/lib/features/appointments/consultation/consultationThunk';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/statusBadge';
import useWebSocket from '@/hooks/useWebSocket';
import {
  INotification,
  NotificationEvent,
  NotificationTopic,
} from '@/types/notification.interface';
import { downloadBlob, showErrorToast } from '@/lib/utils';
import { Toast, toast } from '@/hooks/use-toast';

const notificationsToRefetch = new Set<NotificationTopic>([
  NotificationTopic.LabRequest,
  NotificationTopic.PrescriptionGenerated,
  NotificationTopic.RadiologyRequest,
]);

type SelectedFiles = {
  [key: string]: File | null;
};

const PatientConsultationView = (): JSX.Element => {
  const { on } = useWebSocket();
  const endRef = useRef<HTMLDivElement | null>(null);
  const params = useParams();
  const [consultationDetails, setConsultationDetails] = useState<IConsultationDetails>();
  const dispatch = useAppDispatch();
  const [selectedFiles, setSelectedFiles] = useState<SelectedFiles>({});
  const [selectedRadiologyFiles, setSelectedRadiologyFiles] = useState<SelectedFiles>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadingRadiology, setUploadingRadiology] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadingLabRequest, setDownloadingLabRequest] = useState(false);
  const [downloadingRadiologyRequest, setDownloadingRadiologyRequest] = useState(false);
  const [downloadingReferral, setDownloadingReferral] = useState<string | null>(null);

  const handleFileChange = ({ target }: ChangeEvent<HTMLInputElement>, labId: string): void => {
    const file = target.files?.[0];
    if (file) {
      setSelectedFiles((prev) => ({ ...prev, [labId]: file }));
    }
  };

  const handleRadiologyFileChange = (
    { target }: ChangeEvent<HTMLInputElement>,
    radiologyId: string,
  ): void => {
    const file = target.files?.[0];
    if (file) {
      setSelectedRadiologyFiles((prev) => ({ ...prev, [radiologyId]: file }));
    }
  };

  const handleDownloadLabRequest = async (): Promise<void> => {
    const consultationId = params.consultationId as string;
    if (!consultationId) {
      return;
    }

    setDownloadingLabRequest(true);
    const payload = await dispatch(downloadLabRequestPdf(consultationId)).unwrap();

    if (showErrorToast(payload)) {
      toast(payload as Toast);
      setDownloadingLabRequest(false);
      return;
    }
    downloadBlob(payload as Blob, `lab-request-${consultationId}.pdf`);

    setDownloadingLabRequest(false);
  };

  const handleDownloadRadiologyRequest = async (): Promise<void> => {
    const consultationId = params.consultationId as string;
    if (!consultationId) {
      return;
    }

    setDownloadingRadiologyRequest(true);
    const payload = await dispatch(downloadRadiologyRequestPdf(consultationId)).unwrap();

    if (showErrorToast(payload)) {
      toast(payload as Toast);
      setDownloadingRadiologyRequest(false);
      return;
    }
    downloadBlob(payload as Blob, `radiology-request-${consultationId}.pdf`);

    setDownloadingRadiologyRequest(false);
  };

  const handleDownloadReferral = async (referralId: string, doctorName: string): Promise<void> => {
    const consultationId = params.consultationId as string;
    if (!consultationId || !referralId) {
      return;
    }

    setDownloadingReferral(referralId);
    const payload = await dispatch(
      downloadReferralLetter({ appointmentId: consultationId, referralId }),
    ).unwrap();

    if (showErrorToast(payload)) {
      toast(payload as Toast);
      setDownloadingReferral(null);
      return;
    }
    downloadBlob(payload as Blob, `referral-letter-${doctorName}.pdf`);
    setDownloadingReferral(null);
  };

  const fetchConsultation = async (scroll = false): Promise<void> => {
    setLoading(true);
    const consultationId = params.consultationId as string;
    if (!consultationId) {
      setLoading(false);
      return;
    }
    const { payload } = await dispatch(getConsultationDetail(consultationId));
    if (showErrorToast(payload)) {
      toast(payload as Toast);
      setLoading(false);
      return;
    }
    setConsultationDetails(payload as IConsultationDetails);
    setLoading(false);

    if (scroll) {
      requestAnimationFrame(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    }
  };

  on(NotificationEvent.NewNotification, (data: unknown) => {
    const { payload } = data as INotification;
    if (notificationsToRefetch.has(payload.topic)) {
      const shouldScroll = payload.topic !== NotificationTopic.PrescriptionGenerated;
      void fetchConsultation(shouldScroll);
    }
  });

  const handleUpload = async (labId: string): Promise<void> => {
    const file = selectedFiles[labId];
    if (!file) {
      return;
    }
    setUploading(labId);

    const { payload } = await dispatch(addLabFile({ labId, file }));
    if (showErrorToast(payload)) {
      toast(payload as Toast);
      setUploading(null);
      return;
    }

    const lab = consultationDetails?.lab.map((lab) =>
      lab.id === labId ? { ...lab, fileUrl: payload as string } : lab,
    );
    if (lab && consultationDetails) {
      setConsultationDetails({ ...consultationDetails, lab });
    }
    setSelectedFiles((prev) => ({ ...prev, [labId]: null }));
    setUploading(null);
  };

  const handleRadiologyUpload = async (testName: string, radiologyId: string): Promise<void> => {
    const key = `${radiologyId}-${testName}`;
    const file = selectedRadiologyFiles[key];
    if (!file) {
      return;
    }
    setUploadingRadiology(key);

    const payload = await dispatch(addRadiologyFile({ file, radiologyId, testName })).unwrap();
    if (showErrorToast(payload)) {
      toast(payload as Toast);
      setUploadingRadiology(null);
      return;
    }

    const updatedTests = consultationDetails?.radiology?.tests.map((test) =>
      test.testName === testName ? { ...test, fileUrl: payload as string } : test,
    );
    if (updatedTests) {
      const radiology = { ...consultationDetails!.radiology, tests: updatedTests };
      setConsultationDetails({ ...consultationDetails!, radiology });
    }
    setSelectedRadiologyFiles((prev) => ({ ...prev, [key]: null }));
    setUploadingRadiology(null);
  };

  useEffect(() => {
    void fetchConsultation();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 p-4 md:p-8">
        {/* Skeleton for Consultation Details */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gray-50 p-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <Skeleton className="mb-2 h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <Skeleton className="mb-2 h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Skeleton for Prescriptions */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-4 h-4 w-64" />
            <Skeleton className="h-10 w-40" />
          </CardContent>
        </Card>

        {/* Skeleton for Lab Requests */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i}>
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <Skeleton className="mb-2 h-4 w-32" />
                  <Skeleton className="mb-1 h-3 w-40" />
                  <Skeleton className="mb-2 h-3 w-56" />
                  <Skeleton className="h-8 w-32" />
                </div>
                <Separator className="mt-6" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Skeleton for Radiology Requests */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <Skeleton className="mb-2 h-4 w-32" />
              <Skeleton className="mb-1 h-3 w-40" />
              <Skeleton className="mb-2 h-3 w-56" />
              <Skeleton className="h-8 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RoleProvider role={Role.Patient}>
      <div className="space-y-8 p-4 md:p-8">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gray-50 p-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <CardTitle className="text-primary text-2xl font-bold">
                  Consultation Details
                </CardTitle>
                <p className="text-gray-500">
                  With {consultationDetails?.doctor.lastName}{' '}
                  {consultationDetails?.doctor.firstName} on{' '}
                  {getFormattedDate(consultationDetails?.slot.date ?? '')} at{' '}
                  {getTimeFromDateStamp(consultationDetails?.slot.startTime ?? '')}
                </p>
              </div>
              {consultationDetails?.status && (
                <StatusBadge approvedTitle="Completed" status={consultationDetails.status} />
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Diagnoses Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Stethoscope className="text-primary" />
              Doctor&#39;s Diagnosis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {consultationDetails?.diagnosis && consultationDetails.diagnosis.length > 0 ? (
              consultationDetails.diagnosis.map((diagnosis, index) => (
                <div
                  key={`${index}-${diagnosis.name}`}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">{diagnosis.name}</h3>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{diagnosis.notes}</p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-center text-gray-500">
                There is currently no diagnosis from the doctor.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prescriptions Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Pill className="text-primary" />
              Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {consultationDetails?.prescriptionUrl ? (
              <>
                <p className="mb-4 text-sm text-gray-600">
                  Your doctor has issued a prescription. Click the button below to view or download
                  it.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary-light hover:text-primary"
                  child={
                    <a
                      href={consultationDetails?.prescriptionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Prescription
                    </a>
                  }
                ></Button>
              </>
            ) : (
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-center text-gray-500">
                There is currently no prescription from the doctor. It is still being generated.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lab Requests Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <TestTubeDiagonal className="text-primary" />
                Lab Requests
              </CardTitle>
              {consultationDetails?.lab && consultationDetails.lab.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadLabRequest}
                  disabled={downloadingLabRequest}
                  isLoading={downloadingLabRequest}
                  child={
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download Lab Request
                    </>
                  }
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {consultationDetails?.lab && consultationDetails.lab.length > 0 ? (
              consultationDetails.lab.map((lab) => (
                <div key={lab.id}>
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <h3 className="font-semibold text-gray-800">{lab.testName}</h3>
                        <p className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">Specimen:</span> {lab.specimen}
                        </p>
                        {lab.notes && (
                          <p className="mt-1 text-sm text-gray-500">
                            <span className="font-medium">Notes:</span> {lab.notes}
                          </p>
                        )}
                      </div>
                      {lab.fileUrl ? (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CircleCheck size={20} />
                          <span>Result Uploaded</span>
                        </div>
                      ) : (
                        <div className="space-y-2 sm:w-auto">
                          <div className="flex items-center gap-2 justify-self-end">
                            <Button
                              child={
                                <label htmlFor={`file-${lab.id}`}>
                                  <Paperclip className="mr-2 h-4 w-4" />
                                  Attach PDF
                                </label>
                              }
                              asChild
                              variant="outline"
                              size="sm"
                              className="cursor-pointer"
                            ></Button>
                            <Input
                              id={`file-${lab.id}`}
                              type="file"
                              className="hidden"
                              accept=".pdf"
                              onChange={(e) => handleFileChange(e, lab.id)}
                            />
                            <Button
                              size="sm"
                              onClick={() => handleUpload(lab.id)}
                              disabled={!selectedFiles[lab.id] || uploading === lab.id}
                              isLoading={uploading === lab.id}
                              child={
                                <>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload
                                </>
                              }
                            />
                          </div>
                          {selectedFiles[lab.id] && (
                            <div className="flex items-center rounded-md bg-gray-100 p-2 text-sm">
                              <span className="max-w-sm truncate pr-2">
                                {selectedFiles[lab.id]?.name}
                              </span>
                              <TooltipComp tip="Remove file">
                                <button
                                  onClick={() =>
                                    setSelectedFiles({ ...selectedFiles, [lab.id]: null })
                                  }
                                >
                                  <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
                                </button>
                              </TooltipComp>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {consultationDetails.lab.length > 1 && <Separator className="mt-6" />}
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-center text-gray-500">
                There are currently no lab requests from the doctor.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Radiology Requests Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <TestTubeDiagonal className="text-primary" />
                Radiology Requests
              </CardTitle>
              {consultationDetails?.radiology && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadRadiologyRequest}
                  disabled={downloadingRadiologyRequest}
                  isLoading={downloadingRadiologyRequest}
                  child={
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download Radiology Request
                    </>
                  }
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {consultationDetails?.radiology ? (
              <>
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-4 font-semibold text-gray-800">
                    {consultationDetails.radiology.procedureRequest}
                  </h3>
                  {consultationDetails.radiology.history && (
                    <p className="mb-4 text-sm text-gray-500">
                      <span className="font-medium">History:</span>{' '}
                      {consultationDetails.radiology.history}
                    </p>
                  )}
                </div>
                {consultationDetails.radiology.tests.map((test, index) => (
                  <div
                    key={`${index}-${test.testName}`}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <h4 className="font-semibold text-gray-800">{test.testName}</h4>
                        <p className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">Category:</span> {test.category}
                        </p>
                      </div>
                      {test.fileUrl ? (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CircleCheck size={20} />
                          <span>Result Uploaded</span>
                        </div>
                      ) : (
                        <div className="space-y-2 sm:w-auto">
                          <div className="flex items-center gap-2 justify-self-end">
                            <Button
                              child={
                                <label
                                  htmlFor={`radio-file-${consultationDetails.radiology.id}-${test.testName}`}
                                >
                                  <Paperclip className="mr-2 h-4 w-4" />
                                  Attach PDF
                                </label>
                              }
                              asChild
                              variant="outline"
                              size="sm"
                              className="cursor-pointer"
                            ></Button>
                            <Input
                              id={`radio-file-${consultationDetails.radiology.id}-${test.testName}`}
                              type="file"
                              className="hidden"
                              accept=".pdf"
                              onChange={(e) =>
                                handleRadiologyFileChange(
                                  e,
                                  `${consultationDetails.radiology.id}-${test.testName}`,
                                )
                              }
                            />
                            <Button
                              size="sm"
                              onClick={() =>
                                handleRadiologyUpload(
                                  test.testName,
                                  consultationDetails.radiology.id,
                                )
                              }
                              disabled={
                                !selectedRadiologyFiles[
                                  `${consultationDetails.radiology.id}-${test.testName}`
                                ] ||
                                uploadingRadiology ===
                                  `${consultationDetails.radiology.id}-${test.testName}`
                              }
                              isLoading={
                                uploadingRadiology ===
                                `${consultationDetails.radiology.id}-${test.testName}`
                              }
                              child={
                                <>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload
                                </>
                              }
                            />
                          </div>
                          {selectedRadiologyFiles[
                            `${consultationDetails.radiology.id}-${test.testName}`
                          ] && (
                            <div className="flex items-center rounded-md bg-gray-100 p-2 text-sm">
                              <span className="max-w-sm truncate pr-2">
                                {
                                  selectedRadiologyFiles[
                                    `${consultationDetails.radiology.id}-${test.testName}`
                                  ]?.name
                                }
                              </span>
                              <TooltipComp tip="Remove file">
                                <button
                                  onClick={() =>
                                    setSelectedRadiologyFiles({
                                      ...selectedRadiologyFiles,
                                      [`${consultationDetails.radiology.id}-${test.testName}`]:
                                        null,
                                    })
                                  }
                                >
                                  <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
                                </button>
                              </TooltipComp>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-center text-gray-500">
                There are currently no radiology requests from the doctor.
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <FileText className="text-primary" />
                Referrals
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {consultationDetails?.referrals && consultationDetails.referrals.length > 0 ? (
              consultationDetails.referrals.map((referral, index) => (
                <div
                  key={`${index}-${referral.doctorName}`}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      {referral.type === 'internal' && referral.doctor ? (
                        <>
                          <h4 className="font-semibold text-gray-800">
                            Dr. {referral.doctor.firstName} {referral.doctor.lastName}
                          </h4>
                          <p className="mt-1 text-sm text-gray-600">
                            <span className="font-medium">Specialization:</span>{' '}
                            {referral.doctor.specializations?.[0] || 'General Practitioner'}
                          </p>
                          {/* <p className="text-sm text-gray-600">
                            <span className="font-medium">Facility:</span>{' '}
                            {referral.doctor.hospital?.name || 'Zomujo Platform'}
                          </p> */}
                        </>
                      ) : (
                        <>
                          <h4 className="font-semibold text-gray-800">{referral.doctorName}</h4>
                          <p className="mt-1 text-sm text-gray-600">
                            <span className="font-medium">Facility:</span> {referral.facility}
                          </p>
                          {referral.email && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Email:</span> {referral.email}
                            </p>
                          )}
                        </>
                      )}
                      {referral.notes && (
                        <p className="mt-2 text-sm text-gray-500 italic">
                          &#34;{referral.notes}&#34;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {referral.type === 'internal' && referral.doctor?.id ? (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          child={
                            <a
                              href={`/dashboard/doctor/${referral.doctor.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Connect with Doctor
                            </a>
                          }
                        />
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            referral.id &&
                            handleDownloadReferral(referral.id, referral.doctorName || 'referral')
                          }
                          disabled={!referral.id || downloadingReferral === referral.id}
                          isLoading={downloadingReferral === referral.id}
                          child={
                            <>
                              <Download className="mr-2 h-4 w-4" />
                              Download Letter
                            </>
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-center text-gray-500">
                No referrals issued.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div ref={endRef} />
    </RoleProvider>
  );
};

export default PatientConsultationView;
