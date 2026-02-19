import React, { JSX } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type LabTestItemProps = {
  test: string;
  subCategory: string;
  isChecked: boolean;
  onToggle: () => void;
};

const LabTestItem = ({ test, subCategory, isChecked, onToggle }: LabTestItemProps): JSX.Element => (
  <div className="flex items-start space-x-2">
    <Checkbox id={`${subCategory} (${test})`} checked={isChecked} onCheckedChange={onToggle} />
    <Label htmlFor={`${subCategory} (${test})`} className="cursor-pointer text-sm leading-tight">
      {test}
    </Label>
  </div>
);

export default LabTestItem;
