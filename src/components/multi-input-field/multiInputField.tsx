import React, { ChangeEvent, JSX, Ref, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Label } from '../ui/label';

type MultiInputProps = {
  label?: string;
  name?: string;
  error?: string;
  placeholder?: string;
  ref?: Ref<HTMLInputElement>;
  handleValueChange: (values: string[]) => void;
  onBlur?: () => void;
  defaultValues?: string[];
};

const MultiInputField = ({
  label,
  name,
  placeholder,
  error,
  ref,
  handleValueChange,
  onBlur,
  defaultValues = [],
}: MultiInputProps): JSX.Element => {
  const [inputValue, setInputValue] = useState<string>('');
  const [values, setValues] = useState<string[]>(defaultValues);

  const handleAddValue = (): void => {
    if (inputValue.trim() && !values.includes(inputValue)) {
      setValues([...values, inputValue.trim()]);
      handleValueChange([...values, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemoveValue = (index: number): void => {
    setValues(values.filter((_, i) => i !== index));
    handleValueChange([...values, inputValue.trim()]);
  };

  return (
    <div className="w-full space-y-4">
      <div className="-mb-4">{label && <Label htmlFor={name}>{label}</Label>}</div>
      <div className="flex items-baseline space-x-2">
        <Input
          value={inputValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setInputValue(event.target.value)}
          placeholder={placeholder}
          className="bg-transparent"
          id={name}
          ref={ref}
          onBlur={onBlur}
          error={error}
        />
        <Button onClick={handleAddValue} child={'Add'} type="button" />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((item: string, index: number) => (
          <div
            key={index}
            className="flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm shadow"
          >
            <span>{item}</span>
            <button
              onClick={() => handleRemoveValue(index)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiInputField;
