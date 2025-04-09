'use client';
import { interpolate } from 'framer-motion';
import React, { JSX, useMemo } from 'react';
import { interpolateRange } from '@/lib/utils';
import HalfCircleProgress from '@/components/ui/halfCircleProgress';
import { Badge } from '@/components/ui/badge';
import { IBloodPressure } from '@/types/patient.interface';
import { FilePenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/lib/hooks';
import { selectRecord } from '@/lib/features/patients/patientsSelector';

const PatientVitalsCard = (): JSX.Element => {
  const patientRecord = useAppSelector(selectRecord);
  const vitalsColor = interpolate(
    [0, 0.25, 0.75, 1],
    ['#F59E0B', '#08AF85', '#08AF85', '#DC2626'],
    {
      clamp: true,
    },
  );

  const bloodPressure: IBloodPressure = useMemo(
    () => patientRecord?.bloodPressure ?? { systolic: 120, diastolic: 80 },
    [patientRecord],
  );
  return (
    <div className="flex w-full max-w-sm flex-col rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-row items-center justify-between">
        <p className="font-bold">Vitals</p>
        <Button
          variant="outline"
          child={
            <>
              <FilePenLine />
              Edit
            </>
          }
        />
      </div>
      <hr className="my-4" />
      <div className="flex h-28 items-center justify-center">
        <HalfCircleProgress
          progress={vitalsRange(bloodPressure)}
          size={250}
          stroke={32}
          color={vitalsColor(vitalsRange(bloodPressure))}
          bottomComponent={
            <div className="absolute bottom-0 flex w-full flex-col items-center gap-1">
              <p className="text-xs text-gray-500">Blood Pressure</p>

              <p className="font-medium">
                {bloodPressure.diastolic}/{bloodPressure.systolic} mmHg
              </p>
            </div>
          }
        />
      </div>
      <hr className="my-6" />
      <div className="flex flex-col gap-6">
        <div className="flex flex-row items-center justify-between text-sm">
          <p className="text-gray-500">Weight</p>
          {patientRecord?.weight ? (
            <p className="font-medium">{patientRecord.weight} kg</p>
          ) : (
            '<Empty>'
          )}
        </div>
        <div className="flex flex-row items-center justify-between text-sm">
          <p className="text-gray-500">Heart Rate</p>
          {patientRecord?.heartRate ? (
            <Badge className="bg-error-50 text-error-600 font-medium">
              {patientRecord.heartRate} bpm
            </Badge>
          ) : (
            '<Empty>'
          )}
        </div>
        <div className="flex flex-row items-center justify-between text-sm">
          <p className="text-gray-500">Respiratory Rate</p>
          {patientRecord?.respiratoryRate ? (
            <Badge className="bg-[#F2F8FE] font-medium text-[#1178DF]">
              {patientRecord.respiratoryRate} cpm
            </Badge>
          ) : (
            '<Empty>'
          )}
        </div>
        <div className="flex flex-row items-center justify-between text-sm">
          <p className="text-gray-500">Blood Sugar Level</p>
          {patientRecord?.bloodSugarLevel ? (
            <Badge className="bg-warning-75 text-warning-600 font-medium">
              {patientRecord?.bloodSugarLevel} mg/dL
            </Badge>
          ) : (
            '<Empty>'
          )}
        </div>
        <div className="flex flex-row items-center justify-between text-sm">
          <p className="text-gray-500">Temperature</p>
          <p className="font-medium">
            {patientRecord?.temperature ? `${patientRecord.temperature} ˚C` : '<Empty>'}
          </p>
        </div>
        <div className="flex flex-row items-center justify-between text-sm">
          <p className="text-gray-500">SpO2</p>
          <p className="font-medium">
            {patientRecord?.oxygenSaturation ? `${patientRecord.oxygenSaturation} ˚%` : '<Empty>'}
          </p>
        </div>
      </div>
    </div>
  );
};

const vitalsRange = ({ systolic, diastolic }: IBloodPressure): number => {
  const percSystolic = interpolateRange(systolic, 80, 200, 0, 1);
  const percDiastolic = interpolateRange(diastolic, 60, 140, 0, 1);

  return (percSystolic + percDiastolic) / 2;
};

export default PatientVitalsCard;
