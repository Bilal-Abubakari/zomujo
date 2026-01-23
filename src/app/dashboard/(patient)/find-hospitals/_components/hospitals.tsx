import { NotFound } from '@/assets/images';
import SkeletonDoctorPatientCard from '@/components/skeleton/skeletonDoctorPatientCard';
import { Button } from '@/components/ui/button';
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
import { ChevronUp, Search, SendHorizontal } from 'lucide-react';
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
import HospitalFilters from './hospitalFilters';

const Hospitals = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { searchTerm, handleSearch } = useSearch(handleSubmit);
  const [isLoading, setIsLoading] = useState(true);
  const [hospitals, setHospitals] = useState<IHospitalListItem[]>([]);
  const [paginationData, setPaginationData] = useState<PaginationData | undefined>(undefined);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const { getQueryParam } = useQueryParam();

  const [queryParameters, setQueryParameters] = useState<
    IQueryParams<AcceptDeclineStatus> & {
      city?: string;
      organizationType?: string;
      hasEmergency?: boolean;
      telemedicine?: boolean;
      serviceId?: string;
      departmentId?: string;
      insuranceCompanyId?: string;
      languages?: string[];
      minBedCount?: number;
      maxBedCount?: number;
    }
  >({
    page: 1,
    orderDirection: OrderDirection.Descending,
    orderBy: 'createdAt',
    search: getQueryParam('search'),
    pageSize: 12,
    status: AcceptDeclineStatus.Accepted,
    isActive: true,
    city: getQueryParam('city') || '',
    organizationType: getQueryParam('organizationType') || '',
    hasEmergency: getQueryParam('hasEmergency') === 'true' ? true : undefined,
    telemedicine: getQueryParam('telemedicine') === 'true' ? true : undefined,
    serviceId: getQueryParam('serviceId') || '',
    departmentId: getQueryParam('departmentId') || '',
    insuranceCompanyId: getQueryParam('insuranceCompanyId') || '',
    languages: getQueryParam('languages') ? getQueryParam('languages').split(',') : undefined,
    minBedCount: getQueryParam('minBedCount') ? Number(getQueryParam('minBedCount')) : undefined,
    maxBedCount: getQueryParam('maxBedCount') ? Number(getQueryParam('maxBedCount')) : undefined,
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

  const handleFilterChange = (filters: {
    city?: string;
    organizationType?: string;
    hasEmergency?: boolean;
    telemedicine?: boolean;
    serviceId?: string;
    departmentId?: string;
    insuranceCompanyId?: string;
    languages?: string[];
    minBedCount?: number;
    maxBedCount?: number;
  }) => {
    setHospitals([]);
    setQueryParameters((prev) => ({
      ...prev,
      ...filters,
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setHospitals([]);
    setQueryParameters((prev) => ({
      ...prev,
      city: '',
      organizationType: '',
      hasEmergency: undefined,
      telemedicine: undefined,
      serviceId: '',
      departmentId: '',
      insuranceCompanyId: '',
      languages: undefined,
      minBedCount: undefined,
      maxBedCount: undefined,
      page: 1,
    }));
  };

  return (
    <>
      {/* Search and Filter Bar - Sticky below title, cards scroll underneath */}
      <div className="sticky top-[56px] z-20 mb-6 pr-2">
        <div className="bg-white flex w-full flex-col gap-4 rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Bar */}
          <form className="flex flex-1 gap-2" onSubmit={handleSubmit}>
            <Input
              error=""
              placeholder="Search hospitals by name, specialty, or location..."
              className="w-full"
              type="search"
              leftIcon={<Search className="text-gray-500" size={20} />}
              onChange={handleSearch}
              defaultMaxWidth={false}
            />
            {searchTerm && (
              <Button type="submit" variant="default" child={<SendHorizontal />} />
            )}
          </form>
          
          {/* Filter Button */}
          <div className="flex items-center gap-2">
            <HospitalFilters
              queryParameters={queryParameters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              totalResults={paginationData?.total}
            />
          </div>
        </div>

        </div>
      </div>
      {isLoading ? (
        <div className="mt-2 flex flex-wrap gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonDoctorPatientCard key={index} />
          ))}
        </div>
        ) : hospitals.length > 0 ? (
          <Suggested title={''} showViewAll={false}>
            {hospitals.map((hospital) => (
              <HospitalCard key={hospital.id} hospital={hospital} />
            ))}
          </Suggested>
        ) : (
        <section>
          <Image
            src={NotFound}
            alt="Not Found"
            width={100}
            height={100}
            className="m-auto h-[60vh] w-[60vw]"
          />
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

