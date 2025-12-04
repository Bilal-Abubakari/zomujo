import { NotFound } from '@/assets/images';
import SkeletonDoctorPatientCard from '@/components/skeleton/skeletonDoctorPatientCard';
import { Button } from '@/components/ui/button';
import { OptionsMenu } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { PaginationData } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { useSearch } from '@/hooks/useSearch';
import { getAllHospitals } from '@/lib/features/hospitals/hospitalThunk';
import { useAppDispatch } from '@/lib/hooks';
import { showErrorToast } from '@/lib/utils';
import { IHospitalListItem } from '@/types/hospital.interface';
import { AcceptDeclineStatus, OrderDirection } from '@/types/shared.enum';
import { IPagination, IQueryParams } from '@/types/shared.interface';
import { ChevronUp, ListFilter, Search, SendHorizontal, Building2 } from 'lucide-react';
import Image from 'next/image';
import React, {
  FormEvent,
  JSX,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import HospitalCard from '@/app/dashboard/(patient)/_components/hospitalCardNew';
import { useQueryParam } from '@/hooks/useQueryParam';
import { Suggested } from '@/app/dashboard/_components/patientHome/_component/suggested';
import { Combobox } from '@/components/ui/select';

const organizationTypeOptions = [
  { value: '', label: 'All' },
  { value: 'private', label: 'Private' },
  { value: 'public', label: 'Public' },
  { value: 'teaching', label: 'Teaching' },
  { value: 'clinic', label: 'Clinic' },
];

const Hospitals = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { searchTerm, handleSearch } = useSearch(handleSubmit);
  const [isLoading, setIsLoading] = useState(true);
  const [hospitals, setHospitals] = useState<IHospitalListItem[]>([]);
  const [paginationData, setPaginationData] = useState<PaginationData | undefined>(undefined);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const { getQueryParam } = useQueryParam();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [queryParameters, setQueryParameters] = useState<
    IQueryParams<AcceptDeclineStatus> & {
      city?: string;
      organizationType?: string;
      hasEmergency?: boolean;
      telemedicine?: boolean;
    }
  >({
    page: 1,
    orderDirection: OrderDirection.Descending,
    orderBy: 'createdAt',
    search: getQueryParam('search'),
    pageSize: 20,
    status: AcceptDeclineStatus.Accepted,
    isActive: true,
    city: getQueryParam('city') || '',
    organizationType: getQueryParam('organizationType') || '',
    hasEmergency: getQueryParam('hasEmergency') === 'true',
    telemedicine: getQueryParam('telemedicine') === 'true',
  });

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
    async function allHospitals(): Promise<void> {
      setIsLoading(true);
      const { payload } = await dispatch(getAllHospitals(queryParameters));

      if (payload && showErrorToast(payload)) {
        toast(payload);
        setIsLoading(false);
        return;
      }
      const { rows, ...pagination } = payload as IPagination<IHospitalListItem>;
      setHospitals((prev) => (queryParameters.page === 1 ? rows : [...prev, ...rows]));
      setPaginationData(pagination);
      setIsLoading(false);
    }

    void allHospitals();
  }, [queryParameters, dispatch]);

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
    setHospitals([]);
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

  return (
    <>
      <div className="bg-grayscale-100 z-20 mb-6 flex w-full flex-col flex-wrap gap-2 rounded-md p-5 lg:sticky lg:top-0">
        <div className="flex">
          <form className="flex w-full max-w-2xl gap-2" onSubmit={handleSubmit}>
            <Input
              error=""
              placeholder={'Search for a Hospital'}
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
            labelName="City"
            placeholder="Enter city"
            wrapperClassName="max-w-52  max-h-[62px]"
            defaultMaxWidth={false}
            type="text"
            value={queryParameters.city || ''}
            onChange={(e) => {
              setHospitals([]);
              setQueryParameters((prev) => ({ ...prev, city: e.target.value, page: 1 }));
            }}
          />
          <Combobox
            onChange={(value) => {
              setHospitals([]);
              setQueryParameters((prev) => ({ ...prev, organizationType: value, page: 1 }));
            }}
            label="Organization Type"
            options={organizationTypeOptions}
            value={queryParameters?.organizationType ?? ''}
            className="max-h-[62px] px-4"
            placeholder="Select type..."
            searchPlaceholder="Search for type..."
            defaultMaxWidth={false}
            wrapperClassName="text-left text-[#111111] max-w-52 max-h-[62px]"
          />
          <OptionsMenu
            options={[
              { value: '', label: 'All' },
              { value: 'true', label: 'Has Emergency' },
              { value: 'false', label: 'No Emergency' },
            ]}
            Icon={Building2}
            menuTrigger="Emergency"
            selected={queryParameters.hasEmergency?.toString() || ''}
            setSelected={(value) => {
              setQueryParameters((prev) => ({
                ...prev,
                page: 1,
                hasEmergency: value === 'true' ? true : value === 'false' ? false : undefined,
              }));
              setHospitals([]);
            }}
            className="mt-[20px] h-10 max-h-[62px] cursor-pointer bg-gray-50 sm:flex"
          />
          <OptionsMenu
            options={[
              { value: '', label: 'All' },
              { value: 'true', label: 'Telemedicine Available' },
              { value: 'false', label: 'No Telemedicine' },
            ]}
            Icon={Building2}
            menuTrigger="Telemedicine"
            selected={queryParameters.telemedicine?.toString() || ''}
            setSelected={(value) => {
              setQueryParameters((prev) => ({
                ...prev,
                page: 1,
                telemedicine: value === 'true' ? true : value === 'false' ? false : undefined,
              }));
              setHospitals([]);
            }}
            className="mt-[20px] h-10 max-h-[62px] cursor-pointer bg-gray-50 sm:flex"
          />
        </div>
        {paginationData && paginationData.total > 0 && (
          <div className="mt-3 flex items-center gap-2 border-t border-gray-200 pt-3 text-sm text-gray-600">
            <span className="text-primary font-semibold">
              {paginationData.total} {paginationData.total === 1 ? 'Hospital' : 'Hospitals'}
            </span>
            <span>available</span>
            {queryParameters.search && <span>matching &quot;{queryParameters.search}&quot;</span>}
          </div>
        )}
      </div>
      <Suggested title={'Hospitals'} showViewAll={false}>
        {!isLoading &&
          hospitals.map((hospital) => (
            <div className="cursor-pointer" key={hospital.id}>
              <HospitalCard key={hospital.id} hospital={hospital} />
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
      {!isLoading && hospitals.length === 0 && (
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

export default Hospitals;

