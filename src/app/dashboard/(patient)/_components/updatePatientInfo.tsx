import React, { JSX, useState } from 'react';
import { useForm } from 'react-hook-form';
import { IPatientMandatory } from '@/types/patient.interface';
import { zodResolver } from '@hookform/resolvers/zod';
import { MODE, selectGenderOptions } from '@/constants/constants';
import { z } from 'zod';
import { Gender } from '@/types/shared.enum';
import { SelectInput } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppDispatch } from '@/lib/hooks';
import { updatePatient } from '@/lib/features/patients/patientsThunk';
import { Toast, toast } from '@/hooks/use-toast';

const patientMandatorySchema = z.object({
  gender: z.enum(Gender),
  dob: z.string().transform((value) => new Date(value).toISOString()),
});

const UpdatePatientInfo = (): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<IPatientMandatory>({
    resolver: zodResolver(patientMandatorySchema),
    mode: MODE.ON_TOUCH,
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
        We need a little extra information from you. Shouldn&#39;t take long. Thank you for your
        patience{' '}
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
        <Button isLoading={isLoading} disabled={!isValid || isLoading} child="Save" type="submit" />
      </form>
    </div>
  );
};

export default UpdatePatientInfo;
