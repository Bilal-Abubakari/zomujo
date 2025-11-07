'use client';
import { JSX, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectPatientWithRecord, selectRecord } from '@/lib/features/patients/patientsSelector';
import { selectUserId } from '@/lib/features/auth/authSelector';
import { getPatientRecords } from '@/lib/features/records/recordsThunk';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SkeletonMedicalRecord from '@/components/skeleton/skeletonMedicalRecord';
import {
  Heart,
  Pill,
  AlertCircle,
  Users,
  Activity,
  TestTube,
  Stethoscope,
  FileText,
} from 'lucide-react';
import moment from 'moment';
import { showErrorToast } from '@/lib/utils';
import { Toast, useToast } from '@/hooks/use-toast';
import { getPatientMedicalHistory } from '@/lib/features/patients/patientsThunk';
import { IPatientMedicalHistory } from '@/types/patient.interface';
import { RequestStatus } from '@/types/shared.enum';

const MyMedicalRecord = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const userId = useAppSelector(selectUserId);
  const patientWithRecord = useAppSelector(selectPatientWithRecord);
  const record = useAppSelector(selectRecord);
  const [isLoading, setIsLoading] = useState(true);
  const [medicalHistory, setMedicalHistory] = useState<IPatientMedicalHistory>();

  useEffect(() => {
    const fetchRecords = async (): Promise<void> => {
      if (!userId) {
        return;
      }

      setIsLoading(true);
      try {
        const [historyResponse, recordsResponse] = await Promise.all([
          dispatch(getPatientMedicalHistory()).unwrap(),
          dispatch(getPatientRecords(userId)).unwrap(),
        ]);

        if (showErrorToast(historyResponse)) {
          toast(historyResponse as Toast);
        } else {
          setMedicalHistory(historyResponse as IPatientMedicalHistory);
        }

        if (showErrorToast(recordsResponse)) {
          toast(recordsResponse as Toast);
        }
      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchRecords();
  }, [dispatch, userId, toast]);

  if (isLoading) {
    return <SkeletonMedicalRecord />;
  }

  if (!record) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="mb-4 h-12 w-12 text-gray-400" />
          <p className="text-gray-500">No medical records found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {patientWithRecord.firstName && (
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{`${patientWithRecord.firstName} ${patientWithRecord.lastName}`}</p>
              </div>
            )}
            {patientWithRecord.gender && (
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium">{patientWithRecord.gender}</p>
              </div>
            )}
            {patientWithRecord.dob && (
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{moment(patientWithRecord.dob).format('LL')}</p>
              </div>
            )}
            {patientWithRecord.email && (
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{patientWithRecord.email}</p>
              </div>
            )}
            {record?.bloodGroup && (
              <div>
                <p className="text-sm text-gray-500">Blood Group</p>
                <p className="font-medium">{record.bloodGroup}</p>
              </div>
            )}
            {record?.maritalStatus && (
              <div>
                <p className="text-sm text-gray-500">Marital Status</p>
                <p className="font-medium">{record.maritalStatus}</p>
              </div>
            )}
            {record?.denomination && (
              <div>
                <p className="text-sm text-gray-500">Denomination</p>
                <p className="font-medium">{record.denomination}</p>
              </div>
            )}
            {record?.height && (
              <div>
                <p className="text-sm text-gray-500">Height</p>
                <p className="font-medium">{record.height} cm</p>
              </div>
            )}
            {record?.weight && (
              <div>
                <p className="text-sm text-gray-500">Weight</p>
                <p className="font-medium">{record.weight} kg</p>
              </div>
            )}
            {patientWithRecord.city && (
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="font-medium">{patientWithRecord.city}</p>
              </div>
            )}
            {patientWithRecord.address && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{patientWithRecord.address}</p>
              </div>
            )}
            {patientWithRecord.NHISnumber && (
              <div>
                <p className="text-sm text-gray-500">NHIS Number</p>
                <p className="font-medium">{patientWithRecord.NHISnumber}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vitals */}
      {(record?.bloodPressure ||
        record?.heartRate ||
        record?.temperature ||
        record?.respiratoryRate ||
        record?.oxygenSaturation ||
        record?.bloodSugarLevel) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {record.bloodPressure && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Blood Pressure</p>
                  <p className="font-medium">{`${record.bloodPressure.systolic}/${record.bloodPressure.diastolic} mmHg`}</p>
                </div>
              )}
              {record.heartRate && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Heart Rate</p>
                  <p className="font-medium">{record.heartRate} bpm</p>
                </div>
              )}
              {record.temperature && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Temperature</p>
                  <p className="font-medium">{record.temperature} °C</p>
                </div>
              )}
              {record.respiratoryRate && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Respiratory Rate</p>
                  <p className="font-medium">{record.respiratoryRate} breaths/min</p>
                </div>
              )}
              {record.oxygenSaturation && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Oxygen Saturation</p>
                  <p className="font-medium">{record.oxygenSaturation}%</p>
                </div>
              )}
              {record.bloodSugarLevel && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Blood Sugar Level</p>
                  <p className="font-medium">{record.bloodSugarLevel} mg/dL</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medical History - Diagnoses */}
      {medicalHistory?.diagnoses && medicalHistory.diagnoses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Diagnosis History
              <Badge className="ml-2">{medicalHistory.diagnoses.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {medicalHistory.diagnoses.map(({ notes, name, diagnosedAt }) => (
                <div
                  key={name}
                  className="flex items-start justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{name}</p>
                    {notes && <p className="mt-1 text-sm text-gray-500">{notes}</p>}
                    <p className="mt-1 text-xs text-gray-400">{moment(diagnosedAt).format('LL')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medical History - Medications */}
      {medicalHistory?.medications && medicalHistory.medications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Current Medications
              <Badge className="ml-2">{medicalHistory.medications.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {medicalHistory.medications.map((medication) => (
                <div key={medication.id} className="flex items-center gap-2 rounded-lg border p-3">
                  <Pill className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="font-medium">{medication.name}</p>
                    <p className="text-sm text-gray-500">{medication.dose}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Allergies - Combined from both sources */}
      {((record?.allergies && record.allergies.length > 0) ||
        (medicalHistory?.allergies && medicalHistory.allergies.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Allergies
              <Badge variant="destructive" className="ml-2">
                {(record?.allergies?.length || 0) + (medicalHistory?.allergies?.length || 0)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {record?.allergies?.map((allergy) => (
                <div
                  key={allergy.id}
                  className="flex items-start justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{allergy.allergy}</p>
                    <p className="text-sm text-gray-500">Type: {allergy.type}</p>
                  </div>
                  <Badge variant={allergy.severity === 'severe' ? 'destructive' : 'secondary'}>
                    {allergy.severity}
                  </Badge>
                </div>
              ))}
              {medicalHistory?.allergies?.map((allergy) => (
                <div
                  key={allergy.id}
                  className="flex items-start justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{allergy.allergy}</p>
                    <p className="text-sm text-gray-500">Type: {allergy.type}</p>
                  </div>
                  <Badge variant={allergy.severity === 'severe' ? 'destructive' : 'secondary'}>
                    {allergy.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medical Conditions */}
      {record?.conditions && record.conditions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Medical Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {record.conditions.map((condition) => (
                <div key={condition.id} className="space-y-2 border-b pb-4 last:border-0">
                  <p className="text-lg font-medium">{condition.name}</p>
                  {condition.medicines && condition.medicines.length > 0 && (
                    <div className="ml-4 space-y-2">
                      <p className="text-sm font-medium text-gray-600">Medications:</p>
                      {condition.medicines.map((medicine) => (
                        <div key={medicine.id} className="flex items-center gap-2 text-sm">
                          <Pill className="h-4 w-4 text-gray-400" />
                          <span>{medicine.name}</span>
                          <span className="text-gray-500">- {medicine.dose}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Surgeries */}
      {record?.surgeries && record.surgeries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Surgical History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {record.surgeries.map((surgery) => (
                <div key={surgery.id} className="border-b pb-3 last:border-0">
                  <p className="font-medium">{surgery.name}</p>
                  {surgery.additionalNotes && (
                    <p className="mt-1 text-sm text-gray-500">{surgery.additionalNotes}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Family Members */}
      {record?.familyMembers && record.familyMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Family Medical History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {record.familyMembers.map((member, index) => (
                <div key={index} className="flex items-start gap-4 border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{`${member.firstName} ${member.lastName}`}</p>
                    <p className="text-sm text-gray-500">Relation: {member.relation}</p>
                    {member.email && <p className="text-sm text-gray-500">Email: {member.email}</p>}
                    {member.phone && <p className="text-sm text-gray-500">Phone: {member.phone}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lab Results - Combined from both sources */}
      {((): JSX.Element | null => {
        const allLabs = [...(record?.lab || []), ...(medicalHistory?.labResults || [])];

        const renderLabItem = (lab: (typeof allLabs)[0]): JSX.Element => (
          <div key={lab.id} className="border-b pb-3 last:border-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium">{lab.testName}</p>
                <p className="text-sm text-gray-500">Category: {lab.category}</p>
                {lab.notes && <p className="mt-1 text-sm text-gray-500">{lab.notes}</p>}
                {lab.fileUrl && (
                  <a
                    href={lab.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-blue-600 hover:underline"
                  >
                    View Report
                  </a>
                )}
              </div>
              <Badge variant={lab.status === RequestStatus.Completed ? 'default' : 'secondary'}>
                {lab.status}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-gray-400">{moment(lab.createdAt).format('LL')}</p>
          </div>
        );

        return allLabs.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Lab Results
                <Badge className="ml-2">{allLabs.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">{allLabs.map(renderLabItem)}</div>
            </CardContent>
          </Card>
        ) : null;
      })()}

      {/* Imaging Reports */}
      {medicalHistory?.imagingReports && medicalHistory.imagingReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Imaging Reports
              <Badge className="ml-2">{medicalHistory.imagingReports.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {medicalHistory.imagingReports.map((report) => (
                <div
                  key={report.labId}
                  className="flex items-start justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">Imaging Report</p>
                    {report.file && (
                      <p className="text-sm text-gray-500">File: {report.file.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lifestyle */}
      {record?.lifestyle && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Lifestyle Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(record.lifestyle as any).alcohol && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Alcohol Consumption</p>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <p className="font-medium">{(record.lifestyle as any).alcohol.level}</p>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(record.lifestyle as any).alcohol.description && (
                    <p className="text-sm text-gray-400">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(record.lifestyle as any).alcohol.description}
                    </p>
                  )}
                </div>
              )}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(record.lifestyle as any).smoking && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Smoking</p>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <p className="font-medium">{(record.lifestyle as any).smoking.level}</p>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(record.lifestyle as any).smoking.description && (
                    <p className="text-sm text-gray-400">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(record.lifestyle as any).smoking.description}
                    </p>
                  )}
                </div>
              )}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(record.lifestyle as any).stress && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Stress Level</p>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <p className="font-medium">{(record.lifestyle as any).stress.level}</p>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(record.lifestyle as any).stress.description && (
                    <p className="text-sm text-gray-400">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(record.lifestyle as any).stress.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Symptoms */}
      {record?.symptoms && record.symptoms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Symptoms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {record.symptoms.map((symptom, index) => (
                <Badge key={index} variant="outline">
                  {symptom}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complaints */}
      {record?.complaints && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Complaints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{record.complaints}</p>
          </CardContent>
        </Card>
      )}

      {/* Examination */}
      {record?.examination && record.examination.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Examination Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-2">
              {record.examination.map((note, index) => (
                <li key={index} className="text-gray-700">
                  {note}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Record Metadata */}
      {record && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap justify-between gap-2 text-sm text-gray-500">
              <span>Last Updated: {moment(record.updatedAt).format('LLLL')}</span>
              <span>Created: {moment(record.createdAt).format('LL')}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyMedicalRecord;
