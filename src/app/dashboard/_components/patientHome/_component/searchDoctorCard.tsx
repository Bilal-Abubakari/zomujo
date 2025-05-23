'use client';
import { useRouter } from 'next/navigation';
import React, { JSX, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/select';
import { specialties } from '@/constants/constants';

const SearchDoctorsCard = (): JSX.Element => {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const findMedical = (): void => router.push(`/dashboard/find-doctor?specialty=${search}`);

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
      <div className="flex h-12 w-full flex-row items-center justify-between gap-2 rounded-xl bg-white p-1.5">
        <Combobox
          isLoading={false}
          onChange={(value) => setSearch(value)}
          options={specialties}
          value={search}
          placeholder="Search by specialty"
          searchPlaceholder="Search specialty..."
          defaultMaxWidth={false}
        />
        <Button
          child="Find"
          onClick={findMedical}
          className="rounded-md bg-black text-white outline-hidden duration-75 hover:bg-gray-900 max-md:text-sm"
          disabled={!search.length}
        />
      </div>
    </div>
  );
};
export default SearchDoctorsCard;
