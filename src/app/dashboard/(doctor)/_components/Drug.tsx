import { Drugs } from '@/assets/images';
import { IMedicineWithoutId } from '@/types/patient.interface';
import { JSX } from 'react';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';

type DrugProps = {
  index?: number;
  remove?: (index: number) => void;
} & IMedicineWithoutId;
const Drug = ({ name, dose, index, remove }: DrugProps): JSX.Element => (
  <div key={`${name}-${index}`} className="flex justify-between">
    <div className="flex w-full items-center gap-1">
      <Image src={Drugs} alt={name} width={20} height={20} />
      <span
        title={`${name}(${dose})`}
        className="text-blue-midnight truncate text-sm font-semibold"
      >
        {name}({dose})
      </span>
    </div>
    {index !== undefined && remove && (
      <Trash2 className="cursor-pointer" color="red" onClick={() => remove(index)} />
    )}
  </div>
);

export default Drug;
