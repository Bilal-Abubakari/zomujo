import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import React, { JSX } from 'react';
import { IMedicineWithoutId } from '@/types/medical.interface';
import { Control, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MODE } from '@/constants/constants';
import { z } from 'zod';
import { requiredStringSchema } from '@/schemas/zod.schemas';
import { IConsultationSymptomsHFC } from '@/types/consultation.interface';
import Drug from '@/app/dashboard/(doctor)/_components/Drug';

const medicationTakenSchema = z.object({
  name: requiredStringSchema(),
  dose: requiredStringSchema(),
});

type MedicationTakenProps = {
  medicationsTaken: IMedicineWithoutId[];
  control: Control<IConsultationSymptomsHFC>;
};

const MedicationTaken = ({ medicationsTaken, control }: MedicationTakenProps): JSX.Element => {
  const {
    formState: { isValid },
    register,
    getValues,
    reset,
  } = useForm<IMedicineWithoutId>({
    resolver: zodResolver(medicationTakenSchema),
    mode: MODE.ON_TOUCH,
  });
  const { append, remove } = useFieldArray({
    control,
    name: 'medicinesTaken',
  });
  const addMedicationTaken = (): void => {
    append(getValues());
    reset();
  };

  return (
    <>
      <div className="mt-4 flex flex-wrap space-y-4 space-x-4">
        <Input
          labelName="Name of Drug"
          placeholder="Enter name of drug for condition"
          {...register('name')}
        />
        <div>
          <Input labelName="Dose Taken" placeholder="eg: 10mg once daily" {...register('dose')} />
        </div>
      </div>
      <div className="mt-4 flex">
        <Button
          type="button"
          disabled={!isValid}
          child="Add Drug"
          onClick={() => addMedicationTaken()}
        />
      </div>
      {medicationsTaken?.map(({ dose, name }, index) => (
        <div key={`${name}-${dose}`} className="mt-4">
          <Drug key={`${name}-${dose}`} name={name} dose={dose} index={index} remove={remove} />
        </div>
      ))}
    </>
  );
};

export default MedicationTaken;
