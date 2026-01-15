'use client';
import React, { JSX, useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ListFilter, RotateCcw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface HospitalFiltersProps {
  queryParameters: {
    city?: string;
    organizationType?: string;
    hasEmergency?: boolean;
    telemedicine?: boolean;
    serviceId?: string;
    departmentId?: string;
    insuranceCompanyId?: string;
    languages?: string[];
    minBedCount?: number;
    maxBedCount?: number;
  };
  onFilterChange: (filters: {
    city?: string;
    organizationType?: string;
    hasEmergency?: boolean;
    telemedicine?: boolean;
    serviceId?: string;
    departmentId?: string;
    insuranceCompanyId?: string;
    languages?: string[];
    minBedCount?: number;
    maxBedCount?: number;
  }) => void;
  onReset: () => void;
  totalResults?: number;
}

const cityOptions = [
  { value: '', label: 'All Cities' },
  { value: 'Accra', label: 'Accra' },
  { value: 'Kumasi', label: 'Kumasi' },
  { value: 'Tamale', label: 'Tamale' },
  { value: 'Takoradi', label: 'Takoradi' },
  { value: 'Ashaiman', label: 'Ashaiman' },
  { value: 'Sunyani', label: 'Sunyani' },
  { value: 'Cape Coast', label: 'Cape Coast' },
  { value: 'Obuasi', label: 'Obuasi' },
  { value: 'Teshie', label: 'Teshie' },
  { value: 'Tema', label: 'Tema' },
  { value: 'Koforidua', label: 'Koforidua' },
  { value: 'Sekondi', label: 'Sekondi' },
  { value: 'Ho', label: 'Ho' },
  { value: 'Wa', label: 'Wa' },
  { value: 'Bolgatanga', label: 'Bolgatanga' },
  { value: 'Techiman', label: 'Techiman' },
  { value: 'Nkawkaw', label: 'Nkawkaw' },
  { value: 'Hohoe', label: 'Hohoe' },
  { value: 'Aflao', label: 'Aflao' },
  { value: 'Elmina', label: 'Elmina' },
];

const HospitalFilters = ({
  queryParameters,
  onFilterChange,
  onReset,
  totalResults,
}: HospitalFiltersProps): JSX.Element => {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(queryParameters);

  useEffect(() => {
    setLocalFilters(queryParameters);
  }, [queryParameters]);

  const handleFilterChange = (key: string, value: any) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
  };

  const handleApplyFilters = () => {
    onFilterChange({
      ...localFilters,
    });
    setOpen(false);
  };

  const handleReset = () => {
    const resetFilters = {
      city: '',
      organizationType: '',
      hasEmergency: undefined,
      telemedicine: undefined,
      serviceId: '',
      departmentId: '',
      insuranceCompanyId: '',
      languages: undefined,
      minBedCount: undefined,
      maxBedCount: undefined,
    };
    setLocalFilters(resetFilters);
    onReset();
    setOpen(false);
  };

  const activeFilterCount = [
    queryParameters.city,
    queryParameters.hasEmergency !== undefined,
    queryParameters.telemedicine !== undefined,
    queryParameters.serviceId,
    queryParameters.departmentId,
    queryParameters.insuranceCompanyId,
    queryParameters.minBedCount,
    queryParameters.maxBedCount,
  ].filter(Boolean).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="relative h-10 min-w-[120px] cursor-pointer border-2 border-gray-300 bg-white font-semibold text-gray-700 shadow-sm transition-all hover:border-primary hover:bg-primary/5 hover:text-primary sm:flex"
          child={
            <>
              <ListFilter className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </>
          }
        />
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">Filter Hospitals</SheetTitle>
          <SheetDescription>
            Refine your search to find the perfect hospital for your needs
            {totalResults !== undefined && (
              <span className="ml-2 text-primary font-semibold">
                ({totalResults} {totalResults === 1 ? 'hospital' : 'hospitals'} found)
              </span>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Location Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Location</Label>
            <Combobox
              onChange={(value) => handleFilterChange('city', value)}
              options={cityOptions}
              value={localFilters.city || ''}
              placeholder="Select city..."
              searchPlaceholder="Search city..."
              defaultMaxWidth={false}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Features */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Features</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="emergency" className="text-sm font-medium">
                    Emergency Services
                  </Label>
                  <p className="text-xs text-gray-500">24/7 emergency care available</p>
                </div>
                <Switch
                  id="emergency"
                  checked={localFilters.hasEmergency === true}
                  onCheckedChange={(checked) =>
                    handleFilterChange('hasEmergency', checked ? true : undefined)
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="telemedicine" className="text-sm font-medium">
                    Telemedicine
                  </Label>
                  <p className="text-xs text-gray-500">Virtual consultations available</p>
                </div>
                <Switch
                  id="telemedicine"
                  checked={localFilters.telemedicine === true}
                  onCheckedChange={(checked) =>
                    handleFilterChange('telemedicine', checked ? true : undefined)
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Bed Count Range */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Bed Capacity</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="minBeds" className="text-sm text-gray-600">
                  Minimum
                </Label>
                <Input
                  id="minBeds"
                  type="number"
                  placeholder="Min beds"
                  value={localFilters.minBedCount || ''}
                  onChange={(e) =>
                    handleFilterChange('minBedCount', e.target.value ? Number(e.target.value) : undefined)
                  }
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxBeds" className="text-sm text-gray-600">
                  Maximum
                </Label>
                <Input
                  id="maxBeds"
                  type="number"
                  placeholder="Max beds"
                  value={localFilters.maxBedCount || ''}
                  onChange={(e) =>
                    handleFilterChange('maxBedCount', e.target.value ? Number(e.target.value) : undefined)
                  }
                  min={0}
                />
              </div>
            </div>
          </div>


          {/* Additional Filters Placeholder */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Additional Filters</Label>
            <p className="text-sm text-gray-500">
              Services, departments, and insurance filters coming soon
            </p>
          </div>
        </div>

        <SheetFooter className="mt-8 flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full sm:w-auto"
            child={
              <>
                <RotateCcw className="h-4 w-4" />
                <span>Reset All</span>
              </>
            }
          />
          <Button 
            onClick={handleApplyFilters} 
            className="w-full sm:w-auto"
            child="Apply Filters"
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default HospitalFilters;
