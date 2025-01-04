'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SearchDoctorsCard = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const findMedical = () => router.push(`/dashboard/find-medical?search=${search}`);

  return (
    <div className="relative flex w-full flex-col gap-8 rounded-2xl bg-primary bg-arc1 bg-no-repeat p-8">
      <div className="flex flex-col gap-3 text-white">
        <p className="text-xl font-bold leading-6 md:text-2xl">
          Find the right doctor / hospital for you, faster
        </p>
        <p className="max-md:text:sm leading-4">
          Search for top hospitals or qualified doctors and book an appointment online.
        </p>
      </div>
      <div className="flex h-12 w-full flex-row items-center justify-between rounded-xl bg-white p-1.5">
        <Search color={'#8C96A5'} className="ml-1.5" />
        <input
          type="text"
          placeholder="Search by speciality"
          value={search}
          onChange={({ target }) => setSearch(target.value)}
          className="h-full w-full pl-2 outline-none max-md:text-sm"
        />
        <Button
          child="Find"
          onClick={findMedical}
          className="rounded-md bg-black text-white outline-none duration-75 hover:bg-gray-900 max-md:text-sm"
        />
      </div>
    </div>
  );
};
export default SearchDoctorsCard;
