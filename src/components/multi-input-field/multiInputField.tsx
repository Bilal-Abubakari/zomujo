import React, { ChangeEvent, JSX, Ref, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Label } from '../ui/label';
import { FieldError, Merge } from 'react-hook-form';
import { cn } from '@/lib/utils';

type MultiInputProps = {
  label?: string;
  name?: string;
  errors?: Merge<FieldError, (FieldError | undefined)[]>;
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
  errors,
  ref,
  handleValueChange,
  onBlur,
  defaultValues = [],
}: MultiInputProps): JSX.Element => {
  const [inputValue, setInputValue] = useState<string>('');
  const [values, setValues] = useState<string[]>(defaultValues);

  // Get error details (position and message) from errors array
  const getErrorDetails = (): { position: number; message: string } | null => {
    if (!errors) {
      return null;
    }

    if (Array.isArray(errors)) {
      // Find the first error in the array
      const errorIndex = errors.findIndex((err) => err !== undefined && err !== null);
      if (errorIndex !== -1 && errors[errorIndex]) {
        return {
          position: errorIndex,
          message: errors[errorIndex]?.message || 'Invalid value',
        };
      }
    } else if (errors.message) {
      // Single error object
      return {
        position: 0,
        message: errors.message,
      };
    }

    return null;
  };

  const errorDetails = getErrorDetails();

  const handleAddValue = (): void => {
    if (inputValue.trim() && !values.includes(inputValue)) {
      setValues([...values, inputValue.trim()]);
      handleValueChange([...values, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemoveValue = (index: number): void => {
    const filtereValues = values.filter((_, i) => i !== index);
    setValues(filtereValues);
    handleValueChange(filtereValues);
  };

  return (
    <div className="w-full space-y-4">
      <div className="mb-2">{label && <Label htmlFor={name}>{label}</Label>}</div>
      <div className="flex items-baseline space-x-2">
        <Input
          value={inputValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setInputValue(event.target.value)}
          placeholder={placeholder}
          className="bg-transparent"
          id={name}
          ref={ref}
          onBlur={onBlur}
        />
        <Button onClick={handleAddValue} child={'Add'} type="button" />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((item: string, index: number) => {
          const hasError = errorDetails?.position === index;
          return (
            <div
              key={index}
              className={cn(
                'flex items-center rounded-full px-3 py-1 text-sm shadow-sm',
                hasError ? 'border border-red-300 bg-red-50' : 'bg-gray-100',
              )}
            >
              <span className={hasError ? 'text-red-700' : ''}>{item}</span>
              <button
                type="button"
                onClick={() => handleRemoveValue(index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
      {errorDetails && values[errorDetails.position] && (
        <small className="text-xs font-medium text-red-500">
          {values[errorDetails.position]}: {errorDetails.message}
        </small>
      )}
    </div>
  );
};

export default MultiInputField;
