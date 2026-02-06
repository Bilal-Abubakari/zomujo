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

const serviceOptions = [
  { value: '', label: 'All Services' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'orthopedics', label: 'Orthopedics' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'oncology', label: 'Oncology' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'gynecology', label: 'Gynecology' },
  { value: 'urology', label: 'Urology' },
  { value: 'ophthalmology', label: 'Ophthalmology' },
  { value: 'psychiatry', label: 'Psychiatry' },
  { value: 'radiology', label: 'Radiology' },
  { value: 'emergency', label: 'Emergency Medicine' },
  { value: 'surgery', label: 'General Surgery' },
  { value: 'anesthesia', label: 'Anesthesiology' },
  { value: 'pathology', label: 'Pathology' },
  { value: 'internal-medicine', label: 'Internal Medicine' },
  { value: 'family-medicine', label: 'Family Medicine' },
];

const departmentOptions = [
  { value: '', label: 'All Departments' },
  { value: 'emergency', label: 'Emergency Department' },
  { value: 'icu', label: 'Intensive Care Unit (ICU)' },
  { value: 'surgery', label: 'Surgery Department' },
  { value: 'maternity', label: 'Maternity & Obstetrics' },
  { value: 'pediatric', label: 'Pediatric Department' },
  { value: 'cardiac', label: 'Cardiac Care Unit' },
  { value: 'oncology', label: 'Oncology Department' },
  { value: 'radiology', label: 'Radiology Department' },
  { value: 'laboratory', label: 'Laboratory Services' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'outpatient', label: 'Outpatient Department' },
  { value: 'inpatient', label: 'Inpatient Services' },
  { value: 'rehabilitation', label: 'Rehabilitation Services' },
  { value: 'mental-health', label: 'Mental Health Services' },
];

const insuranceCompanyOptions = [
  { value: '', label: 'All Insurance Companies' },
  { value: 'nhis', label: 'National Health Insurance Scheme (NHIS)' },
  { value: 'acacia', label: 'Acacia Health Insurance Limited' },
  { value: 'ace', label: 'Ace Medical Insurance' },
  { value: 'apex', label: 'Apex Health Insurance Limited' },
  { value: 'cosmopolitan', label: 'Cosmopolitan Health Insurance Limited' },
  { value: 'dosh', label: 'Dosh Health Insurance Company Ltd' },
  { value: 'equity', label: 'Equity Health Insurance Limited' },
  { value: 'glico', label: 'GLICO Healthcare Limited' },
  { value: 'health-insure', label: 'Health Insure Africa Limited' },
  { value: 'metropolitan', label: 'Metropolitan Health Insurance Ghana Limited' },
  { value: 'nmh', label: 'NMH Nationwide Medical Health Insurance Scheme Limited' },
  { value: 'phoenix', label: 'Phoenix Health Insurance' },
  { value: 'premier', label: 'Premier Health Insurance Company Limited' },
  { value: 'vitality', label: 'Vitality Health Insurance Limited' },
  { value: 'spectra', label: 'Spectra Health Mutual Insurance' },
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
    };
    setLocalFilters(resetFilters);
    onReset();
    setOpen(false);
  };

  const activeFilterCount = [
    queryParameters.city,
    queryParameters.telemedicine !== undefined,
    queryParameters.serviceId,
    queryParameters.departmentId,
    queryParameters.insuranceCompanyId,
  ].filter(Boolean).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="relative h-10 min-w-[120px] cursor-pointer border-2 border-gray-300 bg-white font-semibold text-gray-700 shadow-sm transition-all hover:!border-primary hover:!bg-primary/5 hover:!text-primary sm:flex"
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

          {/* Services Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Services</Label>
            <Combobox
              onChange={(value) => handleFilterChange('serviceId', value)}
              options={serviceOptions}
              value={localFilters.serviceId || ''}
              placeholder="Select service..."
              searchPlaceholder="Search services..."
              defaultMaxWidth={false}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Departments Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Departments</Label>
            <Combobox
              onChange={(value) => handleFilterChange('departmentId', value)}
              options={departmentOptions}
              value={localFilters.departmentId || ''}
              placeholder="Select department..."
              searchPlaceholder="Search departments..."
              defaultMaxWidth={false}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Insurance Companies Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Insurance Companies</Label>
            <Combobox
              onChange={(value) => handleFilterChange('insuranceCompanyId', value)}
              options={insuranceCompanyOptions}
              value={localFilters.insuranceCompanyId || ''}
              placeholder="Select insurance company..."
              searchPlaceholder="Search insurance companies..."
              defaultMaxWidth={false}
              className="w-full"
            />
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
