'use client';
import { interpolate } from 'framer-motion';
import React, { JSX, useEffect, useMemo, useState } from 'react';
import { interpolateRange, showErrorToast } from '@/lib/utils';
import HalfCircleProgress from '@/components/ui/halfCircleProgress';
import { Badge } from '@/components/ui/badge';
import { IBloodPressure, IPatientVitals } from '@/types/patient.interface';
import { FilePenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectRecord } from '@/lib/features/patients/patientsSelector';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { updateRecord } from '@/lib/features/records/recordsThunk';
import { Toast, toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MODE } from '@/constants/constants';
import { z } from 'zod';
import { useParams } from 'next/navigation';
import { positiveNumberSchema, stringInputOptionalNumberSchema } from '@/schemas/zod.schemas';

const patientVitalsSchema = z.object({
  bloodPressure: z
    .object({
      systolic: positiveNumberSchema,
      diastolic: positiveNumberSchema,
    })
    .optional(),
  weight: stringInputOptionalNumberSchema,
  heartRate: stringInputOptionalNumberSchema,
  respiratoryRate: stringInputOptionalNumberSchema,
  bloodSugarLevel: stringInputOptionalNumberSchema,
  temperature: stringInputOptionalNumberSchema,
  oxygenSaturation: stringInputOptionalNumberSchema,
});

const PatientVitalsCard = (): JSX.Element => {
  const [edit, setEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const patientRecord = useAppSelector(selectRecord);
  const dispatch = useAppDispatch();
  const bloodPressure: IBloodPressure = useMemo(
    () => patientRecord?.bloodPressure ?? { systolic: 120, diastolic: 80 },
    [patientRecord],
  );
  const {
    register,
    formState: { errors, isValid },
    setValue,
    handleSubmit,
  } = useForm<IPatientVitals>({
    resolver: zodResolver(patientVitalsSchema),
    mode: MODE.ON_TOUCH,
    defaultValues: {
      bloodPressure,
    },
  });
  const params = useParams();
  const patientId = params.id as string;
  const vitalsColor = interpolate(
    [0, 0.25, 0.75, 1],
    ['#F59E0B', '#08AF85', '#08AF85', '#DC2626'],
    {
      clamp: true,
    },
  );

  const onSubmit = async (data: IPatientVitals): Promise<void> => {
    setIsLoading(true);
    const { payload } = await dispatch(updateRecord({ id: patientId, ...data }));
    toast(payload as Toast);
    if (!showErrorToast(payload)) {
      setEdit(false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (patientRecord) {
      if (patientRecord.bloodPressure) {
        setValue('bloodPressure', patientRecord.bloodPressure);
      }
      const { weight, temperature, heartRate, respiratoryRate, bloodSugarLevel, oxygenSaturation } =
        patientRecord;
      setValue('weight', weight);
      setValue('temperature', temperature);
      setValue('heartRate', heartRate);
      setValue('respiratoryRate', respiratoryRate);
      setValue('bloodSugarLevel', bloodSugarLevel);
      setValue('oxygenSaturation', oxygenSaturation);
    }
  }, [patientRecord]);
  return (
    <>
      <div className="flex w-full max-w-sm flex-col rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-row items-center justify-between">
          <p className="font-bold">Vitals</p>
          <Button
            variant="outline"
            onClick={() => setEdit(true)}
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
              {patientRecord?.temperature ? `${patientRecord.temperature} °C` : '<Empty>'}
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
      <Drawer direction="right" open={edit}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm p-4">
            <DrawerHeader className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-lg">Edit Vitals</DrawerTitle>
                <DrawerDescription>
                  Review the details of the new appointment request below.
                </DrawerDescription>
              </div>
            </DrawerHeader>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <Input
                labelName="Systolic (mmHg)"
                type="number"
                error={errors.bloodPressure?.systolic?.message}
                placeholder="Enter systolic pressure"
                {...register('bloodPressure.systolic')}
                rightIcon="mmHg"
              />
              <Input
                labelName="Diastolic (mmHg)"
                type="number"
                error={errors.bloodPressure?.diastolic?.message}
                placeholder="Enter diastolic pressure"
                {...register('bloodPressure.diastolic')}
                rightIcon="mmHg"
              />
              <Input
                labelName="Weight (kg)"
                type="number"
                error={errors.weight?.message}
                placeholder="Enter weight"
                {...register('weight')}
                rightIcon="kg"
              />
              <Input
                labelName="Heart Rate (bpm)"
                type="number"
                error={errors.heartRate?.message}
                placeholder="Enter heart rate"
                {...register('heartRate')}
                rightIcon="bpm"
              />
              <Input
                labelName="Respiratory Rate (cpm)"
                type="number"
                error={errors.respiratoryRate?.message}
                placeholder="Enter respiratory rate"
                {...register('respiratoryRate')}
                rightIcon="cpm"
              />
              <Input
                labelName="Blood Sugar Level (mg/dL)"
                type="number"
                error={errors.bloodSugarLevel?.message}
                placeholder="Enter blood sugar level"
                {...register('bloodSugarLevel')}
                rightIcon="mg/dL"
              />
              <Input
                labelName="Temperature (°C)"
                type="number"
                error={errors.temperature?.message}
                placeholder="Enter temperature"
                {...register('temperature')}
                rightIcon="°C"
              />
              <Input
                labelName="Oxygen Saturation (%)"
                type="number"
                error={errors.oxygenSaturation?.message}
                placeholder="Enter oxygen saturation"
                {...register('oxygenSaturation')}
                rightIcon="%"
              />
              <div className="space-x-3">
                <Button
                  isLoading={isLoading}
                  disabled={!isValid || isLoading}
                  child="Save"
                  type="submit"
                />
                <Button
                  disabled={isLoading}
                  onClick={() => setEdit(false)}
                  child="Close"
                  type="button"
                  variant="secondary"
                />
              </div>
            </form>

            <DrawerFooter className="flex justify-between"></DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

const vitalsRange = ({ systolic, diastolic }: IBloodPressure): number => {
  const percSystolic = interpolateRange(systolic, 80, 200, 0, 1);
  const percDiastolic = interpolateRange(diastolic, 60, 140, 0, 1);

  return (percSystolic + percDiastolic) / 2;
};

export default PatientVitalsCard;
