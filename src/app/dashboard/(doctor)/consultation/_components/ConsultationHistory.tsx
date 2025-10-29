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
} from '@/lib/features/appointments/appointmentSelector';
import { Badge } from '@/components/ui/badge';
import { capitalize } from '@/lib/utils';
import { SymptomsType } from '@/types/consultation.interface';
import { Info, TestTubeDiagonal } from 'lucide-react';
import { TooltipComp } from '@/components/ui/tooltip';
import { DiagnosesList } from '@/app/dashboard/(doctor)/consultation/_components/ConditionCard';
import { selectUserName } from '@/lib/features/auth/authSelector';
import { LabCard } from '@/app/dashboard/(doctor)/consultation/_components/labCard';

const ConsultationHistory = (): JSX.Element => {
  const appointment = useAppSelector(selectAppointment);
  const complaints = useAppSelector(selectComplaints);
  const symptoms = useAppSelector(selectPatientSymptoms);
  const conductedLabs = useAppSelector(selectConductedLabs);
  const requestedLabs = useAppSelector(selectRequestedLabs);
  const diagnoses = useAppSelector(selectDiagnoses);
  const doctorName = useAppSelector(selectUserName);

  return (
    <div className="space-y-8">
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
      {appointment?.symptoms?.duration && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Duration</h2>
          <div className="text-gray-700">
            <span className="font-semibold">{appointment.symptoms.duration.value}</span>{' '}
            {appointment.symptoms.duration.type}
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
              {requestedLabs.map(({ testName, notes, fasting, specimen, id }) => (
                <div
                  key={id}
                  className="rounded-lg border border-gray-200 bg-blue-50 p-4 shadow-sm"
                >
                  <div className="mb-2 flex items-center gap-2 font-semibold text-gray-800">
                    <TestTubeDiagonal size={18} />
                    {testName}
                  </div>
                  {notes && <p className="mb-2 text-sm text-gray-600">{notes}</p>}
                  <div className="text-sm text-gray-600">
                    <span>Specimen: {specimen}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Fasting:{' '}
                    <Badge variant={fasting ? 'default' : 'secondary'}>
                      {fasting ? 'Yes' : 'No'}
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
            <h3 className="mb-3 font-semibold text-gray-700">Conducted Labs</h3>
            <div className="flex flex-wrap gap-4">
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
