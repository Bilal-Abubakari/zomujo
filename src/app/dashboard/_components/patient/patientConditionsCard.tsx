import React, { ChangeEvent, JSX, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown } from 'lucide-react';
import { IConditionWithoutId } from '@/types/patient.interface';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectMedicalConditions } from '@/lib/features/patients/patientsSelector';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MODE } from '@/constants/constants';
import { z } from 'zod';
import { Combobox, SelectOption } from '@/components/ui/select';
import { addMedicalCondition, getConditions } from '@/lib/features/records/recordsThunk';
import { useDebounce } from 'use-debounce';
import { Toast, toast } from '@/hooks/use-toast';
import { showErrorToast } from '@/lib/utils';
import CardFrame from '@/app/dashboard/_components/cardFrame';
import Drug from '@/app/dashboard/(doctor)/_components/Drug';

const conditionsSchema = z.object({
  name: z.string(),
  medicines: z
    .array(
      z.object({
        name: z.string().nonempty(),
        dose: z.string().nonempty(),
      }),
    )
    .min(1),
});

type PatientConditionsCardProps = {
  recordId?: string;
};

const PatientConditionsCard = ({ recordId }: PatientConditionsCardProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    setValue,
    formState: { isValid },
    handleSubmit,
    watch,
    control,
    reset,
  } = useForm<Omit<IConditionWithoutId, 'recordId'>>({
    resolver: zodResolver(conditionsSchema),
    mode: MODE.ON_TOUCH,
  });
  const { append, remove } = useFieldArray({
    control,
    name: 'medicines',
  });

  const [edit, setEdit] = useState(false);
  const conditions = useAppSelector(selectMedicalConditions);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [value] = useDebounce(search, 1000);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [conditionOptions, setConditionOptions] = useState<SelectOption[]>([]);
  const dispatch = useAppDispatch();
  const [addMedicine, setAddMedicine] = useState({
    name: '',
    dose: '',
  });

  const onSubmit = async (condition: Omit<IConditionWithoutId, 'recordId'>): Promise<void> => {
    if (recordId) {
      setIsLoading(true);
      const { payload } = await dispatch(
        addMedicalCondition({
          ...condition,
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

  const handleAddMedicineChange = ({ target }: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = target;
    setAddMedicine((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const handleSearch = async (): Promise<void> => {
      setIsLoadingSearch(true);
      const { payload } = await dispatch(getConditions(value));
      setConditionOptions(payload as SelectOption[]);
      setIsLoadingSearch(false);
    };
    void handleSearch();
  }, [value]);

  return (
    <>
      <CardFrame
        showEmptyResults={!conditions?.length}
        setEdit={setEdit}
        title="Conditions and Medicines"
      >
        <div className="max-h-[360px] space-y-4 overflow-y-scroll">
          {conditions?.map(({ id, name, medicines }) => (
            <div
              key={id}
              className="rounded-xl bg-gradient-to-b from-[#C5D8FF] to-[rgba(197,216,255,0.51)] p-4"
            >
              <Collapsible
                open={expandedId === id}
                onOpenChange={() => {
                  setExpandedId((prev) => (prev === id ? null : id));
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-full bg-white px-2 py-1.5">
                    <h4 className="text-sm font-semibold">{name}</h4>
                  </div>
                  {medicines?.length > 1 && (
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        child={
                          <>
                            <ChevronsUpDown className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                          </>
                        }
                      />
                    </CollapsibleTrigger>
                  )}
                </div>
                {medicines?.length && (
                  <>
                    {
                      <Drug
                        key={`${medicines[0].name}-${medicines[0].dose}`}
                        name={medicines[0].name}
                        dose={medicines[0].dose}
                      />
                    }
                    <CollapsibleContent>
                      {medicines.slice(1).map(({ name, dose }) => (
                        <Drug key={`${name}-${dose}`} name={name} dose={dose} />
                      ))}
                    </CollapsibleContent>
                  </>
                )}
              </Collapsible>
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
              <Combobox
                onChange={(value) => setValue('name', value, { shouldValidate: true })}
                options={conditionOptions}
                value={search}
                placeholder="Search condition"
                searchPlaceholder="Search for condition..."
                defaultMaxWidth={false}
                onSearchChange={(value) => setSearch(value)}
                isLoadingResults={isLoadingSearch}
              />
              {watch('name') && (
                <>
                  <div className="mt-8 text-center text-sm text-gray-500">
                    Add drugs you took for this condition
                  </div>
                  <div className="space-y-4">
                    <Input
                      labelName="Name of Drug"
                      placeholder="Enter name of drug for condition"
                      name="name"
                      value={addMedicine.name}
                      onChange={handleAddMedicineChange}
                    />
                    <Input
                      labelName="Dose Taken"
                      placeholder="eg: 10mg once daily"
                      name="dose"
                      value={addMedicine.dose}
                      onChange={handleAddMedicineChange}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      disabled={!addMedicine.name || !addMedicine.dose}
                      child="Add Drug"
                      onClick={() => {
                        append(addMedicine);
                        setAddMedicine({
                          name: '',
                          dose: '',
                        });
                      }}
                      type="submit"
                    />
                  </div>
                </>
              )}
              <div className="mt-8 text-center text-sm text-gray-500">
                Preview of added condition and medicines
              </div>
              <div className="rounded-xl bg-gradient-to-b from-[#C5D8FF] to-[rgba(197,216,255,0.51)] p-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-full bg-white px-2 py-1.5">
                    <h4 className="text-sm font-semibold">{watch('name')}</h4>
                  </div>
                </div>

                {watch('medicines')?.map(({ name, dose }, index) => (
                  <Drug
                    key={`${name}-${dose}`}
                    name={name}
                    dose={dose}
                    index={index}
                    remove={remove}
                  />
                ))}
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

            <DrawerFooter className="flex justify-between"></DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default PatientConditionsCard;
