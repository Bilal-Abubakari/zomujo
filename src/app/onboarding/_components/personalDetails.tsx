import { InfoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mdcNumberSchema, phoneNumberSchema, requiredStringSchema } from '@/schemas/zod.schemas';
import { z } from 'zod';
import { SelectInput } from '@/components/ui/select';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updatePersonalDetails } from '@/lib/features/auth/authSlice';
import { IPersonalDetails } from '@/types/auth.interface';
import { genderOptions, MODE } from '@/constants/constants';
import { maxDate } from '@/lib/date';
import { JSX } from 'react';
import { Gender } from '@/types/shared.enum';

const PersonalDetailsSchema = z.object({
  MDCRegistration: mdcNumberSchema,
  dob: requiredStringSchema(),
  contact: phoneNumberSchema,
  gender: z.enum(Gender),
});

const PersonalDetails = (): JSX.Element => {
  const personalDetails = useAppSelector(
    ({ authentication }) => authentication.doctorPersonalDetails,
  );
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<IPersonalDetails>({
    resolver: zodResolver(PersonalDetailsSchema),
    mode: MODE.ON_TOUCH,
    defaultValues: personalDetails,
  });
  const dispatch = useAppDispatch();

  const onSubmit = (personalDetails: IPersonalDetails): void => {
    dispatch(updatePersonalDetails(personalDetails));
  };

  return (
    <form className="flex w-full flex-col gap-11" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex w-full flex-col gap-1.5">
        <p className="flex flex-row items-center gap-3 text-2xl leading-8 font-bold sm:text-[32px]">
          <span>Personal Details</span>
          <span>
            <InfoIcon size={16} />
          </span>
        </p>
        <p className="text-grayscale-medium text-sm leading-6 sm:text-base">
          Provide your personal details for a personalized Zyptyk experience tailored to your
          preferences.
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-x-8 gap-y-[28px] sm:grid-cols-2">
        <div>
          <Input
            labelName="MDC Registration Number"
            type="text"
            error={errors.MDCRegistration?.message || ''}
            placeholder="MDC/PN/12345"
            {...register('MDCRegistration')}
          />
        </div>
        <div>
          <Input
            labelName="Date of Birth"
            type="date"
            error={errors.dob?.message || ''}
            max={maxDate()}
            placeholder="MDC/PN/12345"
            {...register('dob')}
          />
        </div>
        <div>
          <Input
            labelName="Phone Number"
            type="tel"
            error={errors.contact?.message || ''}
            placeholder="0555345678"
            {...register('contact')}
          />
        </div>
        <div>
          <SelectInput
            control={control}
            label="Gender"
            ref={register('gender').ref}
            error={errors.gender?.message}
            options={genderOptions.slice(0, -1)}
            name="gender"
            placeholder="Select your Gender"
          />
        </div>
      </div>
      <Button disabled={!isValid} child={'Continue'} />
    </form>
  );
};

export default PersonalDetails;
