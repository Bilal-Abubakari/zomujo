'use client';
import React, { JSX, useState, useEffect } from 'react';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';

export interface Option {
  label: string;
  value: {
    place_id: string;
    description: string;
  };
}

interface LocationProps {
  placeHolder: string;
  classStyle?: string;
  error: string;
  handleLocationValue: (data: Option) => void;
  onBlur?: () => void;
  value?: string;
  onChange?: (value: string) => void;
}

const Location = ({
  placeHolder,
  classStyle,
  error,
  handleLocationValue,
  onBlur,
  value: controlledValue,
  onChange,
}: LocationProps): JSX.Element => {
  const [inputValue, setInputValue] = useState(controlledValue || '');

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInputValue(controlledValue);
    }
  }, [controlledValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setInputValue(value);
    onChange?.(value);
    handleLocationValue({ label: value, value: { place_id: value, description: value } });
  };

  return (
    <div>
      <div className={cn('relative w-full', classStyle)}>
        <Label>Location</Label>
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={() => {
            onBlur?.();
          }}
          placeholder={placeHolder}
          error={error}
          className={cn('w-full', error ? 'border-red-500' : '')}
        />
      </div>
    </div>
  );
};

export default Location;
