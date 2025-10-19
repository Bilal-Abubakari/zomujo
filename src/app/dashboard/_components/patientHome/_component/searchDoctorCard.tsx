'use client';
import { useRouter } from 'next/navigation';
import React, { JSX, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/select';
import { MAX_AMOUNT, MIN_AMOUNT, specialties } from '@/constants/constants';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

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
    <div className="bg-primary bg-arc1 relative flex w-full flex-col gap-8 rounded-2xl bg-no-repeat p-8">
      <div className="flex flex-col gap-3 text-white">
        <p className="text-xl leading-6 font-bold md:text-2xl">
          Find the right doctor / hospital for you, faster
        </p>
        <p className="max-md:text:sm leading-4">
          Search for top hospitals or qualified doctors and book an appointment online.
        </p>
      </div>
      <div className="flex-baseline flex w-full flex-row flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-1.5 py-2 2xl:flex-nowrap">
        <Combobox
          isLoading={false}
          onChange={(value) => setParams((prev) => ({ ...prev, specialty: value }))}
          options={specialties}
          value={params.specialty}
          placeholder="Search by specialty"
          searchPlaceholder="Search specialty..."
          defaultMaxWidth={false}
          className="py-6"
          label="Specialty"
        />
        <Input
          type="text"
          placeholder="Search by doctors' name"
          className="py-6 font-medium text-[#111111] placeholder:text-[#111111] focus:border-1 focus:border-gray-400 focus:shadow-none focus:outline-none"
          labelName="Doctors' name"
          labelClassName="text-left text-[#111]"
          value={params.search}
          onChange={(event) => setParams((prev) => ({ ...prev, search: event.target.value }))}
          defaultMaxWidth={false}
        />
        <div className="-mt-10 w-full">
          <p className="mt-10 text-left text-sm font-bold text-[#111111] 2xl:mt-2">Max Price</p>
          <Slider
            value={[Number(params.priceMax)]}
            onValueChange={(value) =>
              setParams((prev) => ({ ...prev, priceMax: String(value[0]) }))
            }
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            step={10}
            className="mt-4"
          />
          <div className="absolute mt-2 flex h-5 items-center justify-center rounded-full bg-gray-500 px-2.5">
            <p className="text-xs font-medium text-black">
              GHS {Number(params.priceMax || MIN_AMOUNT).toLocaleString()}{' '}
            </p>
          </div>
        </div>
        <Button
          child="Find"
          onClick={findMedical}
          className="mt-8 rounded-md bg-black text-white outline-hidden duration-75 hover:bg-gray-900 max-md:text-sm 2xl:mt-2"
        />
      </div>
    </div>
  );
};
export default SearchDoctorsCard;
