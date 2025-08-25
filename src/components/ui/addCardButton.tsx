import { Plus } from 'lucide-react';
import React, { JSX } from 'react';

type AddCardButtonProps = {
  onClick: () => void;
};
const AddCardButton = ({ onClick }: AddCardButtonProps): JSX.Element => (
  <button
    onClick={onClick}
    className="hover:border-primary hover:text-primary flex cursor-pointer items-center justify-center rounded-[8px] border border-dashed border-gray-300 p-20"
  >
    <Plus />
  </button>
);

export default AddCardButton;
