'use client';
import { useRouter } from 'next/navigation';
import React, { JSX, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/select';
import { MAX_AMOUNT, MIN_AMOUNT, specialties } from '@/constants/constants';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Search, Stethoscope, Banknote, Sparkles } from 'lucide-react';

const SearchDoctorsCard = (): JSX.Element => {
  const router = useRouter();
  const [params, setParams] = useState({
    specialty: '',
    search: '',
    priceMax: '500',
  });

  const findMedical = (): void =>
    router.push(
      `/dashboard/find-doctor?specialty=${params.specialty}&search=${params.search}&priceMax=${params.priceMax}`,
    );

  return (
    <div className="bg-primary bg-arc1 relative w-full overflow-hidden rounded-2xl bg-no-repeat">
      {/* Decorative blobs */}
      <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-6 -left-6 h-36 w-36 rounded-full bg-white/5 blur-2xl" />

      {/* Header */}
      <div className="relative flex flex-col gap-2 px-5 pt-6 pb-5 sm:px-7 sm:pt-8 sm:pb-6 md:px-8 md:pt-9 md:pb-7">
        <div className="mb-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold tracking-wide text-white/90 uppercase backdrop-blur-sm">
          <Sparkles className="h-3 w-3" />
          Smart Doctor Search
        </div>
        <h2 className="text-xl leading-tight font-bold text-white sm:text-2xl md:text-3xl">
          Find the right doctor for you, <span className="text-white/80">faster</span>
        </h2>
        <p className="max-w-md text-xs leading-relaxed text-white/70 sm:text-sm">
          Search top qualified doctors and book an appointment online — all in one place.
        </p>
      </div>

      {/* Search Panel */}
      <div className="relative mx-4 mb-5 rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] ring-1 ring-black/5 sm:mx-6 sm:mb-6 md:mx-8 md:mb-8">
        <div className="flex flex-col divide-y divide-gray-100 sm:flex-row sm:divide-x sm:divide-y-0">
          {/* Specialty */}
          <div className="group flex min-w-0 flex-1 flex-col px-4 py-4 transition-colors hover:bg-gray-50/60 sm:rounded-l-2xl sm:px-5 sm:py-5">
            <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              <Stethoscope className="text-primary h-3 w-3 shrink-0" />
              Specialty
            </label>
            <Combobox
              isLoading={false}
              onChange={(value) => setParams((prev) => ({ ...prev, specialty: value }))}
              options={specialties}
              value={params.specialty}
              placeholder="Any specialty"
              searchPlaceholder="Search specialty..."
              defaultMaxWidth={false}
              className="h-9 border-none bg-transparent p-0 text-sm font-semibold text-gray-900 placeholder:font-normal placeholder:text-gray-400 focus-visible:ring-0 sm:text-base"
              wrapperClassName="gap-0"
            />
          </div>

          {/* Divider on mobile between specialty and search */}
          {/* Doctor Name */}
          <div className="group flex min-w-0 flex-1 flex-col px-4 py-4 transition-colors hover:bg-gray-50/60 sm:px-5 sm:py-5">
            <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              <Search className="text-primary h-3 w-3 shrink-0" />
              Doctor Name
            </label>
            <Input
              type="text"
              placeholder="e.g. Dr. Smith"
              className="h-9 border-none bg-transparent p-0 text-sm font-semibold text-gray-900 placeholder:font-normal placeholder:text-gray-400 focus:ring-0 focus-visible:ring-0 sm:text-base"
              wrapperClassName="gap-0"
              value={params.search}
              onChange={(event) => setParams((prev) => ({ ...prev, search: event.target.value }))}
              defaultMaxWidth={false}
            />
          </div>
        </div>

        {/* Budget Row */}
        <div className="border-t border-gray-100 px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            {/* Slider section */}
            <div className="flex-1">
              <div className="mb-2.5 flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  <Banknote className="text-primary h-3 w-3 shrink-0" />
                  Max Budget
                </label>
                <div className="bg-primary/8 text-primary flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold">
                  <span className="opacity-60">GHS</span>
                  <span>{Number(params.priceMax || MIN_AMOUNT).toLocaleString()}</span>
                </div>
              </div>
              <Slider
                value={[Number(params.priceMax)]}
                onValueChange={(value) =>
                  setParams((prev) => ({ ...prev, priceMax: String(value[0]) }))
                }
                min={MIN_AMOUNT}
                max={MAX_AMOUNT}
                step={10}
                className="py-1"
              />
              <div className="mt-1.5 flex justify-between text-[10px] text-gray-400">
                <span>GHS {MIN_AMOUNT}</span>
                <span>GHS {MAX_AMOUNT.toLocaleString()}</span>
              </div>
            </div>

            {/* CTA */}
            <Button
              child={
                <span className="flex items-center gap-2 font-semibold">
                  <Search className="h-4 w-4" />
                  <span>Find Doctors</span>
                </span>
              }
              onClick={findMedical}
              className="bg-primary hover:bg-primary/90 h-12 w-full shrink-0 rounded-xl px-6 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-[0.98] sm:h-11 sm:w-auto sm:px-7"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default SearchDoctorsCard;
