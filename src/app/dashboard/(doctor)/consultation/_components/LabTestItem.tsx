import React, { JSX } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type LabTestItemProps = {
  test: string;
  mainCategory: string;
  subCategory: string;
  isChecked: boolean;
  onToggle: () => void;
};

const LabTestItem = ({
  test,
  mainCategory,
  subCategory,
  isChecked,
  onToggle,
}: LabTestItemProps): JSX.Element => (
  <div className="flex items-start space-x-2">
    <Checkbox
      id={`${mainCategory}-${subCategory}-${test}`}
      checked={isChecked}
      onCheckedChange={onToggle}
    />
    <Label
      htmlFor={`${mainCategory}-${subCategory}-${test}`}
      className="cursor-pointer text-sm leading-tight"
    >
      {test}
    </Label>
  </div>
);

export default LabTestItem;

