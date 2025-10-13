'use client';
import { CardPayment, MobileMoney } from '@/assets/images';
import { CardProps } from '@/types/payment.interface';
import { Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import React, { JSX } from 'react';

type CardWithActionsProps = CardProps & {
  onEdit: () => void;
  onDelete: () => void;
};

const Card = ({ number, name, type, onEdit, onDelete }: CardWithActionsProps): JSX.Element => (
  <div className="group relative flex h-[139px] w-[139px] flex-col items-start justify-center rounded-[7.32px] border pl-4">
    <div className="absolute top-1 right-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <Pencil
        className="h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-700"
        onClick={onEdit}
      />
      <Trash2
        className="h-4 w-4 cursor-pointer text-red-500 hover:text-red-700"
        onClick={onDelete}
      />
    </div>
    <Image src={type === 'ghipss' ? CardPayment : MobileMoney} alt={type} />
    <p className="mt-4 w-28 truncate font-bold"> {name}</p>
    <p className="truncate text-[12px] font-bold text-gray-400"> {number}</p>
  </div>
);

export default Card;
