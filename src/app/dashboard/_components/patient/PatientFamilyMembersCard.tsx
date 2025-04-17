import React, { JSX, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FilePenLine, Trash2 } from 'lucide-react';
import { AvatarComp } from '@/components/ui/avatar';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectFamilyMembers } from '@/lib/features/patients/patientsSelector';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useForm } from 'react-hook-form';
import { IFamilyMember } from '@/types/patient.interface';
import { zodResolver } from '@hookform/resolvers/zod';
import { familyRelationOptions, familyRelations, MODE, phoneRegex } from '@/constants/constants';
import { z } from 'zod';
import { fileSchema } from '@/schemas/zod.schemas';
import { Input } from '@/components/ui/input';
import { SelectInput } from '@/components/ui/select';
import Image from 'next/image';
import useImageUpload from '@/hooks/useImageUpload';
import { addFamilyMember } from '@/lib/features/records/recordsThunk';
import { showErrorToast } from '@/lib/utils';
import { Toast, toast } from '@/hooks/use-toast';

const familyMembersSchema = z.object({
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(phoneRegex, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  image: fileSchema.optional(),
  relation: z.enum(familyRelations),
});

type PatientFamilyMembersCardProps = {
  recordId?: string;
};

const PatientFamilyMembersCard = ({ recordId }: PatientFamilyMembersCardProps): JSX.Element => {
  const familyMembers = useAppSelector(selectFamilyMembers);
  const [isLoading, setIsLoading] = useState(false);
  const {
    formState: { isValid, errors },
    handleSubmit,
    reset,
    control,
    register,
    setValue,
  } = useForm<IFamilyMember<File>>({
    resolver: zodResolver(familyMembersSchema),
    mode: MODE.ON_TOUCH,
  });
  const {
    imageRef,
    imageUrl: familyMemberPicture,
    handleImageChange,
    resetImage,
  } = useImageUpload<IFamilyMember<File>>({
    setValue,
    fieldName: 'image',
  });
  const dispatch = useAppDispatch();
  const [edit, setEdit] = useState(false);

  const onSubmit = async (familyMember: IFamilyMember<File>): Promise<void> => {
    if (recordId) {
      setIsLoading(true);
      const { payload } = await dispatch(
        addFamilyMember({
          ...familyMember,
          recordId,
        }),
      );
      if (!showErrorToast(payload)) {
        setEdit(false);
        reset();
      }
      toast(payload as Toast);
      setIsLoading(false);
    }
  };
  return (
    <>
      <div className="flex w-full max-w-sm flex-col rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-row items-center justify-between">
          <p className="font-bold">Family Members</p>
          <Button
            variant="outline"
            onClick={() => setEdit(true)}
            child={
              <>
                <FilePenLine />
                Add
              </>
            }
          />
        </div>
        <hr className="my-4" />
        {familyMembers?.length === 0 ? (
          <div className="flex h-40 items-center justify-center">No family members found</div>
        ) : (
          <div className="max-h-[360px] space-y-4 overflow-y-scroll">
            {familyMembers?.map(({ lastName, firstName, phone, relation, image, email }, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 rounded-xl bg-gradient-to-b from-[#E0EEFF] to-[#F2F9FF] p-4"
              >
                <AvatarComp
                  name={`${firstName} ${lastName}`}
                  imageSrc={image}
                  imageAlt={`${firstName} ${lastName}`}
                />
                <div>
                  <h4 className="font-semibold">
                    {firstName} {lastName}
                  </h4>
                  <p className="text-sm">{relation}</p>
                  <p className="text-xs text-gray-500">{email}</p>
                  <p className="text-xs text-gray-500">{phone}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Drawer direction="right" open={edit}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm p-4">
            <DrawerHeader className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-lg">Add Family Member</DrawerTitle>
                <DrawerDescription>Add a new family member to records</DrawerDescription>
              </div>
            </DrawerHeader>
            <div className="my-2 text-sm">Upload Family member&#39;s image (optional)</div>
            <div className="mb-4 flex items-center justify-start gap-2">
              <div>
                {familyMemberPicture ? (
                  <Image
                    className="h-[79px] w-[79px] rounded-full bg-gray-600 object-fill"
                    src={familyMemberPicture}
                    alt="Family member Picture"
                    width={79}
                    height={79}
                  />
                ) : (
                  <div className="flex h-[79px] w-[79px] items-center justify-center rounded-full bg-gray-200">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
                <input className="hidden" ref={imageRef} type="file" onChange={handleImageChange} />
              </div>
              <Button
                child={'Upload image'}
                variant={'outline'}
                className="bg-transparent"
                onClick={() => imageRef.current?.click()}
              />
              {familyMemberPicture && (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                  <Trash2 size={16} onClick={resetImage} />
                </div>
              )}
            </div>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <Input
                  labelName="First Name"
                  placeholder="Enter first name of family member"
                  error={errors.firstName?.message || ''}
                  {...register('firstName')}
                />
                <Input
                  labelName="Last Name"
                  placeholder="Enter last name of family member"
                  error={errors.lastName?.message || ''}
                  {...register('lastName')}
                />
                <Input
                  labelName="Email (optional)"
                  placeholder="Enter email of family member"
                  type="email"
                  error={errors.email?.message || ''}
                  {...register('email')}
                />
                <SelectInput
                  ref={register('relation').ref}
                  control={control}
                  options={familyRelationOptions}
                  label="Relationship"
                  error={errors.relation?.message}
                  name="relation"
                  placeholder="Select your relationship with family member"
                />
                <Input
                  labelName="Phone Number (optional)"
                  placeholder="Enter phone number of family member"
                  error={errors.phone?.message || ''}
                  {...register('phone')}
                />
              </div>
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
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};
export default PatientFamilyMembersCard;
