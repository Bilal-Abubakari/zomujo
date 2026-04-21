import React, { JSX, useState } from 'react';
import { useForm } from 'react-hook-form';
import { IPatientMandatory, IPatient } from '@/types/patient.interface';
import { zodResolver } from '@hookform/resolvers/zod';
import { MODE, selectGenderOptions } from '@/constants/constants';
import { z } from 'zod';
import { Gender } from '@/types/shared.enum';
import { SelectInput } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updatePatient } from '@/lib/features/patients/patientsThunk';
import { Toast, toast } from '@/hooks/use-toast';
import { selectExtra } from '@/lib/features/auth/authSelector';

const patientMandatorySchema = z.object({
  gender: z.enum(Gender),
  dob: z
    .string()
    .min(1, { message: 'Please select a valid date of birth' })
    .refine(
      (value) => {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate < today;
      },
      { message: 'Date of birth cannot be today or in the future' },
    )
    .transform((value) => new Date(value).toISOString()),
  contact: z
    .string()
    .min(1, { message: 'Please enter a contact number' })
    .regex(/^\+?[0-9\s\-().]{7,20}$/, { message: 'Please enter a valid contact number' }),
});

const UpdatePatientInfo = (): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const extra = useAppSelector(selectExtra) as IPatient;
  const existingGender = extra?.gender;
  const existingDob = extra?.dob ? new Date(extra.dob).toISOString().split('T')[0] : undefined;
  const existingContact = extra?.contact;
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<IPatientMandatory>({
    resolver: zodResolver(patientMandatorySchema),
    mode: MODE.ON_TOUCH,
    defaultValues: {
      gender: existingGender,
      dob: existingDob,
      contact: existingContact,
    },
  });

  const onSubmit = async (patientInfo: IPatientMandatory): Promise<void> => {
    setIsLoading(true);
    const { payload } = await dispatch(updatePatient(patientInfo));
    toast(payload as Toast);
    setIsLoading(false);
  };
  return (
    <div>
      <span className="text-lg font-bold">Update Your Information</span>
      <p className="text-sm text-gray-600">
        This information helps your doctor provide better care during your consultation. They need
        your age, gender, and contact to proceed. It won&#39;t take long.
      </p>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <SelectInput
          ref={register('gender').ref}
          control={control}
          options={selectGenderOptions}
          label="Gender"
          error={errors.gender?.message}
          name="gender"
          placeholder="Select your gender"
        />
        <Input
          labelName="Date of Birth"
          type="date"
          error={errors.dob?.message || ''}
          placeholder="Enter your date of birth"
          {...register('dob')}
        />
        <Input
          labelName="Contact Number"
          type="tel"
          error={errors.contact?.message || ''}
          placeholder="Enter your contact number"
          {...register('contact')}
        />
        <Button isLoading={isLoading} disabled={!isValid || isLoading} child="Save" type="submit" />
      </form>
    </div>
  );
};

export default UpdatePatientInfo;
