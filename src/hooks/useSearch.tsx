import { useState, ChangeEvent, SyntheticEvent } from 'react';

export function useSearch(
  handleSubmit?: (event: SyntheticEvent<HTMLFormElement>, search?: string) => void,
): {
  searchTerm: string;
  handleSearch: (event: ChangeEvent<HTMLInputElement>) => void;
} {
  const [searchTerm, setSearchTerm] = useState<string>('');

  function handleSearch(event: ChangeEvent<HTMLInputElement>): void {
    const { value } = event.target;
    setSearchTerm(value);
    if (value === '' && handleSubmit) {
      setSearchTerm('');
      handleSubmit(event as unknown as SyntheticEvent<HTMLFormElement>, '');
    }
  }

  return { searchTerm, handleSearch };
}
