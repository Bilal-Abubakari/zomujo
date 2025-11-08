import React, { JSX, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  selectAppointment,
  selectComplaints,
  selectDiagnoses,
  selectPatientSymptoms,
  selectRequestedLabs,
  selectConductedLabs,
} from '@/lib/features/appointments/appointmentSelector';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Info,
  MailCheck,
  TestTubeDiagonal,
  Pill,
  Stethoscope,
  ActivitySquare,
  AlertCircle,
} from 'lucide-react';
import { DiagnosesList } from '@/app/dashboard/(doctor)/consultation/_components/ConditionCard';
import { selectUserName } from '@/lib/features/auth/authSelector';
import { SymptomsType } from '@/types/consultation.interface';
import { capitalize } from '@/lib/utils';
import { TooltipComp } from '@/components/ui/tooltip';
import { Modal } from '@/components/ui/dialog';
import Signature from '@/components/signature/signature';
import { selectDoctorSignature } from '@/lib/features/doctors/doctorsSelector';
import { Separator } from '@/components/ui/separator';
import { generatePrescription } from '@/lib/features/appointments/consultation/consultationThunk';
import { useParams } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LabCard } from '@/app/dashboard/(doctor)/consultation/_components/labCard';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReviewConsultationProps {
  isPastConsultation?: boolean;
}

