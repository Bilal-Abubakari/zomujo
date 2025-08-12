import { IPatientBasic } from '@/types/patient.interface';
import React, { JSX, useEffect, useState } from 'react';
import { AvatarWithName } from '@/components/ui/avatar';
import { capitalize, showErrorToast } from '@/lib/utils';
import GenderBadge from '@/app/dashboard/_components/genderBadge';
import { formatDateToDDMMYYYY } from '@/lib/date';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { SelectInput } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import {
  MODE,
  maritalOptions,
  denominationOptions,
  bloodGroupOptions,
} from '@/constants/constants';
import { z } from 'zod';
import { BloodGroup, Denomination, MaritalStatus } from '@/types/shared.enum';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectPatientWithRecord, selectRecord } from '@/lib/features/patients/patientsSelector';
import { toast, Toast } from '@/hooks/use-toast';
import { positiveNumberSchema } from '@/schemas/zod.schemas';
import { updateRecord } from '@/lib/features/records/recordsThunk';
import { useParams } from 'next/navigation';
import CardFrame from '@/app/dashboard/_components/cardFrame';

const patientBasicSchema = z.object({
  denomination: z.enum(Denomination).optional(),
  height: positiveNumberSchema.optional(),
  bloodGroup: z.enum(BloodGroup).optional(),
  maritalStatus: z.enum(MaritalStatus).optional(),
});

const PatientCard = (): JSX.Element => {
  const params = useParams();
  const patientId = params.id as string;
  const patientWithRecord = useAppSelector(selectPatientWithRecord);
  const patientRecord = useAppSelector(selectRecord);
  const {
    register,
    control,
    formState: { errors, isValid },
    setValue,
    handleSubmit,
  } = useForm<IPatientBasic>({
    resolver: zodResolver(patientBasicSchema),
    mode: MODE.ON_TOUCH,
    defaultValues: {
      maritalStatus: patientRecord?.maritalStatus,
      bloodGroup: patientRecord?.bloodGroup,
      denomination: patientRecord?.denomination,
      height: patientRecord?.height,
    },
  });
  const [edit, setEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (patientRecord) {
      setValue('maritalStatus', patientRecord.maritalStatus);
      setValue('bloodGroup', patientRecord.bloodGroup);
      setValue('denomination', patientRecord.denomination);
      setValue('height', patientRecord.height);
    }
  }, [patientRecord]);

  const dispatch = useAppDispatch();

  const onSubmit = async (data: IPatientBasic): Promise<void> => {
    setIsLoading(true);
    const { payload } = await dispatch(updateRecord({ id: patientId, ...data }));
    toast(payload as Toast);
    if (!showErrorToast(payload)) {
      setEdit(false);
    }
    setIsLoading(false);
  };
  return (
    <>
      <CardFrame
        setEdit={setEdit}
        customTitle={
          <AvatarWithName
            firstName={patientWithRecord?.firstName ?? ''}
            lastName={patientWithRecord?.lastName ?? ''}
            imageSrc={patientWithRecord?.profilePicture ?? ''}
          />
        }
        showEmptyResults={false}
      >
        <div className="flex flex-col gap-7">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Marital Status</span>
            <span className="text-sm font-medium">
              {patientRecord?.maritalStatus ? capitalize(patientRecord?.maritalStatus) : '<Empty>'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Gender</span>
            <span className="text-sm font-medium">
              {patientWithRecord?.gender ? (
                <GenderBadge gender={patientWithRecord.gender} />
              ) : (
                '<Empty>'
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Date of Birth</span>
            <span className="text-sm font-medium">
              {patientWithRecord?.dob ? formatDateToDDMMYYYY(patientWithRecord.dob) : '<Empty>'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Denomination</span>
            <span className="text-sm font-medium">
              {patientRecord?.denomination ? capitalize(patientRecord.denomination) : '<Empty>'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Height</span>
            <span className="text-sm font-medium">{patientRecord?.height ?? '<Empty>'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Blood Group</span>
            <span className="text-sm font-medium">{patientRecord?.bloodGroup ?? '<Empty>'}</span>
          </div>
        </div>
      </CardFrame>
      <Drawer direction="right" open={edit}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm p-4">
            <DrawerHeader className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-lg">
                  Edit {patientWithRecord?.firstName} {patientWithRecord?.lastName}
                </DrawerTitle>
                <DrawerDescription>
                  Review the details of the new appointment request below.
                </DrawerDescription>
              </div>
            </DrawerHeader>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <SelectInput
                ref={register('maritalStatus').ref}
                control={control}
                options={maritalOptions}
                label="Marital Status"
                error={errors.maritalStatus?.message}
                name="maritalStatus"
                placeholder="Select Marital Status"
              />
              <SelectInput
                ref={register('denomination').ref}
                control={control}
                options={denominationOptions}
                label="Religious Denomination"
                error={errors.denomination?.message}
                name="denomination"
                placeholder="Select religion"
              />
              <Input
                labelName="Height (cm)"
                type="number"
                error={errors.height?.message}
                placeholder="Enter height in centimeters"
                {...register('height')}
                rightIcon={'cm'}
              />
              <SelectInput
                ref={register('bloodGroup').ref}
                control={control}
                options={bloodGroupOptions}
                label="Blood Group"
                error={errors.bloodGroup?.message}
                name="bloodGroup"
                placeholder="Select Blood Group"
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

export default PatientCard;
