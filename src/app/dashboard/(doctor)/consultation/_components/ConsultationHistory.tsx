'use client';
import React, { JSX } from 'react';
import { useAppSelector } from '@/lib/hooks';
import {
  selectAppointment,
  selectComplaints,
  selectPatientSymptoms,
  selectConductedLabs,
  selectRequestedLabs,
  selectDiagnoses,
  selectAppointmentLabs,
  selectAppointmentRadiology,
  selectPostInvestigationData,
} from '@/lib/features/appointments/appointmentSelector';
import { Badge } from '@/components/ui/badge';
import { capitalize } from '@/lib/utils';
import { SymptomsType } from '@/types/consultation.interface';
import {
  Info,
  TestTubeDiagonal,
  FlaskConical,
  Microscope,
  FileText,
  CheckCircle2,
  ExternalLink,
  ClipboardCheck,
  PenLine,
} from 'lucide-react';
import { TooltipComp } from '@/components/ui/tooltip';
import { DiagnosesList } from '@/app/dashboard/(doctor)/consultation/_components/ConditionCard';
import { selectUserName } from '@/lib/features/auth/authSelector';
import { LabCard } from '@/app/dashboard/(doctor)/consultation/_components/labCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ConsultationHistory = (): JSX.Element => {
  const appointment = useAppSelector(selectAppointment);
  const complaints = useAppSelector(selectComplaints);
  const symptoms = useAppSelector(selectPatientSymptoms);
  const conductedLabs = useAppSelector(selectConductedLabs);
  const requestedLabs = useAppSelector(selectRequestedLabs);
  const diagnoses = useAppSelector(selectDiagnoses);
  const doctorName = useAppSelector(selectUserName);
  const lab = useAppSelector(selectAppointmentLabs);
  const radiology = useAppSelector(selectAppointmentRadiology);
  const postInvestigationData = useAppSelector(selectPostInvestigationData);

  const labFileUrls = lab?.fileUrls ?? [];
  const radiologyFileUrls = radiology?.fileUrls ?? [];
  const hasInvestigationResults = labFileUrls.length > 0 || radiologyFileUrls.length > 0;

  return (
    <div className="space-y-8">
      {/* Investigation Results Section */}
      {hasInvestigationResults && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <FlaskConical className="text-primary h-5 w-5" />
            Investigation Results
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {labFileUrls.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TestTubeDiagonal className="text-primary h-4 w-4" />
                    Laboratory Results
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {labFileUrls.length} file{labFileUrls.length === 1 ? '' : 's'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {labFileUrls.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-800">
                          Lab Result {index + 1}
                        </span>
                      </div>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        child={
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            <span className="flex items-center gap-1 text-xs">
                              <FileText className="h-3.5 w-3.5" />
                              View
                              <ExternalLink className="h-3 w-3" />
                            </span>
                          </a>
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {radiologyFileUrls.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Microscope className="text-primary h-4 w-4" />
                    Radiology Results
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {radiologyFileUrls.length} file{radiologyFileUrls.length === 1 ? '' : 's'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {radiologyFileUrls.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-800">
                          Radiology Result {index + 1}
                        </span>
                      </div>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        child={
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            <span className="flex items-center gap-1 text-xs">
                              <FileText className="h-3.5 w-3.5" />
                              View
                              <ExternalLink className="h-3 w-3" />
                            </span>
                          </a>
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Post-Investigation Notes */}
      {postInvestigationData && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Post-Investigation Notes</h2>
          <div className="space-y-3">
            {postInvestigationData.historyOfPresentingComplaints && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm text-gray-700">
                    <FileText className="h-4 w-4" />
                    History of Presenting Complaints
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap text-gray-700">
                    {postInvestigationData.historyOfPresentingComplaints}
                  </p>
                </CardContent>
              </Card>
            )}
            {postInvestigationData.assessmentImpression && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm text-gray-700">
                    <ClipboardCheck className="h-4 w-4" />
                    Assessment / Impression
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap text-gray-700">
                    {postInvestigationData.assessmentImpression}
                  </p>
                </CardContent>
              </Card>
            )}
            {postInvestigationData.addendum && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm text-gray-700">
                    <PenLine className="h-4 w-4" />
                    Addendum
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap text-gray-700">
                    {postInvestigationData.addendum}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Complaints Section */}
      <section>
        <h2 className="mb-4 text-xl font-bold">Complaints</h2>
        {complaints && complaints.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {complaints.map((complaint) => (
              <Badge key={complaint} variant="outline" className="px-4 py-2 text-sm">
                {complaint}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No complaints recorded</p>
        )}
      </section>

      {/* Duration Section */}
      {appointment?.symptoms?.complaints && appointment.symptoms.complaints.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Complaint Durations</h2>
          <div className="space-y-2">
            {appointment.symptoms.complaints.map(({ complaint, duration }) => (
              <div key={complaint} className="text-sm text-gray-700">
                <span className="font-semibold">{complaint}:</span>{' '}
                <span>
                  {duration.value} {duration.type}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Symptoms Section */}
      <section>
        <h2 className="mb-4 text-xl font-bold">Symptoms</h2>
        {symptoms && Object.keys(symptoms).length > 0 ? (
          <div className="space-y-6">
            {Object.keys(symptoms).map((key) => {
              const symptomType = key as SymptomsType;
              const symptomList = symptoms[symptomType];
              if (!symptomList || symptomList.length === 0) {
                return null;
              }
              return (
                <div key={key} className="rounded-lg border border-gray-200 p-4">
                  <h3 className="mb-3 font-semibold text-gray-800">
                    {capitalize(symptomType)} System
                  </h3>
                  <div className="space-y-2">
                    {symptomList.map(({ name, notes }) => (
                      <div key={name} className="flex items-center gap-x-2 text-sm text-gray-600">
                        <span>• {name}</span>
                        {notes && (
                          <TooltipComp tip={notes}>
                            <Info size={16} className="text-gray-400" />
                          </TooltipComp>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">No symptoms recorded</p>
        )}
      </section>

      {/* Medications Taken Section */}
      {appointment?.symptoms?.medicinesTaken && appointment.symptoms.medicinesTaken.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Medications Taken</h2>
          <div className="space-y-3">
            {appointment.symptoms.medicinesTaken.map((medicine, index) => (
              <div
                key={`${index}-${medicine.name}`}
                className="rounded-lg border border-gray-200 bg-gray-50 p-3"
              >
                <div className="font-semibold text-gray-800">{medicine.name}</div>
                <div className="text-sm text-gray-600">Dose: {medicine.dose}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Labs Section */}
      <section>
        <h2 className="mb-4 text-xl font-bold">Laboratory Tests</h2>

        {/* Requested Labs */}
        {requestedLabs && requestedLabs.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 font-semibold text-gray-700">Requested Labs</h3>
            <div className="flex flex-wrap gap-4">
              {requestedLabs.map(({ testName, categoryType, id }) => (
                <div
                  key={id}
                  className="rounded-lg border border-gray-200 bg-blue-50 p-4 shadow-sm"
                >
                  <div className="mb-2 flex items-center gap-2 font-semibold text-gray-800">
                    <TestTubeDiagonal size={18} />
                    {testName}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span>Category: {categoryType}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conducted Labs */}
        {conductedLabs && conductedLabs.length > 0 && (
          <div>
            <h3 className="mb-3 font-semibold text-gray-700">Conducted Labs</h3>
            <div className="flex flex-wrap gap-4">
              {conductedLabs.map(({ testName, id, fileUrl, status }) => (
                <LabCard
                  key={id}
                  testName={testName}
                  fileUrl={fileUrl ?? null}
                  status={status}
                  date={''}
                />
              ))}
            </div>
          </div>
        )}

        {(!requestedLabs || requestedLabs.length === 0) &&
          (!conductedLabs || conductedLabs.length === 0) && (
            <p className="text-gray-500">No laboratory tests recorded</p>
          )}
      </section>

      {/* Diagnosis and Prescriptions Section */}
      <section>
        <h2 className="mb-4 text-xl font-bold">Diagnosis and Prescriptions</h2>
        {diagnoses && diagnoses.length > 0 ? (
          <div className="rounded-lg border border-gray-200 p-4">
            <DiagnosesList doctorName={doctorName} conditions={diagnoses} />
          </div>
        ) : (
          <p className="text-gray-500">No diagnosis recorded</p>
        )}
      </section>
    </div>
  );
};

export default ConsultationHistory;
