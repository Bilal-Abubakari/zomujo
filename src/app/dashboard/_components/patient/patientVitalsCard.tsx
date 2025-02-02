'use client';
import { interpolate } from 'framer-motion';
import React, { JSX } from 'react';
import { interpolateRange } from '@/lib/utils';
import HalfCircleProgress from '@/components/ui/halfCircleProgress';
import { Badge } from '@/components/ui/badge';
import { IBloodPressure, IPatient } from '@/types/patient.interface';

const PatientVitalsCard = ({
  weight,
  heartRate,
  bloodSugarLevel,
  temperature,
  bloodPressure,
}: IPatient): JSX.Element => {
  const vitalsColor = interpolate(
    [0, 0.25, 0.75, 1],
    ['#F59E0B', '#16A34A', '#16A34A', '#DC2626'],
    {
      clamp: true,
    },
  );
  const pressure: IBloodPressure = bloodPressure ? bloodPressure : { systolic: 120, diastolic: 80 };
  return (
    <div className="flex w-full max-w-sm flex-col rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-row items-center justify-between">
        <p className="font-bold">Vitals</p>
      </div>
      <hr className="my-4" />
      <div className="flex h-28 items-center justify-center">
        <HalfCircleProgress
          progress={vitalsRange(pressure)}
          size={224}
          stroke={32}
          color={vitalsColor(vitalsRange(pressure))}
          bottomComponent={
            <div className="absolute bottom-0 flex w-full flex-col items-center gap-1">
              <p className="text-xs text-gray-500">Blood Pressure</p>
              {bloodPressure ? (
                <p className="font-medium">
                  {bloodPressure.diastolic}/{bloodPressure.systolic} mmHg
                </p>
              ) : (
                '120/80 mmHg'
              )}
            </div>
          }
        />
      </div>
      <hr className="my-6" />
      <div className="flex flex-col gap-6">
        <div className="flex flex-row items-center justify-between text-sm">
          <p className="text-gray-500">Weight</p>
          {weight ? <p className="font-medium">{weight} kg</p> : '<Empty>'}
        </div>
        <div className="flex flex-row items-center justify-between text-sm">
          <p className="text-gray-500">Heart Rate</p>
          {heartRate ? (
            <Badge className="bg-error-50 font-medium text-error-600">{heartRate} bpm</Badge>
          ) : (
            '<Empty>'
          )}
        </div>
        <div className="flex flex-row items-center justify-between text-sm">
          <p className="text-gray-500">Blood Sugar Level</p>
          {bloodSugarLevel ? (
            <Badge className="bg-warning-75 font-medium text-warning-600">
              {bloodSugarLevel} mg/dL
            </Badge>
          ) : (
            '<Empty>'
          )}
        </div>
        <div className="flex flex-row items-center justify-between text-sm">
          <p className="text-gray-500">Temperature</p>
          <p className="font-medium">{temperature ? `${temperature} ˚C` : '<Empty>'}</p>
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
