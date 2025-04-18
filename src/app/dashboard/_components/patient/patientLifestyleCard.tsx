import React, { JSX, useEffect, useState } from 'react';
import { capitalize, showErrorToast } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectLifestyle } from '@/lib/features/patients/patientsSelector';
import CardFrame from '@/app/dashboard/_components/cardFrame';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useForm } from 'react-hook-form';
import { ILifestyle } from '@/types/patient.interface';
import { zodResolver } from '@hookform/resolvers/zod';
import { medicalLevelOptions, medicalLevels, MODE, scale1to10Options } from '@/constants/constants';
import { Button } from '@/components/ui/button';
import { updateRecord } from '@/lib/features/records/recordsThunk';
import { z } from 'zod';
import { Toast, toast } from '@/hooks/use-toast';
import { SelectInput } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useParams } from 'next/navigation';
import { Info } from 'lucide-react';
import { TooltipComp } from '@/components/ui/tooltip';
import { requiredStringSchema } from '@/schemas/zod.schemas';

const lifestyleSchema = z.object({
  alcohol: z.object({
    level: z.enum(medicalLevels),
    description: z.string().optional(),
  }),
  smoking: z.object({
    level: z.enum(medicalLevels),
    description: z.string().optional(),
  }),
  stress: z.object({
    level: requiredStringSchema(),
    description: z.string().optional(),
  }),
});

const PatientLifestyleCard = (): JSX.Element => {
  const params = useParams();
  const patientId = params.id as string;
  const {
    formState: { isValid, errors },
    handleSubmit,
    register,
    control,
    setValue,
  } = useForm<ILifestyle>({
    resolver: zodResolver(lifestyleSchema),
    mode: MODE.ON_TOUCH,
  });
  const [edit, setEdit] = useState(false);
  const lifestyle = useAppSelector(selectLifestyle);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const onSubmit = async (lifestyle: ILifestyle): Promise<void> => {
    setIsLoading(true);
    const { payload } = await dispatch(updateRecord({ lifestyle, id: patientId }));
    if (!showErrorToast(payload)) {
      setEdit(false);
    }
    toast(payload as Toast);
    setIsLoading(false);
  };

  useEffect(() => {
    if (lifestyle) {
      const { alcohol, smoking, stress } = lifestyle;
      setValue('alcohol', alcohol);
      setValue('smoking', smoking);
      setValue('stress', stress);
    }
  }, [lifestyle]);
  return (
    <>
      <CardFrame setEdit={setEdit} showEmptyResults={!lifestyle} title="Lifestyle">
        <div className="flex flex-col gap-6">
          {Object.entries(lifestyle ?? {}).map(([key, { level, description }]) => (
            <div key={key} className="flex flex-row items-center justify-between text-sm">
              <p className="text-gray-500">{capitalize(key)}</p>
              <p className="align-center flex justify-center gap-2 font-medium">
                <span>{capitalize(String(level))}</span>{' '}
                <TooltipComp tip={description}>
                  <Info size={20} />
                </TooltipComp>
              </p>
            </div>
          ))}
        </div>
      </CardFrame>
      <Drawer direction="right" open={edit}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm p-4">
            <DrawerHeader className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-lg">Edit Conditions and Medicine</DrawerTitle>
                <DrawerDescription>Manage conditions and medicines</DrawerDescription>
              </div>
            </DrawerHeader>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div className="font-bold">Alcohol</div>
                <SelectInput
                  ref={register('alcohol.level').ref}
                  control={control}
                  options={medicalLevelOptions}
                  error={errors.alcohol?.level?.message}
                  name="alcohol.level"
                  placeholder="Select alcohol level"
                />
                <Textarea
                  error={errors.alcohol?.description?.message}
                  {...register('alcohol.description')}
                  placeholder="Description about alcohol intake (optional)"
                />
              </div>
              <div className="space-y-4">
                <div className="font-bold">Smoking</div>
                <SelectInput
                  ref={register('smoking.level').ref}
                  control={control}
                  options={medicalLevelOptions}
                  error={errors.smoking?.level?.message}
                  name="smoking.level"
                  placeholder="Select smoking level"
                />
                <Textarea
                  error={errors.smoking?.description?.message}
                  {...register('smoking.description')}
                  placeholder="Description about smoking level (optional)"
                />
              </div>
              <div className="space-y-4">
                <div className="font-bold">Stress</div>
                <SelectInput
                  ref={register('stress.level').ref}
                  control={control}
                  options={scale1to10Options}
                  error={errors.stress?.level?.message}
                  name="stress.level"
                  placeholder="Select stress level (1-10 scale)"
                />
                <Textarea
                  error={errors.stress?.description?.message}
                  {...register('stress.description')}
                  placeholder="Description about stress level (optional)"
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

export default PatientLifestyleCard;
