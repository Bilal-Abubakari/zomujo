import React, { JSX, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectSurgeries } from '@/lib/features/patients/patientsSelector';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useForm } from 'react-hook-form';
import { ISurgeryWithoutId } from '@/types/patient.interface';
import { zodResolver } from '@hookform/resolvers/zod';
import { MODE } from '@/constants/constants';
import { z } from 'zod';
import { Combobox, SelectOption } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { addSurgery, getProcedures } from '@/lib/features/records/recordsThunk';
import { useDebounce } from 'use-debounce';
import { showErrorToast } from '@/lib/utils';
import { Toast, toast } from '@/hooks/use-toast';
import CardFrame from '@/app/dashboard/_components/cardFrame';

const surgerySchema = z.object({
  name: z.string().nonempty(),
  additionalNotes: z.string().nonempty('Please provide some notes about the surgery'),
});

type PatientSurgeriesCardProps = {
  recordId?: string;
};

const PatientSurgeriesCard = ({ recordId }: PatientSurgeriesCardProps): JSX.Element => {
  const {
    formState: { isValid, errors },
    handleSubmit,
    setValue,
    register,
    reset,
  } = useForm<Omit<ISurgeryWithoutId, 'recordId'>>({
    resolver: zodResolver(surgerySchema),
    mode: MODE.ON_TOUCH,
  });
  const [edit, setEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [procedureOptions, setProcedureOptions] = useState<SelectOption[]>([]);
  const [search, setSearch] = useState('');
  const [searchTerm] = useDebounce(search, 1000);
  const dispatch = useAppDispatch();
  const surgeries = useAppSelector(selectSurgeries);

  const onSubmit = async (surgery: Omit<ISurgeryWithoutId, 'recordId'>): Promise<void> => {
    if (recordId) {
      setIsLoading(true);
      const { payload } = await dispatch(
        addSurgery({
          ...surgery,
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

  useEffect(() => {
    const handleSearch = async (): Promise<void> => {
      setIsLoadingSearch(true);
      const { payload } = await dispatch(getProcedures(searchTerm));
      setProcedureOptions(payload as SelectOption[]);
      setIsLoadingSearch(false);
    };
    void handleSearch();
  }, [searchTerm]);

  return (
    <>
      <CardFrame setEdit={setEdit} showEmptyResults={!surgeries?.length} title="Surgeries">
        <div className="text-burnt-brown max-h-[360px] space-y-4 overflow-y-scroll">
          {surgeries?.map(({ name, id, additionalNotes }) => (
            <div
              key={id}
              className="rounded-xl bg-gradient-to-b from-[#FFD0B0] to-[rgba(255,219,195,0.51)] p-4"
            >
              <h4 className="font-bold">{name}</h4>
              <div className="mt-8 text-sm">
                <span className="font-medium">Notes</span>
                <p>{additionalNotes}</p>
              </div>
            </div>
          ))}
        </div>
      </CardFrame>
      <Drawer direction="right" open={edit}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm p-4">
            <DrawerHeader className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-lg">Add New Surgery</DrawerTitle>
                <DrawerDescription>Add a surgery or procedure to patient record</DrawerDescription>
              </div>
            </DrawerHeader>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <Combobox
                onChange={(value) => setValue('name', value, { shouldValidate: true })}
                options={procedureOptions}
                value={search}
                placeholder="Search surgeries"
                searchPlaceholder="Search for surgeries..."
                defaultMaxWidth={false}
                onSearchChange={(value) => setSearch(value)}
                isLoadingResults={isLoadingSearch}
              />
              <Textarea
                labelName="Add Notes or Description"
                className="w-full resize-none bg-transparent"
                error={errors.additionalNotes?.message}
                {...register('additionalNotes')}
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

export default PatientSurgeriesCard;
