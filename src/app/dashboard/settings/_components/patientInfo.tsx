'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MODE } from '@/constants/constants';
import { Toast, toast } from '@/hooks/use-toast';
import { selectExtra } from '@/lib/features/auth/authSelector';
import { selectRecordId } from '@/lib/features/patients/patientsSelector';
import { updatePatient } from '@/lib/features/patients/patientsThunk';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { nameSchema, phoneNumberSchema } from '@/schemas/zod.schemas';
import { IPatient } from '@/types/patient.interface';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { JSX, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import useImageUpload from '@/hooks/useImageUpload';
import { isEqual } from 'lodash';
import PatientCard from '@/app/dashboard/_components/patient/patientCard';
import PatientVitalsCard from '@/app/dashboard/_components/patient/patientVitalsCard';
import PatientConditionsCard from '@/app/dashboard/_components/patient/patientConditionsCard';
import PatientSurgeriesCard from '@/app/dashboard/_components/patient/patientSurgeriesCard';
import PatientFamilyMembersCard from '@/app/dashboard/_components/patient/PatientFamilyMembersCard';
import PatientLifestyleCard from '@/app/dashboard/_components/patient/patientLifestyleCard';
import PatientAllergiesCard from '@/app/dashboard/_components/patient/patientAllergiesCard';
import ProfilePictureUpload from '@/components/profile/ProfilePictureUpload';
import PersonalDetailsForm from '@/components/forms/PersonalDetailsForm';
const PatientPersonalInfoSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  contact: phoneNumberSchema,
  profilePicture: z.string().optional(),
});
type PatientPersonalInfo = z.infer<typeof PatientPersonalInfoSchema>;
const PatientInfo = (): JSX.Element => {
  const personalDetails = useAppSelector(selectExtra) as IPatient;
  const recordId = useAppSelector(selectRecordId);
  const getFormDataFromPersonalDetails = (details: IPatient | null): PatientPersonalInfo => ({
    firstName: details?.firstName || '',
    lastName: details?.lastName || '',
    contact: details?.contact || '',
    profilePicture: details?.profilePicture || '',
  });
  const defaultFormData = useMemo(
    () => getFormDataFromPersonalDetails(personalDetails),
    [personalDetails],
  );
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<PatientPersonalInfo>({
    resolver: zodResolver(PatientPersonalInfoSchema),
    mode: MODE.ON_TOUCH,
    defaultValues: defaultFormData,
  });
  const {
    imageRef,
    imageUrl: userProfilePicture,
    handleImageChange,
    resetImage,
  } = useImageUpload<PatientPersonalInfo>({
    setValue,
    defaultImageUrl: personalDetails?.profilePicture,
  });
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const currentFormData = watch();
  const currentFormDataWithImage = useMemo(
    () => ({
      ...currentFormData,
      profilePicture: userProfilePicture || '',
    }),
    [currentFormData, userProfilePicture],
  );
  const hasChanges = useMemo(
    () => !isEqual(defaultFormData, currentFormDataWithImage),
    [defaultFormData, currentFormDataWithImage],
  );
  async function onSubmit(patientInfo: PatientPersonalInfo): Promise<void> {
    setIsLoading(true);
    const { payload } = await dispatch(updatePatient(patientInfo));
    if (payload) {
      const toastData = payload as Toast;
      toast(toastData);
    }
    setIsLoading(false);
  }
  return (
    <Tabs defaultValue="personal-details" className="w-full">
      <TabsList className="mx-auto grid w-1/2 grid-cols-2 rounded-2xl">
        <TabsTrigger value="personal-details" className="rounded-2xl">
          Personal Details
        </TabsTrigger>
        <TabsTrigger value="records" className="rounded-2xl">
          Records
        </TabsTrigger>
      </TabsList>

      <TabsContent value="personal-details">
        <ProfilePictureUpload
          userProfilePicture={userProfilePicture}
          imageRef={imageRef as React.RefObject<HTMLInputElement | null>}
          handleImageChange={handleImageChange}
          resetImage={resetImage}
        />
        <hr className="my-[30px]" />
        <PersonalDetailsForm
          register={register}
          errors={errors}
          isLoading={isLoading}
          isValid={isValid}
          hasChanges={hasChanges}
          onSubmit={handleSubmit(onSubmit)}
        />
      </TabsContent>

      <TabsContent value="records">
        <div className="py-8">
          <h2 className="mb-6 text-2xl font-bold">Medical Records</h2>
          <div className="grid grid-cols-1 gap-4 justify-self-center md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
            <div className="space-y-4">
              <PatientCard />
              <PatientSurgeriesCard recordId={recordId} />
              <PatientAllergiesCard recordId={recordId} />
            </div>
            <div className="space-y-4">
              <PatientVitalsCard />
              <PatientFamilyMembersCard recordId={recordId} />
            </div>
            <div className="space-y-4">
              <PatientConditionsCard recordId={recordId} />
              <PatientLifestyleCard />
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
export default PatientInfo;
