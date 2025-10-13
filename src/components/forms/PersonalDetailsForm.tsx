'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect } from '@/components/ui/multiSelect';
import MultiInputField from '@/components/multi-input-field/multiInputField';
import { specialties } from '@/constants/constants';
import React, { JSX } from 'react';
import { FieldErrors, UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
interface BaseFormData {
  firstName: string;
  lastName: string;
  contact: string;
}
interface PatientFormData extends BaseFormData {}
interface DoctorFormData extends BaseFormData {
  experience?: number;
  education?: {
    school: string;
    degree: string;
  };
  specializations?: string[];
  languages?: string[];
  bio?: string;
}
type FormData = PatientFormData | DoctorFormData;
interface PersonalDetailsFormProps<T extends FormData> {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  isLoading: boolean;
  isValid: boolean;
  hasChanges: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  formType: 'patient' | 'doctor';
  handleMultiInputChange?: (key: keyof T, value: string[]) => void;
}
const PersonalDetailsForm = <T extends FormData>({
  register,
  errors,
  watch,
  setValue,
  isLoading,
  isValid,
  hasChanges,
  onSubmit,
  formType,
  handleMultiInputChange,
}: PersonalDetailsFormProps<T>): JSX.Element => {
  const isDoctor = formType === 'doctor';
  return (
    <form className="pb-20" onSubmit={onSubmit}>
      {/* First Name and Last Name */}
      <div className="flex-warp flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
        <Input
          labelName="First name"
          className="bg-transparent"
          placeholder="John"
          error={(errors as any).firstName?.message || ''}
          {...register('firstName' as any)}
        />
        <Input
          labelName="Last name"
          className="bg-transparent"
          placeholder="Doe"
          error={(errors as any).lastName?.message || ''}
          {...register('lastName' as any)}
        />
      </div>
      {/* Phone Number and Experience (for doctors) */}
      <div className="mt-8 flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
        <Input
          labelName="Phone Number"
          className="bg-transparent"
          placeholder="0208880000"
          error={(errors as any).contact?.message || ''}
          {...register('contact' as any)}
        />
        {isDoctor && (
          <Input
            labelName="Experience"
            className="bg-transparent"
            placeholder="5"
            error={(errors as any).experience?.message || ''}
            type="number"
            {...register('experience' as any)}
          />
        )}
      </div>
      {/* Education fields (for doctors) */}
      {isDoctor && (
        <div className="mt-8 flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
          <div className="w-full max-w-[384px]">
            <Input
              labelName="School attended"
              className="bg-transparent"
              placeholder="University of Ghana"
              error={(errors as any).education?.school?.message || ''}
              type="text"
              {...register('education.school' as any)}
            />
          </div>
          <div className="w-full max-w-[384px]">
            <Input
              labelName="Certificate acquired"
              className="bg-transparent"
              placeholder="Bachelor of Medicine and Bachelor of Surgery"
              error={(errors as any).education?.degree?.message || ''}
              type="text"
              {...register('education.degree' as any)}
            />
          </div>
        </div>
      )}
      {/* Specializations (for doctors) */}
      {isDoctor && (
        <div className="mt-8 flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
          <div className="w-full max-w-[384px]">
            <MultiSelect
              labelName="Specialization"
              options={specialties}
              defaultValue={(watch as any)('specializations')}
              placeholder="Select specializations"
              ref={register('specializations' as any).ref}
              onValueChange={(value) =>
                handleMultiInputChange?.('specializations' as keyof T, value)
              }
              animation={2}
              error={(errors as any).specializations?.message || ''}
            />
          </div>
        </div>
      )}
      {/* Languages (for doctors) */}
      {isDoctor && (
        <div className="mt-2 w-full max-w-[384px]">
          <MultiInputField
            ref={register('languages' as any).ref}
            handleValueChange={(value) => handleMultiInputChange?.('languages' as keyof T, value)}
            error={(errors as any).languages?.message || ''}
            label="Languages"
            placeholder="English"
            defaultValues={(watch as any)('languages')}
          />
        </div>
      )}
      {/* Bio (for doctors) */}
      {isDoctor && (
        <div className="mt-8 max-w-[384px] items-baseline">
          <Textarea
            labelName=" Bio (This is what your patients will see)"
            className="w-full resize-none bg-transparent"
            error={(errors as any).bio?.message || ''}
            {...register('bio' as any)}
          />
        </div>
      )}
      {/* Save Button */}
      <Button
        child="Save Changes"
        className="me:mb-0 my-[15px] mb-24 ml-auto flex"
        isLoading={isLoading}
        disabled={!isValid || isLoading || !hasChanges}
      />
    </form>
  );
};
export default PersonalDetailsForm;
