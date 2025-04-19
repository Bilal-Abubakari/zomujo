import React, { JSX, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectAllergies } from '@/lib/features/patients/patientsSelector';
import CardFrame from '@/app/dashboard/_components/cardFrame';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useForm } from 'react-hook-form';
import { IAllergyWithoutId } from '@/types/patient.interface';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  allergyTypeOptions,
  allergyTypes,
  MODE,
  severityOptions,
  severityOptionsList,
} from '@/constants/constants';
import { Button } from '@/components/ui/button';
import { addAllergy } from '@/lib/features/records/recordsThunk';
import { z } from 'zod';
import { generateUUID, showErrorToast } from '@/lib/utils';
import { Toast, toast } from '@/hooks/use-toast';
import { requiredStringSchema } from '@/schemas/zod.schemas';
import { Input } from '@/components/ui/input';
import { SelectInput } from '@/components/ui/select';

const allergySchema = z.object({
  allergy: requiredStringSchema(),
  type: z.enum(allergyTypes),
  severity: z.enum(severityOptions),
});

type PatientAllergiesCardProps = {
  recordId?: string;
};

const PatientAllergiesCard = ({ recordId }: PatientAllergiesCardProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    formState: { isValid, errors },
    handleSubmit,
    reset,
    register,
    control,
  } = useForm<IAllergyWithoutId>({
    resolver: zodResolver(allergySchema),
    mode: MODE.ON_TOUCH,
  });
  const [edit, setEdit] = useState(false);
  const allergies = useAppSelector(selectAllergies);
  const dispatch = useAppDispatch();

  const onSubmit = async (allergy: IAllergyWithoutId): Promise<void> => {
    if (recordId) {
      setIsLoading(true);
      const { payload } = await dispatch(
        addAllergy({
          ...allergy,
          id: generateUUID(),
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
      <CardFrame setEdit={setEdit} title="Allergies" showEmptyResults={!allergies?.length}>
        <div className="max-h-[360px] space-y-4 overflow-y-scroll text-[#840000]">
          {allergies?.map(({ id, allergy, type, severity }) => (
            <div key={id} className="rounded-xl bg-gradient-to-b from-[#FCA5A5] to-[#FFECEC] p-4">
              <h4 className="font-bold">
                {allergy} ({type})
              </h4>
              <span>{severity}</span>
            </div>
          ))}
        </div>
      </CardFrame>
      <Drawer direction="right" open={edit}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm p-4">
            <DrawerHeader className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-lg">Add Allergy</DrawerTitle>
                <DrawerDescription>Manage allergies</DrawerDescription>
              </div>
            </DrawerHeader>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <Input
                labelName="Allergy"
                placeholder="Enter the allergy"
                error={errors.allergy?.message}
                {...register('allergy')}
              />
              <SelectInput
                ref={register('type').ref}
                control={control}
                options={allergyTypeOptions}
                label="Type of Allergy"
                error={errors.type?.message}
                name="type"
                placeholder="Select allergy type"
              />
              <SelectInput
                ref={register('severity').ref}
                control={control}
                options={severityOptionsList}
                label="Severity of Allergy"
                error={errors.severity?.message}
                name="severity"
                placeholder="Select severity"
              />
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

export default PatientAllergiesCard;
