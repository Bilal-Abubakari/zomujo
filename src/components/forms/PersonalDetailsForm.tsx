'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect } from '@/components/ui/multiSelect';
import MultiInputField from '@/components/multi-input-field/multiInputField';
import { specialties } from '@/constants/constants';
import React, { JSX, ReactNode } from 'react';
import { FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form';
import { DoctorPersonalInfo } from '@/types/doctor.interface';

interface PatientFormData {
  firstName: string;
  lastName: string;
  contact: string;
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
}
interface DoctorFormProps extends BaseFormProps {
  register: UseFormRegister<DoctorPersonalInfo>;
  errors: FieldErrors<DoctorPersonalInfo>;
  watch: UseFormWatch<DoctorPersonalInfo>;
  handleMultiInputChange: (key: keyof DoctorPersonalInfo, value: string[]) => void;
}
function BasicFields(props: {
  register: UseFormRegister<PatientFormData>;
  errors: FieldErrors<PatientFormData>;
  children?: ReactNode;
}): JSX.Element;
function BasicFields(props: {
  register: UseFormRegister<DoctorPersonalInfo>;
  errors: FieldErrors<DoctorPersonalInfo>;
  children?: ReactNode;
}): JSX.Element;
function BasicFields({
  register,
  errors,
  children,
}: Readonly<{
  register: UseFormRegister<PatientFormData> | UseFormRegister<DoctorPersonalInfo>;
  errors: FieldErrors<PatientFormData> | FieldErrors<DoctorPersonalInfo>;
  children?: ReactNode;
}>): JSX.Element {
  const isPatientForm =
    'firstName' in errors && !('experience' in (errors as Record<string, unknown>));

  if (isPatientForm) {
    const patientRegister = register as UseFormRegister<PatientFormData>;
    const patientErrors = errors as FieldErrors<PatientFormData>;

    return (
      <>
        <div className="flex-warp flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
          <Input
            labelName="First name"
            className="bg-transparent"
            placeholder="John"
            error={patientErrors.firstName?.message || ''}
            {...patientRegister('firstName')}
          />
          <Input
            labelName="Last name"
            className="bg-transparent"
            placeholder="Doe"
            error={patientErrors.lastName?.message || ''}
            {...patientRegister('lastName')}
          />
        </div>
        <div className="mt-8 flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
          <Input
            labelName="Phone Number"
            className="bg-transparent"
            placeholder="0208880000"
            error={patientErrors.contact?.message || ''}
            {...patientRegister('contact')}
          />
          {children}
        </div>
      </>
    );
  }
  const doctorRegister = register as UseFormRegister<DoctorPersonalInfo>;
  const doctorErrors = errors as FieldErrors<DoctorPersonalInfo>;

  return (
    <>
      <div className="flex-warp flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
        <Input
          labelName="First name"
          className="bg-transparent"
          placeholder="John"
          error={doctorErrors.firstName?.message || ''}
          {...doctorRegister('firstName')}
        />
        <Input
          labelName="Last name"
          className="bg-transparent"
          placeholder="Doe"
          error={doctorErrors.lastName?.message || ''}
          {...doctorRegister('lastName')}
        />
      </div>
      <div className="mt-8 flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
        <Input
          labelName="Phone Number"
          className="bg-transparent"
          placeholder="0208880000"
          error={doctorErrors.contact?.message || ''}
          {...doctorRegister('contact')}
        />
        {children}
      </div>
    </>
  );
}

interface SaveButtonProps {
  isLoading: boolean;
  isValid: boolean;
  hasChanges: boolean;
}
const SaveButton = ({ isLoading, isValid, hasChanges }: SaveButtonProps): JSX.Element => (
  <Button
    child="Save Changes"
    className="me:mb-0 my-[15px] mb-24 ml-auto flex"
    isLoading={isLoading}
    disabled={!isValid || isLoading || !hasChanges}
  />
);

interface DoctorFieldsProps {
  register: UseFormRegister<DoctorPersonalInfo>;
  errors: FieldErrors<DoctorPersonalInfo>;
  watch: UseFormWatch<DoctorPersonalInfo>;
  handleMultiInputChange: (key: keyof DoctorPersonalInfo, value: string[]) => void;
}
const DoctorFields = ({
  register,
  errors,
  watch,
  handleMultiInputChange,
}: DoctorFieldsProps): JSX.Element => (
  <>
    {/*TODO: Removing education for now*/}
    {/*<div className="mt-8 flex flex-wrap items-baseline gap-8 sm:flex-nowrap">*/}
    {/*  <div className="w-full max-w-[384px]">*/}
    {/*    <Input*/}
    {/*      labelName="School attended"*/}
    {/*      className="bg-transparent"*/}
    {/*      placeholder="University of Ghana"*/}
    {/*      error={errors.education?.school?.message || ''}*/}
    {/*      type="text"*/}
    {/*      {...register('education.school')}*/}
    {/*    />*/}
    {/*  </div>*/}
    {/*  <div className="w-full max-w-[384px]">*/}
    {/*    <Input*/}
    {/*      labelName="Certificate acquired"*/}
    {/*      className="bg-transparent"*/}
    {/*      placeholder="Bachelor of Medicine and Bachelor of Surgery"*/}
    {/*      error={errors.education?.degree?.message || ''}*/}
    {/*      type="text"*/}
    {/*      {...register('education.degree')}*/}
    {/*    />*/}
    {/*  </div>*/}
    {/*</div>*/}
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
      <div className="mt-2 w-full max-w-[384px]">
        <MultiInputField
          ref={register('languages').ref}
          handleValueChange={(value) => handleMultiInputChange('languages', value)}
          errors={errors.languages}
          label="Languages"
          placeholder="English"
          defaultValues={watch('languages')}
        />
      </div>
    </div>
    <div className="mt-8 max-w-[384px] items-baseline">
      <Textarea
        labelName=" Bio (This is what your patients will see)"
        className="w-full resize-none bg-transparent"
        error={errors.bio?.message || ''}
        {...register('bio')}
      />
    </div>
  </>
);

const PatientPersonalDetailsForm = ({
  register,
  errors,
  isLoading,
  isValid,
  hasChanges,
  onSubmit,
}: PatientFormProps): JSX.Element => (
  <form className="pb-20" onSubmit={onSubmit}>
    <BasicFields register={register} errors={errors} />
    <SaveButton isLoading={isLoading} isValid={isValid} hasChanges={hasChanges} />
  </form>
);

const DoctorPersonalDetailsForm = ({
  register,
  errors,
  watch,
  isLoading,
  isValid,
  hasChanges,
  onSubmit,
  handleMultiInputChange,
}: DoctorFormProps): JSX.Element => (
  <form className="pb-20" onSubmit={onSubmit}>
    <BasicFields register={register} errors={errors}>
      <Input
        labelName="Experience"
        className="bg-transparent"
        placeholder="5"
        error={errors.experience?.message || ''}
        type="number"
        {...register('experience')}
      />
    </BasicFields>
    <DoctorFields
      register={register}
      errors={errors}
      watch={watch}
      handleMultiInputChange={handleMultiInputChange}
    />
    <SaveButton isLoading={isLoading} isValid={isValid} hasChanges={hasChanges} />
  </form>
);

function PersonalDetailsForm(props: PatientFormProps): JSX.Element;
function PersonalDetailsForm(props: DoctorFormProps): JSX.Element;
function PersonalDetailsForm(props: PatientFormProps | DoctorFormProps): JSX.Element {
  if ('handleMultiInputChange' in props) {
    return <DoctorPersonalDetailsForm {...props} />;
  }
  return <PatientPersonalDetailsForm {...props} />;
}

export default PersonalDetailsForm;
