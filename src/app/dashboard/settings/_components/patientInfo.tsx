'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MODE } from '@/constants/constants';
import { toast } from '@/hooks/use-toast';
import { selectExtra } from '@/lib/features/auth/authSelector';
import { updatePatient } from '@/lib/features/patients/patientsThunk';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { nameSchema, phoneNumberSchema } from '@/schemas/zod.schemas';
import { IPatient } from '@/types/patient.interface';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { JSX, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import useImageUpload from '@/hooks/useImageUpload';
import { useProfilePictureUpload } from '@/hooks/useProfilePictureUpload';
import { isEqual } from 'lodash';
import ProfilePictureUpload from '@/components/profile/ProfilePictureUpload';
import PersonalDetailsForm from '@/components/forms/PersonalDetailsForm';
import { capitalize } from '@/lib/utils';
import PatientConsultationHistory from '@/app/dashboard/(doctor)/_components/PatientConsultationHistory';
import ConsultationViewModal from '@/app/dashboard/(doctor)/_components/ConsultationViewSheet';

const PatientPersonalInfoSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  contact: phoneNumberSchema,
  profilePicture: z.string().optional(),
});
type PatientPersonalInfo = z.infer<typeof PatientPersonalInfoSchema>;
const PatientInfo = (): JSX.Element => {
  const personalDetails = useAppSelector(selectExtra) as IPatient;
  const patientId = personalDetails?.id;
  const [showConsultationSheet, setShowConsultationSheet] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  const handleViewConsultation = (appointmentId: string): void => {
    setSelectedAppointmentId(appointmentId);
    setShowConsultationSheet(true);
  };

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
  const { handleProfilePictureChange, isUploading: isUploadingProfilePicture } =
    useProfilePictureUpload({ handleImageChange });
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
    const formattedPatientInfo = {
      ...patientInfo,
      firstName: capitalize(patientInfo.firstName.trim()),
      lastName: capitalize(patientInfo.lastName.trim()),
    };
    const payload = await dispatch(updatePatient(formattedPatientInfo)).unwrap();
    toast(payload);
    setIsLoading(false);
  }

  return (
    <Tabs defaultValue="personal-details" className="w-full">
      <TabsList className="mx-auto grid w-1/2 grid-cols-2 rounded-2xl">
        <TabsTrigger value="personal-details" className="rounded-2xl">
          Personal Details
        </TabsTrigger>
        <TabsTrigger value="consultation-history" className="rounded-2xl">
          Consultation History
        </TabsTrigger>
      </TabsList>

      <TabsContent value="personal-details">
        <ProfilePictureUpload
          userProfilePicture={userProfilePicture}
          imageRef={imageRef}
          handleImageChange={handleProfilePictureChange}
          resetImage={resetImage}
          isUploading={isUploadingProfilePicture}
        />
        <hr className="my-7.5" />
        <PersonalDetailsForm
          register={register}
          errors={errors}
          isLoading={isLoading}
          isValid={isValid}
          hasChanges={hasChanges}
          onSubmit={handleSubmit(onSubmit)}
        />
      </TabsContent>

      <TabsContent value="consultation-history">
        <div className="py-8">
          <PatientConsultationHistory
            patientId={patientId || ''}
            onViewConsultation={handleViewConsultation}
          />
        </div>
        <ConsultationViewModal
          open={showConsultationSheet}
          onOpenChange={setShowConsultationSheet}
          appointmentId={selectedAppointmentId}
        />
      </TabsContent>
    </Tabs>
  );
};
export default PatientInfo;
