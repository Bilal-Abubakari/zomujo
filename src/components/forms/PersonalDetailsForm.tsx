'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect } from '@/components/ui/multiSelect';
import MultiInputField from '@/components/multi-input-field/multiInputField';
import { specialties } from '@/constants/constants';
import React, { JSX } from 'react';
import { FieldErrors, UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
interface PatientFormData {
  firstName: string;
  lastName: string;
  contact: string;
}
interface DoctorFormData {
  firstName: string;
  lastName: string;
  contact: string;
  experience: number;
  education: {
    school: string;
    degree: string;
  };
  specializations: string[];
  languages: string[];
  bio: string;
}
interface BaseFormProps {
  isLoading: boolean;
  isValid: boolean;
  hasChanges: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}
interface PatientFormProps extends BaseFormProps {
  register: UseFormRegister<PatientFormData>;
  errors: FieldErrors<PatientFormData>;
  watch: UseFormWatch<PatientFormData>;
  setValue: UseFormSetValue<PatientFormData>;
}
interface DoctorFormProps extends BaseFormProps {
  register: UseFormRegister<DoctorFormData>;
  errors: FieldErrors<DoctorFormData>;
  watch: UseFormWatch<DoctorFormData>;
  setValue: UseFormSetValue<DoctorFormData>;
  handleMultiInputChange: (key: keyof DoctorFormData, value: string[]) => void;
}
const PatientPersonalDetailsForm = ({
  register,
  errors,
  watch,
  setValue,
  isLoading,
  isValid,
  hasChanges,
  onSubmit,
}: PatientFormProps): JSX.Element => {
  return (
    <form className="pb-20" onSubmit={onSubmit}>
      <div className="flex-warp flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
        <Input
          labelName="First name"
          className="bg-transparent"
          placeholder="John"
          error={errors.firstName?.message || ''}
          {...register('firstName')}
        />
        <Input
          labelName="Last name"
          className="bg-transparent"
          placeholder="Doe"
          error={errors.lastName?.message || ''}
          {...register('lastName')}
        />
      </div>
      <div className="mt-8 flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
        <Input
          labelName="Phone Number"
          className="bg-transparent"
          placeholder="0208880000"
          error={errors.contact?.message || ''}
          {...register('contact')}
        />
      </div>
      <Button
        child="Save Changes"
        className="me:mb-0 my-[15px] mb-24 ml-auto flex"
        isLoading={isLoading}
        disabled={!isValid || isLoading || !hasChanges}
      />
    </form>
  );
};
// Doctor form component
const DoctorPersonalDetailsForm = ({
  register,
  errors,
  watch,
  setValue,
  isLoading,
  isValid,
  hasChanges,
  onSubmit,
  handleMultiInputChange,
}: DoctorFormProps): JSX.Element => {
  return (
    <form className="pb-20" onSubmit={onSubmit}>
      <div className="flex-warp flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
        <Input
          labelName="First name"
          className="bg-transparent"
          placeholder="John"
          error={errors.firstName?.message || ''}
          {...register('firstName')}
        />
        <Input
          labelName="Last name"
          className="bg-transparent"
          placeholder="Doe"
          error={errors.lastName?.message || ''}
          {...register('lastName')}
        />
      </div>
      <div className="mt-8 flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
        <Input
          labelName="Phone Number"
          className="bg-transparent"
          placeholder="0208880000"
          error={errors.contact?.message || ''}
          {...register('contact')}
        />
        <Input
          labelName="Experience"
          className="bg-transparent"
          placeholder="5"
          error={errors.experience?.message || ''}
          type="number"
          {...register('experience')}
        />
      </div>
      <div className="mt-8 flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
        <div className="w-full max-w-[384px]">
          <Input
            labelName="School attended"
            className="bg-transparent"
            placeholder="University of Ghana"
            error={errors.education?.school?.message || ''}
            type="text"
            {...register('education.school')}
          />
        </div>
        <div className="w-full max-w-[384px]">
          <Input
            labelName="Certificate acquired"
            className="bg-transparent"
            placeholder="Bachelor of Medicine and Bachelor of Surgery"
            error={errors.education?.degree?.message || ''}
            type="text"
            {...register('education.degree')}
          />
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
        <div className="w-full max-w-[384px]">
          <MultiSelect
            labelName="Specialization"
            options={specialties}
            defaultValue={watch('specializations')}
            placeholder="Select specializations"
            ref={register('specializations').ref}
            onValueChange={(value) => handleMultiInputChange('specializations', value)}
            animation={2}
            error={errors.specializations?.message || ''}
          />
        </div>
      </div>
      <div className="mt-2 w-full max-w-[384px]">
        <MultiInputField
          ref={register('languages').ref}
          handleValueChange={(value) => handleMultiInputChange('languages', value)}
          error={errors.languages?.message || ''}
          label="Languages"
          placeholder="English"
          defaultValues={watch('languages')}
        />
      </div>
      <div className="mt-8 max-w-[384px] items-baseline">
        <Textarea
          labelName=" Bio (This is what your patients will see)"
          className="w-full resize-none bg-transparent"
          error={errors.bio?.message || ''}
          {...register('bio')}
        />
      </div>
      <Button
        child="Save Changes"
        className="me:mb-0 my-[15px] mb-24 ml-auto flex"
        isLoading={isLoading}
        disabled={!isValid || isLoading || !hasChanges}
      />
    </form>
  );
};
function PersonalDetailsForm(props: PatientFormProps): JSX.Element;
function PersonalDetailsForm(props: DoctorFormProps): JSX.Element;
function PersonalDetailsForm(props: PatientFormProps | DoctorFormProps): JSX.Element {
  if ('handleMultiInputChange' in props) {
    return <DoctorPersonalDetailsForm {...props} />;
  }
  return <PatientPersonalDetailsForm {...props} />;
}
export default PersonalDetailsForm;
