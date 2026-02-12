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
import { Combobox } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ListFilter, RotateCcw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface HospitalFiltersProps {
  queryParameters: {
    city?: string;
    nearMe?: boolean;
    organizationType?: string;
    hasEmergency?: boolean;
    telemedicine?: boolean;
    serviceId?: string;
    departmentId?: string;
    insuranceCompanyId?: string;
    languages?: string[];
    minConsultationFee?: number;
    maxConsultationFee?: number;
    openNow?: boolean;
    open24_7?: boolean;
    onsitePharmacy?: boolean;
    onsiteLabs?: boolean;
    ambulanceServices?: boolean;
  };
  onFilterChange: (filters: {
    city?: string;
    nearMe?: boolean;
    organizationType?: string;
    hasEmergency?: boolean;
    telemedicine?: boolean;
    serviceId?: string;
    departmentId?: string;
    insuranceCompanyId?: string;
    languages?: string[];
    minConsultationFee?: number;
    maxConsultationFee?: number;
    openNow?: boolean;
    open24_7?: boolean;
    onsitePharmacy?: boolean;
    onsiteLabs?: boolean;
    ambulanceServices?: boolean;
  }) => void;
  onReset: () => void;
  totalResults?: number;
}

const locationOptions = [
  { value: 'near_me', label: 'Near Me (TODO)' },
  { value: '', label: 'All Cities' },
  { value: 'Accra', label: 'Accra' },
  { value: 'Aflao', label: 'Aflao' },
  { value: 'Ashaiman', label: 'Ashaiman' },
  { value: 'Bolgatanga', label: 'Bolgatanga' },
  { value: 'Cape Coast', label: 'Cape Coast' },
  { value: 'Elmina', label: 'Elmina' },
  { value: 'Ho', label: 'Ho' },
  { value: 'Hohoe', label: 'Hohoe' },
  { value: 'Koforidua', label: 'Koforidua' },
  { value: 'Kumasi', label: 'Kumasi' },
  { value: 'Nkawkaw', label: 'Nkawkaw' },
  { value: 'Obuasi', label: 'Obuasi' },
  { value: 'Sekondi', label: 'Sekondi' },
  { value: 'Sunyani', label: 'Sunyani' },
  { value: 'Takoradi', label: 'Takoradi' },
  { value: 'Tamale', label: 'Tamale' },
  { value: 'Techiman', label: 'Techiman' },
  { value: 'Tema', label: 'Tema' },
  { value: 'Teshie', label: 'Teshie' },
  { value: 'Wa', label: 'Wa' },
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

  const handleFilterChange = (key: string, value: unknown) => {
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
      nearMe: undefined,
      organizationType: '',
      hasEmergency: undefined,
      telemedicine: undefined,
      serviceId: '',
      departmentId: '',
      insuranceCompanyId: '',
      languages: undefined,
      minConsultationFee: undefined,
      maxConsultationFee: undefined,
      openNow: undefined,
      open24_7: undefined,
      onsitePharmacy: undefined,
      onsiteLabs: undefined,
      ambulanceServices: undefined,
    };
    setLocalFilters(resetFilters);
    onReset();
    setOpen(false);
  };

  // Location value for combobox: "near_me" or city (empty string = All Cities)
  const locationValue =
    localFilters.nearMe === true
      ? 'near_me'
      : (localFilters.city ?? '');

  const setLocationValue = (value: string) => {
    if (value === 'near_me') {
      handleFilterChange('nearMe', true);
      handleFilterChange('city', '');
    } else {
      handleFilterChange('nearMe', undefined);
      handleFilterChange('city', value);
    }
  };

  // Open Now / 24/7: mutually exclusive options
  const openScheduleValue =
    localFilters.open24_7 === true ? '24_7' : localFilters.openNow === true ? 'open_now' : 'any';

  const setOpenScheduleValue = (value: string) => {
    handleFilterChange('openNow', value === 'open_now' ? true : undefined);
    handleFilterChange('open24_7', value === '24_7' ? true : undefined);
  };

  const activeFilterCount = [
    queryParameters.city,
    queryParameters.nearMe === true,
    queryParameters.departmentId,
    queryParameters.insuranceCompanyId,
    queryParameters.minConsultationFee != null,
    queryParameters.maxConsultationFee != null,
    queryParameters.openNow === true,
    queryParameters.open24_7 === true,
    queryParameters.onsitePharmacy === true,
    queryParameters.onsiteLabs === true,
    queryParameters.ambulanceServices === true,
    queryParameters.telemedicine === true,
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
          {/* 1. Location */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Location</Label>
            <Combobox
              onChange={(value) => setLocationValue(value)}
              options={locationOptions}
              value={locationValue}
              placeholder="Select location..."
              searchPlaceholder="Search location..."
              defaultMaxWidth={false}
              className="w-full"
            />
          </div>

          <Separator />

          {/* 2. Specialty / Department */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Specialty / Department</Label>
            <Combobox
              onChange={(value) => handleFilterChange('departmentId', value)}
              options={departmentOptions}
              value={localFilters.departmentId || ''}
              placeholder="Select specialty or department..."
              searchPlaceholder="Search specialty or department..."
              defaultMaxWidth={false}
              className="w-full"
            />
          </div>

          <Separator />

          {/* 3. Insurance */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Insurance</Label>
            <Combobox
              onChange={(value) => handleFilterChange('insuranceCompanyId', value)}
              options={insuranceCompanyOptions}
              value={localFilters.insuranceCompanyId || ''}
              placeholder="Select insurance..."
              searchPlaceholder="Search insurance..."
              defaultMaxWidth={false}
              className="w-full"
            />
          </div>

          <Separator />

          {/* 4. Consultation fee (min–max range) */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Consultation fee (range)</Label>
            <p className="text-xs text-gray-500">Minimum to maximum (inclusive)</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                step={1}
                placeholder="Min"
                value={localFilters.minConsultationFee ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  handleFilterChange('minConsultationFee', v === '' ? undefined : Number(v));
                }}
                className="w-full"
              />
              <span className="text-gray-500">–</span>
              <Input
                type="number"
                min={0}
                step={1}
                placeholder="Max"
                value={localFilters.maxConsultationFee ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  handleFilterChange('maxConsultationFee', v === '' ? undefined : Number(v));
                }}
                className="w-full"
              />
            </div>
          </div>

          <Separator />

          {/* 5. Open Now OR 24/7 */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Opening</Label>
            <RadioGroup
              value={openScheduleValue}
              onValueChange={setOpenScheduleValue}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="any" id="open-any" />
                <Label htmlFor="open-any" className="font-normal cursor-pointer">Any</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="open_now" id="open-now" />
                <Label htmlFor="open-now" className="font-normal cursor-pointer">Open Now</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="24_7" id="open-24-7" />
                <Label htmlFor="open-24-7" className="font-normal cursor-pointer">24/7</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* 6. Onsite pharmacy */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="onsite-pharmacy" className="text-sm font-medium">
                Onsite pharmacy
              </Label>
              <p className="text-xs text-gray-500">Hospital has an onsite pharmacy</p>
            </div>
            <Switch
              id="onsite-pharmacy"
              checked={localFilters.onsitePharmacy === true}
              onCheckedChange={(checked) =>
                handleFilterChange('onsitePharmacy', checked ? true : undefined)
              }
            />
          </div>

          {/* 7. Onsite labs */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="onsite-labs" className="text-sm font-medium">
                Onsite labs
              </Label>
              <p className="text-xs text-gray-500">Hospital has onsite laboratory services</p>
            </div>
            <Switch
              id="onsite-labs"
              checked={localFilters.onsiteLabs === true}
              onCheckedChange={(checked) =>
                handleFilterChange('onsiteLabs', checked ? true : undefined)
              }
            />
          </div>

          {/* 8. Ambulance services */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="ambulance" className="text-sm font-medium">
                Ambulance services
              </Label>
              <p className="text-xs text-gray-500">Hospital provides ambulance services</p>
            </div>
            <Switch
              id="ambulance"
              checked={localFilters.ambulanceServices === true}
              onCheckedChange={(checked) =>
                handleFilterChange('ambulanceServices', checked ? true : undefined)
              }
            />
          </div>

          {/* 9. Telemedicine support */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="telemedicine" className="text-sm font-medium">
                Telemedicine support
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