const ReviewConsultation = ({
  isPastConsultation = false,
}: ReviewConsultationProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const params = useParams();
  const doctorSignature = useAppSelector(selectDoctorSignature);
  const diagnoses = useAppSelector(selectDiagnoses);
  const complaints = useAppSelector(selectComplaints);
  const doctorName = useAppSelector(selectUserName);
  const symptoms = useAppSelector(selectPatientSymptoms);
  const requestedLabs = useAppSelector(selectRequestedLabs);
  const conductedLabs = useAppSelector(selectConductedLabs);
  const appointment = useAppSelector(selectAppointment);
  const [openAddSignature, setOpenAddSignature] = useState(false);
  const [addSignature, setAddSignature] = useState(false);
  const [isSendingPrescription, setIsSendingPrescription] = useState(false);

  const hasSignature = !!doctorSignature;

  const sendPrescription = async (): Promise<void> => {
    setIsSendingPrescription(true);
    const result = await dispatch(generatePrescription(String(params.appointmentId))).unwrap();
    toast(result);
    setIsSendingPrescription(false);
  };

  useEffect(() => {
    if (addSignature) {
      setOpenAddSignature(true);
    }
  }, [addSignature]);

  useEffect(() => {
    if (!openAddSignature) {
      setAddSignature(false);
    }
  }, [openAddSignature]);

  return (
    <>
      <Modal
        setState={setOpenAddSignature}
        open={openAddSignature}
        content={
          <Signature
            signatureAdded={() => setOpenAddSignature(false)}
            hasExistingSignature={hasSignature}
          />
        }
        showClose={true}
      />

      <div className="space-y-6 pb-20">
        {/* Header Section */}
        <div className="from-primary/10 to-primary/5 flex flex-col gap-4 rounded-lg bg-gradient-to-r p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              {isPastConsultation ? 'Consultation Summary' : 'Consultation Review'}
            </h1>
            <p className="mt-1 text-xs text-gray-600 sm:text-sm">
              {isPastConsultation
                ? 'Summary of completed consultation'
                : 'Review all consultation details before finalizing'}
            </p>
          </div>
          {!isPastConsultation && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:gap-4">
              <div className="flex items-center justify-between space-x-2 rounded-md border bg-white px-3 py-2 sm:justify-start sm:px-4">
                <Label
                  htmlFor="signature"
                  className="cursor-pointer text-xs font-medium sm:text-sm"
                >
                  {hasSignature ? 'Edit Digital Signature' : 'Add Digital Signature'}
                </Label>
                <Switch
                  checked={addSignature}
                  id="signature"
                  onCheckedChange={() => setAddSignature((prev) => !prev)}
                />
              </div>
              <Button
                variant="default"
                onClick={() => sendPrescription()}
                isLoading={isSendingPrescription}
                disabled={isSendingPrescription || !hasSignature}
                className="w-full sm:w-auto"
                child={
                  <>
                    <MailCheck className="mr-2 h-4 w-4" />
                    <span>Send Prescription</span>
                  </>
                }
              />
            </div>
          )}
        </div>

        {/* Signature Alert */}
        {!isPastConsultation && (
          <Alert
            variant="info"
            className={hasSignature ? 'border-blue-500 bg-blue-50' : 'border-amber-500 bg-amber-50'}
          >
            <AlertCircle
              className={`h-4 w-4 ${hasSignature ? 'text-blue-600' : 'text-amber-600'}`}
            />
            <AlertDescription className="flex items-center justify-between">
              <span className={hasSignature ? 'text-blue-800' : 'text-amber-800'}>
                {hasSignature
                  ? 'Your digital signature will be included in the prescription. You can edit it if needed.'
                  : 'A digital signature is required before sending the prescription.'}
              </span>
              <button
                onClick={() => setOpenAddSignature(true)}
                className={`ml-4 text-sm font-semibold underline ${hasSignature ? 'text-blue-700 hover:text-blue-900' : 'text-amber-700 hover:text-amber-900'}`}
              >
                {hasSignature ? 'Edit signature' : 'Add now'}
              </button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            {/* Chief Complaints */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Stethoscope className="text-primary h-5 w-5" />
                  Chief Complaints
                </CardTitle>
              </CardHeader>
              <CardContent>
                {complaints && complaints.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {complaints.map((complaint) => (
                      <Badge
                        key={complaint}
                        variant="secondary"
                        className="px-3 py-1.5 text-sm font-medium"
                      >
                        {complaint}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No complaints recorded</p>
                )}
                {appointment?.symptoms?.duration && (
                  <div className="mt-4 rounded-md bg-gray-50 p-3">
                    <span className="text-sm font-medium text-gray-700">Duration: </span>
                    <span className="text-sm text-gray-900">
                      {appointment.symptoms.duration.value} {appointment.symptoms.duration.type}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Symptoms by System */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ActivitySquare className="text-primary h-5 w-5" />
                  Symptoms by System
                </CardTitle>
              </CardHeader>
              <CardContent>
                {symptoms && Object.keys(symptoms).length > 0 ? (
                  <div className="space-y-4">
                    {Object.keys(symptoms).map((key) => {
                      const symptomType = key as SymptomsType;
                      const symptomList = symptoms[symptomType];
                      if (!symptomList || symptomList.length === 0) {
                        return null;
                      }

                      return (
                        <div key={key} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                          <h3 className="mb-2 font-semibold text-gray-800">
                            {capitalize(symptomType)} System
                          </h3>
                          <ul className="space-y-1.5">
                            {symptomList.map(({ name, notes }) => (
                              <li
                                key={name}
                                className="flex items-center gap-2 text-sm text-gray-600"
                              >
                                <span className="bg-primary h-1.5 w-1.5 rounded-full" />
                                <span>{name}</span>
                                {notes && (
                                  <TooltipComp tip={notes}>
                                    <Info size={14} className="text-gray-400" />
                                  </TooltipComp>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No symptoms recorded</p>
                )}
              </CardContent>
            </Card>

            {/* Medications Taken */}
            {appointment?.symptoms?.medicinesTaken &&
              appointment.symptoms.medicinesTaken.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Pill className="text-primary h-5 w-5" />
                      Medications Previously Taken
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {appointment.symptoms.medicinesTaken.map((medicine, index) => (
                        <div
                          key={`${index}-${medicine.name}`}
                          className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3"
                        >
                          <div>
                            <div className="font-medium text-gray-900">{medicine.name}</div>
                            <div className="text-sm text-gray-500">Dose: {medicine.dose}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Laboratory Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TestTubeDiagonal className="text-primary h-5 w-5" />
                  Laboratory Tests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Requested Labs */}
                {requestedLabs && requestedLabs.length > 0 && (
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-gray-700">Requested Tests</h4>
                    <div className="space-y-2">
                      {requestedLabs.map(({ testName, notes, fasting, specimen, id }) => (
                        <div key={id} className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                          <div className="mb-1 font-medium text-gray-900">{testName}</div>
                          {notes && <p className="mb-2 text-xs text-gray-600">{notes}</p>}
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <span>Specimen: {specimen}</span>
                            <Badge variant={fasting ? 'default' : 'secondary'} className="text-xs">
                              Fasting: {fasting ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conducted Labs */}
                {conductedLabs && conductedLabs.length > 0 && (
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-gray-700">Completed Tests</h4>
                    <div className="space-y-2">
                      {conductedLabs.map(({ testName, id, fileUrl, status, createdAt, notes }) => (
                        <LabCard
                          key={id}
                          testName={testName}
                          fileUrl={fileUrl}
                          status={status}
                          date={createdAt}
                          notes={notes}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {(!requestedLabs || requestedLabs.length === 0) &&
                  (!conductedLabs || conductedLabs.length === 0) && (
                    <p className="text-sm text-gray-500">No laboratory tests recorded</p>
                  )}
              </CardContent>
            </Card>

            {/* Diagnosis and Prescriptions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <Pill className="text-primary h-5 w-5" />
                    Diagnosis & Treatment Plan
                  </div>
                  {diagnoses.length > 0 && (
                    <Badge variant="brown" className="px-2 py-1">
                      {diagnoses.length} {diagnoses.length === 1 ? 'Diagnosis' : 'Diagnoses'}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="w-full">
                {diagnoses && diagnoses.length > 0 ? (
                  <DiagnosesList
                    className="sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1"
                    doctorName={doctorName}
                    conditions={diagnoses}
                  />
                ) : (
                  <p className="text-sm text-gray-500">No diagnosis recorded</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Future Features - Commented Out */}
        {/* <Card>
          <CardContent className="pt-6">
            <Textarea
              className="bg-grey-200"
              labelName="Message for Prescription"
              placeholder="Add any additional notes or instructions for the patient..."
            />
            <div className="mt-6">
              <Switch
                labelPosition="left"
                label="Schedule Follow-up Visit"
                labelClassName="text-base font-bold"
                onCheckedChange={setFutureVisits}
              />
            </div>
            {futureVisits && (
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-700">Send Reminder On</span>
                <div className="mt-3 flex flex-wrap gap-4">
                  <Input className="bg-grey-200" type="date" placeholder="Select date" />
                  <Input className="bg-grey-200" type="time" placeholder="Select time" />
                </div>
              </div>
            )}
          </CardContent>
        </Card> */}
      </div>
    </>
  );
};

export default ReviewConsultation;
