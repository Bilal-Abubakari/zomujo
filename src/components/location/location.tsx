'use client';
import React, { JSX, useState, useEffect } from 'react';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';

// Mock location data for dummy implementation
const DUMMY_LOCATIONS = [
  { label: 'Liberation Road, Accra, Ghana', value: { place_id: '1', description: 'Liberation Road, Accra, Ghana' } },
  { label: 'Osu, Accra, Ghana', value: { place_id: '2', description: 'Osu, Accra, Ghana' } },
  { label: 'Tema, Greater Accra, Ghana', value: { place_id: '3', description: 'Tema, Greater Accra, Ghana' } },
  { label: 'Kumasi, Ashanti Region, Ghana', value: { place_id: '4', description: 'Kumasi, Ashanti Region, Ghana' } },
  { label: 'Takoradi, Western Region, Ghana', value: { place_id: '5', description: 'Takoradi, Western Region, Ghana' } },
];

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState(DUMMY_LOCATIONS);

  // Sync with controlled value if provided
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInputValue(controlledValue);
    }
  }, [controlledValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Update form state if onChange callback is provided
    onChange?.(value);
    
    // Filter locations based on input
    const filtered = DUMMY_LOCATIONS.filter(location =>
      location.label.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredLocations(filtered);
    setShowSuggestions(value.length > 0);
  };

  const handleSelectLocation = (location: Option) => {
    const description = location.value.description;
    setInputValue(description);
    setShowSuggestions(false);
    // Update form state via onChange if provided
    onChange?.(description);
    handleLocationValue(location);
  };

  return (
    <div>
      <div className={cn('relative w-full', classStyle)}>
        <Label>Location</Label>
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(inputValue.length > 0)}
          onBlur={() => {
            // Delay to allow click on suggestion
            setTimeout(() => {
              setShowSuggestions(false);
              onBlur?.();
            }, 200);
          }}
          placeholder={placeHolder}
          error={error}
          className={cn(
            'w-full',
            error ? 'border-red-500' : ''
          )}
        />
        
        {showSuggestions && filteredLocations.length > 0 && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-lg">
            {filteredLocations.map((location) => (
              <div
                key={location.value.place_id}
                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectLocation(location);
                }}
              >
                {location.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Location;
