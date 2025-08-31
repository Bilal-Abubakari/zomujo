import { NotFound } from '@/assets/images';
import SkeletonDoctorPatientCard from '@/components/skeleton/skeletonDoctorPatientCard';
import { Button } from '@/components/ui/button';
import { ISelected, OptionsMenu } from '@/components/ui/dropdown-menu';
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
import { genderOptions } from '@/constants/constants';
import { useQueryParam } from '@/hooks/useQueryParam';
import { Suggested } from '@/app/dashboard/_components/patientHome/_component/suggested';

const Doctors = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { searchTerm, handleSearch } = useSearch(handleSubmit);
  const [isLoading, setIsLoading] = useState(true);
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [paginationData, setPaginationData] = useState<PaginationData | undefined>(undefined);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const { getQueryParam } = useQueryParam();
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

  const statusFilterOptions: ISelected[] = [
    {
      value: OrderDirection.Ascending,
      label: 'Ascending',
    },
    {
      value: OrderDirection.Descending,
      label: 'Descending',
    },
  ];

  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (queryParameters?.page) {
        const hasMorePages = paginationData && queryParameters.page < paginationData?.totalPages;
        const canLoadMore = target.isIntersecting && hasMorePages && !isLoading;
        if (canLoadMore) {
          setQueryParameters((prev) => ({
            ...prev,
            page: (prev.page ?? 0) + 1,
          }));
        }
      }
    },
    [paginationData, queryParameters],
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
    setDoctors([]);
    setQueryParameters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
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
          <div className="ml-2">
            <OptionsMenu
              options={statusFilterOptions}
              Icon={ListFilter}
              menuTrigger="Filter"
              selected={queryParameters.orderDirection}
              setSelected={(value) => {
                setQueryParameters((prev) => ({
                  ...prev,
                  page: 1,
                  orderDirection: value as OrderDirection,
                }));
                setDoctors([]);
              }}
              className="h-10 cursor-pointer bg-gray-50 sm:flex"
            />
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-4">
          <Input
            labelName="Min Price"
            placeholder="GHS 100"
            wrapperClassName="max-w-52"
            defaultMaxWidth={false}
            type="number"
            name="priceMin"
            onChange={handleValueChange}
          />
          <Input
            labelName="Max Price"
            placeholder="GHS 1000"
            wrapperClassName="max-w-52"
            defaultMaxWidth={false}
            type="number"
            name="priceMax"
            onChange={handleValueChange}
          />
          <Input
            labelName="Min Rating"
            placeholder="0"
            wrapperClassName="max-w-52"
            defaultMaxWidth={false}
            type="number"
            name="rateMin"
            onChange={handleValueChange}
          />
          <Input
            labelName="Max Rating"
            placeholder="5"
            wrapperClassName="max-w-52"
            defaultMaxWidth={false}
            type="number"
            name="rateMax"
            onChange={handleValueChange}
          />
          <Input
            labelName="Min Experience"
            placeholder="0 year"
            wrapperClassName="max-w-52"
            defaultMaxWidth={false}
            type="number"
            name="experienceMin"
            onChange={handleValueChange}
          />
          <Input
            labelName="Max Experience"
            placeholder="10 years"
            wrapperClassName="max-w-52"
            defaultMaxWidth={false}
            type="number"
            name="experienceMax"
            onChange={handleValueChange}
          />
          <Input
            labelName="Speciality"
            placeholder="Global Health"
            wrapperClassName="max-w-52"
            defaultMaxWidth={false}
            type="search"
            name="specialty"
            value={queryParameters.specialty}
            onChange={handleValueChange}
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
            className="mt-auto h-10 cursor-pointer bg-gray-50 sm:flex"
          />
        </div>
      </div>
      <Suggested title={'Doctors'} showViewAll={false}>
        {doctors.map((doctor) => (
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
          <p className="mt-4 text-center text-xl"> Sorry nothing to find here </p>
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
