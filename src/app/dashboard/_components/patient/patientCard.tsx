import { IPatientBasic } from '@/types/patient.interface';
import React, { JSX, useState } from 'react';
import { AvatarWithName } from '@/components/ui/avatar';
import { capitalize } from '@/lib/utils';
import GenderBadge from '@/app/dashboard/_components/genderBadge';
import { formatDateToDDMMYYYY } from '@/lib/date';
import { Button } from '@/components/ui/button';
import { FilePenLine } from 'lucide-react';
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
  selectGenderOptions,
  MODE,
  maritalOptions,
  denominationOptions,
  bloodGroupOptions,
} from '@/constants/constants';
import { z } from 'zod';
import { BloodGroup, Denomination, Gender, MaritalStatus } from '@/types/shared.enum';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { useAppSelector } from '@/lib/hooks';
import { selectPatientWithRecord } from '@/lib/features/patients/patientsSelector';

const patientBasicSchema = z.object({
  gender: z.nativeEnum(Gender),
  dob: z.date(),
  denomination: z.nativeEnum(Denomination).optional(),
  height: z.number().gte(0).optional(),
  bloodGroup: z.nativeEnum(BloodGroup).optional(),
  maritalStatus: z.nativeEnum(MaritalStatus).optional(),
});

const PatientCard = (): JSX.Element => {
  const patientWithRecord = useAppSelector(selectPatientWithRecord);
  const {
    register,
    control,
    formState: { errors },
  } = useForm<IPatientBasic>({
    resolver: zodResolver(patientBasicSchema),
    mode: MODE.ON_TOUCH,
    defaultValues: patientWithRecord,
  });
  const [edit, setEdit] = useState(false);
  return (
    <>
      <div className="flex w-full max-w-sm flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-[0px_1px_2px_0px_#0F172A0F]">
        <div className="flex flex-row items-center justify-between">
          <div className="flex w-full justify-between">
            <AvatarWithName
              firstName={patientWithRecord?.firstName ?? ''}
              lastName={patientWithRecord?.lastName ?? ''}
              imageSrc={patientWithRecord?.profilePicture ?? ''}
            />
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
        </div>
        <hr className="my-4 border-gray-300" />
        <div className="flex flex-col gap-7">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Marital Status</span>
            <span className="text-sm font-medium">
              {patientWithRecord?.maritalStatus
                ? capitalize(patientWithRecord.maritalStatus)
                : '<Empty>'}
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
              {patientWithRecord?.denomination
                ? capitalize(patientWithRecord.denomination)
                : '<Empty>'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Height</span>
            <span className="text-sm font-medium">
              {patientWithRecord?.record.height ?? '<Empty>'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Blood Group</span>
            <span className="text-sm font-medium">
              {patientWithRecord?.record.bloodGroup
                ??
                '<Empty>'}
            </span>
          </div>
        </div>
      </div>
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
            <form className="space-y-4">
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
                ref={register('gender').ref}
                control={control}
                options={selectGenderOptions}
                label="Gender"
                error={errors.gender?.message}
                name="gender"
                placeholder="Select Gender"
              />
              <Input
                labelName="Date of Birth"
                type="date"
                error={errors.dob?.message || ''}
                placeholder="Enter date of birth"
                {...register('dob')}
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
                labelName="Height"
                type="number"
                error={errors.height?.message || ''}
                placeholder="Enter height"
                {...register('height')}
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
                <Button child="Save" type="submit" />
                <Button
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
