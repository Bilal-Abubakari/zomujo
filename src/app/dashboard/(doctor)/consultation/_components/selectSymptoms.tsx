import React, { JSX, useState, ReactElement, useMemo } from 'react';
import {
  IConsultationSymptomsHFC,
  IPatientSymptom,
  ISymptom,
  SymptomsType,
} from '@/types/consultation.interface';
import { ChevronsRight, GripVertical, Loader2, Search } from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import { capitalize, cn } from '@/lib/utils';
import { Control, useFieldArray, UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { useDebounce } from 'use-debounce';

type SelectSymptomsProps = {
  symptoms: ISymptom[];
  id: string;
  control: Control<IConsultationSymptomsHFC>;
  setValue: UseFormSetValue<IConsultationSymptomsHFC>;
  selectedSymptoms: IPatientSymptom[];
};

const SelectSymptoms = ({
  symptoms,
  id,
  setValue,
  control,
  selectedSymptoms,
}: SelectSymptomsProps): JSX.Element => {
  const [systemSymptoms, setSystemSymptoms] = useState<ISymptom[]>(symptoms);

  return (
    <div className="mt-6 flex flex-row items-center gap-4">
      <SymptomsContainer
        isLoading={false}
        id={id}
        symptoms={systemSymptoms}
        selectedSymptoms={selectedSymptoms}
        setSystemSymptoms={setSystemSymptoms}
        setValue={setValue}
        control={control}
      />
      <ChevronsRight className="h-6 w-6 text-gray-400" />
      <SymptomsContainer
        isLoading={false}
        patientSymptoms
        id={id}
        symptoms={systemSymptoms}
        setSystemSymptoms={setSystemSymptoms}
        selectedSymptoms={selectedSymptoms}
        setValue={setValue}
        control={control}
      />
    </div>
  );
};

type SymptomsContainerProps = {
  isLoading: boolean;
  patientSymptoms?: boolean;
  symptoms?: ISymptom[];
  setSystemSymptoms: React.Dispatch<React.SetStateAction<ISymptom[]>>;
  selectedSymptoms?: IPatientSymptom[];
  id: string;
  setValue: UseFormSetValue<IConsultationSymptomsHFC>;
  control: Control<IConsultationSymptomsHFC>;
};

const SymptomsContainer = ({
  isLoading,
  patientSymptoms = false,
  symptoms = [],
  setSystemSymptoms,
  selectedSymptoms = [],
  control,
  id,
}: SymptomsContainerProps): ReactElement | null => {
  const [search, setSearch] = useState('');
  const [searchTerm] = useDebounce(search, 500);
  const searchedSymptoms = useMemo(
    () => symptoms.filter(({ name }) => name.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm, symptoms],
  );
  const { append, remove } = useFieldArray({
    control,
    name: `symptoms.${id as SymptomsType}`,
  });
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: id,
      drop: (item: ISymptom): void => {
        if (patientSymptoms) {
          const alreadySelected = findSymptom(selectedSymptoms, item.name, 'name');
          if (alreadySelected) {
            return;
          }

          setSystemSymptoms((prev) => filterSymptoms(prev, item.id));
          append(item);
          return;
        }
        const alreadyInSymptoms = findSymptom(symptoms, item.id);
        if (alreadyInSymptoms) {
          return;
        }

        const differentSymptomIndex =
          selectedSymptoms?.findIndex(({ name }) => name !== item.name) ?? -1;
        if (differentSymptomIndex !== -1) {
          remove(differentSymptomIndex);
        }

        setSystemSymptoms((prev) => [item, ...prev]);
      },
      collect(monitor): { isOver: boolean } {
        return {
          isOver: monitor.isOver(),
        };
      },
    }),
    [selectedSymptoms, symptoms],
  );

  const filterSymptoms = (symptoms: ISymptom[], symptomId: string): ISymptom[] =>
    symptoms.filter(({ id }) => id !== symptomId);

  const findSymptom = <T extends { id?: string; name?: string }>(
    symptoms: T[],
    value: string,
    key: 'id' | 'name' = 'id',
  ): T | undefined => symptoms.find((symptom) => symptom[key] === value);

  const emptyResults = (
    <div className="flex h-[250px] items-center justify-center text-sm text-gray-400">
      {patientSymptoms ? 'No symptoms selected so far' : 'No symptoms founds'}
    </div>
  );

  const systemSymptoms = searchedSymptoms.length
    ? searchedSymptoms.map((symptom) => <SymptomItem key={symptom.id} item={symptom} id={id} />)
    : emptyResults;

  const patientSelectedSymptoms = selectedSymptoms.length
    ? selectedSymptoms.map((symptom) => <SymptomItem key={symptom.name} item={symptom} id={id} />)
    : emptyResults;

  return drop(
    <div
      className={cn(
        'flex h-[350px] w-[370px] flex-col gap-4 rounded-lg border border-gray-300 p-4',
        isOver && 'outline-primary outline',
      )}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <>
          <p className="text-sm leading-4 font-bold">
            {patientSymptoms ? 'Patient Symptoms' : `${capitalize(id)} Symptoms`}
          </p>
          <div className={cn('flex flex-col gap-2.5', patientSymptoms && 'h-full justify-between')}>
            <div className="relative flex h-[280px] flex-col gap-1 overflow-y-auto">
              {!patientSymptoms && (
                <div className="sticky top-0">
                  <Input
                    value={search}
                    onChange={({ target }) => setSearch(target.value)}
                    placeholder="Find symptoms"
                    leftIcon={<Search color="#8C96A5" size="18" />}
                  />
                </div>
              )}
              {patientSymptoms ? patientSelectedSymptoms : systemSymptoms}
            </div>
          </div>
        </>
      )}
    </div>,
  );
};

type SymptomItemProps = {
  item: ISymptom | IPatientSymptom;
  id: string;
};

const SymptomItem = ({ item, id }: SymptomItemProps): ReactElement | null => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: id,
    item: item,
    collect: (monitor): { isDragging: boolean } => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return drag(
    <div
      className={cn(
        'flex w-full flex-row items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-2.5 duration-100',
        isDragging && 'border-primaryLightBase',
      )}
    >
      <GripVertical
        size={20}
        className={cn('text-gray-400 duration-100', isDragging && 'text-primaryLightBase')}
      />
      <p className="text-sm leading-[14px]">{item.name}</p>
    </div>,
  );
};

export default SelectSymptoms;
