import { NotFound } from '@/assets/images';
import SkeletonDoctorPatientCard from '@/components/skeleton/skeletonDoctorPatientCard';
import { Button } from '@/components/ui/button';
import { OptionsMenu } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { PaginationData } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { useSearch } from '@/hooks/useSearch';
import { getAllDoctors } from '@/lib/features/doctors/doctorsThunk';
import { useAppDispatch } from '@/lib/hooks';
import { showErrorToast } from '@/lib/utils';
import { IDoctor } from '@/types/doctor.interface';
import { AcceptDeclineStatus, OrderDirection } from '@/types/shared.enum';
import { IPagination, IQueryParams } from '@/types/shared.interface';
import { ChevronUp, ListFilter, Search, SendHorizontal, UserRound } from 'lucide-react';
import Image from 'next/image';
import React, {
  ChangeEvent,
  FormEvent,
  JSX,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import DoctorCard from '@/app/dashboard/(patient)/_components/doctorCard';
import { genderOptions, MAX_AMOUNT, MIN_AMOUNT, specialties } from '@/constants/constants';
import { useQueryParam } from '@/hooks/useQueryParam';
import { Suggested } from '@/app/dashboard/_components/patientHome/_component/suggested';
import { Combobox } from '@/components/ui/select';

const Doctors = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { searchTerm, handleSearch } = useSearch(handleSubmit);
  const [isLoading, setIsLoading] = useState(true);
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [paginationData, setPaginationData] = useState<PaginationData | undefined>(undefined);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const { getQueryParam } = useQueryParam();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const previousFiltersRef = useRef<Record<string, string>>({});
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [filterInputs, setFilterInputs] = useState({
    priceMin: '',
    priceMax: getQueryParam('priceMax') || '',
    experienceMin: '',
    experienceMax: '',
    rateMin: '',
    rateMax: '',
  });

  const [queryParameters, setQueryParameters] = useState<IQueryParams<AcceptDeclineStatus>>({
    page: 1,
    orderDirection: OrderDirection.Descending,
    orderBy: 'createdAt',
    search: getQueryParam('search'),
    pageSize: 20,
    status: AcceptDeclineStatus.Accepted,
    priceMin: '',
    priceMax: getQueryParam('priceMax'),
    experienceMin: '',
    experienceMax: '',
    gender: '',
    specialty: getQueryParam('specialty'),
    rateMin: '',
    rateMax: '',
    booking: true,
  });

  const validateAndCorrectPrice = (
    field: 'priceMin' | 'priceMax',
    value: string,
    currentFilters: typeof filterInputs,
  ): { corrected: typeof filterInputs; needsCorrection: boolean } => {
    if (!value) {
      return { corrected: currentFilters, needsCorrection: false };
    }

    const numValue = Number.parseFloat(value);
    if (Number.isNaN(numValue)) {
      return { corrected: currentFilters, needsCorrection: false };
    }

    const fieldLabel = field === 'priceMin' ? 'minimum' : 'maximum';

    if (numValue < MIN_AMOUNT) {
      toast({
        title: 'Price Auto-Corrected',
        description: `The ${fieldLabel} price cannot be less than GHS ${MIN_AMOUNT}.`,
        variant: 'default',
      });
      return {
        corrected: { ...currentFilters, [field]: MIN_AMOUNT.toString() },
        needsCorrection: true,
      };
    }

    if (numValue > MAX_AMOUNT) {
      toast({
        title: 'Price Auto-Corrected',
        description: `The ${fieldLabel} price cannot exceed GHS ${MAX_AMOUNT}.`,
        variant: 'default',
      });
      return {
        corrected: { ...currentFilters, [field]: MAX_AMOUNT.toString() },
        needsCorrection: true,
      };
    }

    return { corrected: currentFilters, needsCorrection: false };
  };

  const validateAllPrices = (
    filters: typeof filterInputs,
  ): { correctedFilters: typeof filterInputs; needsCorrection: boolean } => {
    let correctedFilters = { ...filters };
    let needsCorrection = false;

    for (const field of ['priceMin', 'priceMax'] as const) {
      const result = validateAndCorrectPrice(field, filters[field], correctedFilters);
      correctedFilters = result.corrected;
      needsCorrection = needsCorrection || result.needsCorrection;
    }

    return { correctedFilters, needsCorrection };
  };

  const hasFiltersChanged = (newFilters: typeof filterInputs): boolean =>
    Object.keys(newFilters).some(
      (key) => newFilters[key as keyof typeof newFilters] !== previousFiltersRef.current[key],
    );

  const applyFilterChanges = (correctedFilters: typeof filterInputs): void => {
    previousFiltersRef.current = { ...correctedFilters };
    setDoctors([]);
    setQueryParameters((prev) => ({
      ...prev,
      ...correctedFilters,
      page: 1,
    }));
  };

  useEffect(() => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    validationTimeoutRef.current = setTimeout(() => {
      const { correctedFilters, needsCorrection } = validateAllPrices(filterInputs);

      if (needsCorrection) {
        setFilterInputs(correctedFilters);
        return;
      }

      if (hasFiltersChanged(correctedFilters)) {
        applyFilterChanges(correctedFilters);
      }
    }, 1000);

    return (): void => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [filterInputs]);

  const canLoadMorePages = (): boolean => {
    if (!queryParameters?.page || !paginationData) {
      return false;
    }
    return queryParameters.page < paginationData.totalPages;
  };

  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      const canLoadMore = target.isIntersecting && canLoadMorePages() && !isLoading;

      if (canLoadMore) {
        setQueryParameters((prev) => ({
          ...prev,
          page: (prev.page ?? 0) + 1,
        }));
      }
    },
    [paginationData, queryParameters, isLoading],
  );

  useEffect(() => {
    async function allDoctors(): Promise<void> {
      setIsLoading(true);
      const { payload } = await dispatch(getAllDoctors(queryParameters));

      if (payload && showErrorToast(payload)) {
        toast(payload);
        setIsLoading(false);
        return;
      }
      const { rows, ...pagination } = payload as IPagination<IDoctor>;
      setDoctors((prev) => (queryParameters.page === 1 ? rows : [...prev, ...rows]));
      setPaginationData(pagination);
      setIsLoading(false);
    }

    void allDoctors();
  }, [queryParameters]);

  useEffect(() => {
    const handleScroll = (): void => {
      const isAtBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight;
      const isAtTop = window.scrollY === 0;

      setShowScrollToTop(isAtBottom ? true : !isAtTop);
    };

    window.addEventListener('scroll', handleScroll);
    return (): void => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!observerRef.current) {
      return;
    }

    const observer = new IntersectionObserver(observerCallback, { threshold: 1.0 });
    observer.observe(observerRef.current);

    return (): void => observer.disconnect();
  }, [observerRef.current, observerCallback]);

  function handleSubmit(event: FormEvent<HTMLFormElement>, search?: string): void {
    event.preventDefault();
    setDoctors([]);
    setQueryParameters((prev) => ({
      ...prev,
      page: 1,
      search: search ?? searchTerm,
    }));
  }

  function scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowScrollToTop(false);
  }

  function handleValueChange(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;

    setFilterInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <>
      <div className="bg-grayscale-100 z-20 mb-6 flex w-full flex-col flex-wrap gap-2 rounded-md p-5 lg:sticky lg:top-0">
        <div className="flex">
          <form className="flex w-full max-w-2xl gap-2" onSubmit={handleSubmit}>
            <Input
              error=""
              placeholder={'Search for a Doctor'}
              className="w-full"
              type="search"
              leftIcon={<Search className="text-gray-500" size={20} />}
              onChange={handleSearch}
              defaultMaxWidth={false}
            />
            {searchTerm && <Button child={<SendHorizontal />} />}
          </form>
          <div className="ml-2 flex gap-2">
            <Button
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
              className="h-10 cursor-pointer bg-gray-50 sm:flex lg:hidden"
              variant="outline"
              child={
                <>
                  <ListFilter className="mr-2 h-4 w-4" /> Filters
                </>
              }
            />
          </div>
        </div>
        <div className={`${showAdvancedFilters ? 'flex' : 'hidden'} mt-2 flex-wrap gap-4 lg:flex`}>
          <Input
            labelName="Min Price"
            placeholder={`GHS ${MIN_AMOUNT}`}
            wrapperClassName="max-w-52  max-h-[62px]"
            defaultMaxWidth={false}
            type="number"
            name="priceMin"
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            value={filterInputs.priceMin}
            onChange={handleValueChange}
          />
          <Input
            labelName="Max Price"
            placeholder={`GHS ${MAX_AMOUNT}`}
            wrapperClassName="max-w-52  max-h-[62px]"
            defaultMaxWidth={false}
            type="number"
            name="priceMax"
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            value={filterInputs.priceMax}
            onChange={handleValueChange}
          />
          <Input
            labelName="Min Rating"
            placeholder="0"
            wrapperClassName="max-w-52  max-h-[62px]"
            defaultMaxWidth={false}
            type="number"
            name="rateMin"
            value={filterInputs.rateMin}
            onChange={handleValueChange}
          />
          <Input
            labelName="Max Rating"
            placeholder="5"
            wrapperClassName="max-w-52  max-h-[62px]"
            defaultMaxWidth={false}
            type="number"
            name="rateMax"
            value={filterInputs.rateMax}
            onChange={handleValueChange}
          />
          <Input
            labelName="Min Experience"
            placeholder="0 year"
            wrapperClassName="max-w-52  max-h-[62px]"
            defaultMaxWidth={false}
            type="number"
            name="experienceMin"
            value={filterInputs.experienceMin}
            onChange={handleValueChange}
          />
          <Input
            labelName="Max Experience"
            placeholder="10 years"
            wrapperClassName="max-w-52  max-h-[62px]"
            defaultMaxWidth={false}
            type="number"
            name="experienceMax"
            value={filterInputs.experienceMax}
            onChange={handleValueChange}
          />
          <Combobox
            onChange={(value) => {
              setDoctors([]);
              setQueryParameters((prev) => ({ ...prev, specialty: value, page: 1 }));
            }}
            label="Specialty"
            options={[{ value: '', label: 'All' }, ...specialties]}
            value={queryParameters?.specialty ?? ''}
            className="max-h-[62px] px-4"
            placeholder="Search by specialty..."
            searchPlaceholder="Search for specialty..."
            defaultMaxWidth={false}
            wrapperClassName="text-left text-[#111111] max-w-52 max-h-[62px]"
          />
          <OptionsMenu
            options={genderOptions}
            Icon={UserRound}
            menuTrigger="Gender"
            selected={queryParameters.gender}
            setSelected={(value) => {
              setQueryParameters((prev) => ({
                ...prev,
                page: 1,
                gender: value,
              }));
              setDoctors([]);
            }}
            className="mt-[20px] h-10 max-h-[62px] cursor-pointer bg-gray-50 sm:flex"
          />
        </div>
        {paginationData && paginationData.total > 0 && (
          <div className="mt-3 flex items-center gap-2 border-t border-gray-200 pt-3 text-sm text-gray-600">
            <span className="text-primary font-semibold">
              {paginationData.total} {paginationData.total === 1 ? 'Doctor' : 'Doctors'}
            </span>
            <span>available</span>
            {queryParameters.search && <span>matching &quot;{queryParameters.search}&quot;</span>}
          </div>
        )}
      </div>
      <Suggested title={'Doctors'} showViewAll={false}>
        {!isLoading &&
          doctors.map((doctor) => (
            <div className="cursor-pointer" key={doctor.id}>
              <DoctorCard key={doctor.id} doctor={doctor} />
            </div>
          ))}
      </Suggested>
      {isLoading && (
        <div className="mt-2 flex flex-wrap gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonDoctorPatientCard key={index} />
          ))}
        </div>
      )}
      {!isLoading && doctors.length === 0 && (
        <section>
          {
            <Image
              src={NotFound}
              alt="Not Found"
              width={100}
              height={100}
              className="m-auto h-[60vh] w-[60vw]"
            />
          }
          <p className="mt-4 text-center text-lg md:text-xl"> Sorry nothing to find here </p>
        </section>
      )}
      <button
        onClick={scrollToTop}
        className={`bg-primary fixed right-6 bottom-6 z-50 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-opacity ${
          showScrollToTop ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <ChevronUp size={24} />
      </button>
      <div ref={observerRef} className="h-10" />
    </>
  );
};

export default Doctors;
