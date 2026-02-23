import { Drugs } from '@/assets/images';
import { IPrescription } from '@/types/medical.interface';
import { JSX } from 'react';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';

type DrugProps = {
  index?: number;
  remove?: (index: number) => void;
} & Partial<Pick<IPrescription, 'route' | 'numOfDays' | 'doseRegimen'>> &
  Pick<IPrescription, 'name' | 'doses'>;
const Drug = ({
  name,
  doses,
  index,
  remove,
  route,
  numOfDays,
  doseRegimen,
}: DrugProps): JSX.Element => (
  <div>
    <div className="flex justify-between">
      <div className="flex w-full items-center gap-1">
        <Image src={Drugs} alt={name} width={20} height={20} />
        <span
          title={`${name}(${doses})`}
          className="text-blue-midnight truncate text-sm font-semibold"
        >
          {name}({doses})
        </span>
      </div>
      {index !== undefined && remove && (
        <Trash2 className="cursor-pointer" color="red" onClick={() => remove(index)} />
      )}
    </div>
    {route && doseRegimen && (
      <span className="text-sm text-gray-600">
        {route} - {doseRegimen}
      </span>
    )}
    {numOfDays && <p className="text-xs text-gray-500">For {numOfDays} days</p>}
  </div>
);

export default Drug;
