'use client';
import { Badge } from '@/components/ui/badge';
import { OptionsMenu } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { TableData } from '@/components/ui/table';
import { Gender, OrderDirection } from '@/types/shared.enum';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowDownAZ, ChevronsUpDown, Eye, ListFilter } from 'lucide-react';
import React, { JSX, useState } from 'react';

export type ManagedClientProps = {
  id: string;
  patient: string;
  gender: Gender;
  clinic: string;
  consult: string;
};

const ManagedClientsPanel = (): JSX.Element => {
  const data: ManagedClientProps[] = [
    {
      id: '728ed52f',
      patient: 'Akiti Nebu',
      gender: Gender.Male,
      clinic: '37 Military Hospital',
      consult: 'Jun 23, 2024',
    },
    {
      id: '728ed52f',
      patient: 'Opo lapo',
      gender: Gender.Female,
      clinic: '37 Military Hospital',
      consult: 'Jun 23, 2023',
    },
    {
      id: '728ed52f',
      patient: 'Ataa',
      gender: Gender.Male,
      clinic: 'UGMC',
      consult: 'Jun 25, 2025',
    },
    {
      id: '728ed52f',
      patient: 'Ataa',
      gender: Gender.Male,
      clinic: 'UGMC',
      consult: 'Jun 25, 2025',
    },
    {
      id: '728ed52f',
      patient: 'Ataa',
      gender: Gender.Male,
      clinic: 'UGMC',
      consult: 'Jun 25, 2025',
    },
  ];

  const [sort, setSort] = useState<string>();
  //Todo: To be replaced with the right options
  const options = [
    {
      value: OrderDirection.Ascending,
      label: 'Ascending',
    },
    {
      value: OrderDirection.Descending,
      label: 'Descending',
    },
  ];

  const [filter, setFilter] = useState<string>();
  const filterOptions = [
    {
      value: OrderDirection.Ascending,
      label: 'Ascending',
    },
    {
      value: OrderDirection.Descending,
      label: 'Descending',
    },
  ];
  return (
    <div className="mt-4 rounded-lg bg-white">
      <div className="p-6">
        <p className="py-6 text-xl font-bold">Managed clients</p>
        <div className="mb-4 flex flex-wrap justify-between">
          <div className="mb-2 flex gap-2">
            <Input error="" placeholder="Search Patient" className="max-w-[333px] sm:w-[333px]" />
            <OptionsMenu
              options={filterOptions}
              Icon={ListFilter}
              menuTrigger="Filter"
              selected={filter}
              setSelected={setFilter}
              className="border-transparent"
            />
          </div>
          <OptionsMenu
            options={options}
            Icon={ArrowDownAZ}
            menuTrigger="Sort By"
            selected={sort}
            setSelected={setSort}
            className="hidden h-10 bg-gray-50 sm:flex"
          />
        </div>
        <TableData columns={columns} data={data} />
      </div>
    </div>
  );
};

export default ManagedClientsPanel;

const columns: ColumnDef<ManagedClientProps>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'patient',
    header: ({ column }) => (
      <div
        className="flex cursor-pointer whitespace-nowrap"
        onClick={() => {
          //Todo: Api integration for sorting
          console.log(column);
        }}
      >
        Patient Name <ChevronsUpDown className="ml-2 h-4 w-4" />
      </div>
    ),
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
    cell: ({ row }) => (
      <div>
        <Badge variant={row.getValue('gender') == 'male' ? 'brown' : 'blue'}>
          {row.getValue('gender')}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'clinic',
    header: 'Clinic/Unit',
  },
  {
    accessorKey: 'consult',
    header: ({ column }) => (
      <div
        className="flex cursor-pointer whitespace-nowrap"
        onClick={() => {
          //Todo: Api integration for sorting
          console.log(column);
        }}
      >
        Recent Consult <ChevronsUpDown className="ml-2 h-4 w-4" />
      </div>
    ),
  },
  {
    id: 'actions',
    header: 'Action',
    cell: () => (
      <div className="flex gap-2 text-sm text-black">
        <Eye /> View
      </div>
    ),
  },
];
