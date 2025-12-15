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
import React, { FormEvent, JSX, useCallback, useEffect, useRef, useState } from 'react';
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

// Accra coordinates as fallback
const ACCRA_COORDINATES = { lat: 5.6037, lng: -0.187 };

// Extended hospital type with mock data
type HospitalWithMockData = IHospitalListItem & {
  mockPrice?: number;
  mockRating?: number;
  mockDistance?: number;
};

// Generate consistent mock data based on hospital ID
function generateMockData(hospital: IHospitalListItem, index: number): HospitalWithMockData {
  // Simple fixed price distribution between 50-1000 based on index
  // This ensures even distribution across the price range
  const priceStep = 95; // (1000 - 50) / 10 ≈ 95
  const mockPrice = 50 + index * priceStep;

  // Fixed rating distribution between 2.5-5.0
  const ratingStep = 0.25; // (5.0 - 2.5) / 10 = 0.25
  const mockRating = 2.5 + index * ratingStep;

  // Calculate or generate mock distance from Accra
  let mockDistance: number;

  if (hospital.primaryAddress?.city) {
    // Rough estimates based on major cities (in km)
    const cityDistances: Record<string, number> = {
      accra: 5,
      kumasi: 250,
      takoradi: 200,
      tamale: 600,
      'cape coast': 150,
      tema: 30,
      sunyani: 350,
      koforidua: 80,
      ho: 150,
    };

    const cityName = hospital.primaryAddress.city.toLowerCase();
    mockDistance = cityDistances[cityName] || 50 + index * 40;
  } else {
    // Fixed distance based on index if no city info
    mockDistance = 10 + index * 50;
  }

  return {
    ...hospital,
    mockPrice: Math.round(mockPrice),
    mockRating: Math.round(mockRating * 10) / 10,
    mockDistance: Math.round(mockDistance),
  };
}

// Client-side filtering function
function applyClientSideFilters(
  hospitals: HospitalWithMockData[],
  filters: {
    priceMin?: string;
    priceMax?: string;
    rateMin?: string;
    rateMax?: string;
    distanceKm?: string;
  },
): HospitalWithMockData[] {
  return hospitals.filter((hospital) => {
    // Price filter
    if (
      filters.priceMin &&
      hospital.mockPrice &&
      hospital.mockPrice < Number.parseFloat(filters.priceMin)
    ) {
      return false;
    }
    if (
      filters.priceMax &&
      hospital.mockPrice &&
      hospital.mockPrice > Number.parseFloat(filters.priceMax)
    ) {
      return false;
    }

    // Rating filter
    if (
      filters.rateMin &&
      hospital.mockRating &&
      hospital.mockRating < Number.parseFloat(filters.rateMin)
    ) {
      return false;
    }
    if (
      filters.rateMax &&
      hospital.mockRating &&
      hospital.mockRating > Number.parseFloat(filters.rateMax)
    ) {
      return false;
    }

    // Distance filter
    if (
      filters.distanceKm &&
      hospital.mockDistance &&
      hospital.mockDistance > Number.parseFloat(filters.distanceKm)
    ) {
      return false;
    }

    return true;
  });
}

const Hospitals = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { searchTerm, handleSearch } = useSearch(handleSubmit);
  const [isLoading, setIsLoading] = useState(true);
  const [hospitals, setHospitals] = useState<HospitalWithMockData[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<HospitalWithMockData[]>([]);
  const [paginationData, setPaginationData] = useState<PaginationData | undefined>(undefined);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const { getQueryParam } = useQueryParam();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [filterInputs, setFilterInputs] = useState({
    priceMin: '',
    priceMax: '',
    rateMin: '',
    rateMax: '',
    distanceKm: '',
  });
  const validationTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const validateNumber = (value: string): boolean => {
    if (!value) return true;
    return !Number.isNaN(Number.parseFloat(value));
  };

  // Client-side filtering effect for price, rating, and distance
  React.useEffect(() => {
    if (validationTimeoutRef.current) clearTimeout(validationTimeoutRef.current);
    validationTimeoutRef.current = setTimeout(() => {
      // basic validation
      if (
        !validateNumber(filterInputs.priceMin) ||
        !validateNumber(filterInputs.priceMax) ||
        !validateNumber(filterInputs.rateMin) ||
        !validateNumber(filterInputs.rateMax) ||
        !validateNumber(filterInputs.distanceKm)
      ) {
        // don't apply invalid filters
        return;
      }

      // Apply client-side filters
      const filtered = applyClientSideFilters(hospitals, filterInputs);
      setFilteredHospitals(filtered);
    }, 300);

    return () => {
      if (validationTimeoutRef.current) clearTimeout(validationTimeoutRef.current);
    };
  }, [filterInputs, hospitals]);

  const [queryParameters, setQueryParameters] = useState<
    IQueryParams<AcceptDeclineStatus> & {
      city?: string;
      organizationType?: string;
      hasEmergency?: boolean;
      telemedicine?: boolean;
      isActive?: boolean;
    }
  >({
    page: 1,
    orderDirection: OrderDirection.Descending,
    orderBy: 'createdAt',
    search: getQueryParam('search'),
    pageSize: 20,
    status: AcceptDeclineStatus.Accepted,
    isActive: true,
    city: (getQueryParam as any)('city') || '',
    organizationType: (getQueryParam as any)('organizationType') || '',
    hasEmergency: (getQueryParam as any)('hasEmergency') === 'true',
    telemedicine: (getQueryParam as any)('telemedicine') === 'true',
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

      // Enrich hospitals with mock data (pass index for fixed price distribution)
      const enrichedRows = rows.map((hospital, index) => generateMockData(hospital, index));

      // Debug: Log mock data for verification
      console.log(
        'Hospitals with mock data:',
        enrichedRows.map((h) => ({
          name: h.name,
          price: h.mockPrice,
          rating: h.mockRating,
          distance: h.mockDistance,
        })),
      );

      const updatedHospitals =
        queryParameters.page === 1 ? enrichedRows : [...hospitals, ...enrichedRows];
      setHospitals(updatedHospitals);

      // Apply client-side filters
      const filtered = applyClientSideFilters(updatedHospitals, filterInputs);
      setFilteredHospitals(filtered);

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
        <div className={`${showAdvancedFilters ? 'flex' : 'hidden'} mt-2 flex-col gap-3 lg:flex`}>
          {/* Row 1: Location and Organization Filters */}
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:flex-wrap lg:flex-nowrap">
            <Input
              labelName="City"
              placeholder="Enter city"
              wrapperClassName="w-full sm:flex-1 lg:w-auto"
              defaultMaxWidth={false}
              type="text"
              value={queryParameters.city || ''}
              onChange={(e) => {
                setHospitals([]);
                setQueryParameters((prev) => ({ ...prev, city: e.target.value, page: 1 }));
              }}
            />
            <Input
              labelName="Distance (km)"
              placeholder="10"
              wrapperClassName="w-full sm:flex-1 lg:w-auto"
              defaultMaxWidth={false}
              type="number"
              name="distanceKm"
              value={filterInputs.distanceKm}
              onChange={(e) => setFilterInputs((p) => ({ ...p, distanceKm: e.target.value }))}
            />
            <Combobox
              onChange={(value) => {
                setHospitals([]);
                setQueryParameters((prev) => ({ ...prev, organizationType: value, page: 1 }));
              }}
              label="Organization Type"
              options={organizationTypeOptions}
              value={queryParameters?.organizationType ?? ''}
              className="px-4"
              placeholder="Select type..."
              searchPlaceholder="Search for type..."
              defaultMaxWidth={false}
              wrapperClassName="col-span-2 w-full text-left text-[#111111] sm:col-span-1 sm:flex-1 lg:w-auto"
            />
            <div className="w-full sm:flex-1 lg:w-auto">
              <label className="mb-1 block text-sm font-medium text-gray-700">Emergency</label>
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
                className="h-10 w-full cursor-pointer bg-gray-50"
              />
            </div>
            <div className="w-full sm:flex-1 lg:w-auto">
              <label className="mb-1 block text-sm font-medium text-gray-700">Telemedicine</label>
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
                className="h-10 w-full cursor-pointer bg-gray-50"
              />
            </div>
          </div>

          {/* Row 2: Price, Rating, and Distance Filters */}
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:flex-wrap lg:flex-nowrap">
            <Input
              labelName="Min Price"
              placeholder="GHC 0"
              wrapperClassName="w-full sm:flex-1 lg:w-auto"
              defaultMaxWidth={false}
              type="number"
              name="priceMin"
              value={filterInputs.priceMin}
              onChange={(e) => setFilterInputs((p) => ({ ...p, priceMin: e.target.value }))}
            />
            <Input
              labelName="Max Price"
              placeholder="GHC 1000"
              wrapperClassName="w-full sm:flex-1 lg:w-auto"
              defaultMaxWidth={false}
              type="number"
              name="priceMax"
              value={filterInputs.priceMax}
              onChange={(e) => setFilterInputs((p) => ({ ...p, priceMax: e.target.value }))}
            />
            <Input
              labelName="Min Rating"
              placeholder="0"
              wrapperClassName="w-full sm:flex-1 lg:w-auto"
              defaultMaxWidth={false}
              type="number"
              name="rateMin"
              min={0}
              max={5}
              value={filterInputs.rateMin}
              onChange={(e) => setFilterInputs((p) => ({ ...p, rateMin: e.target.value }))}
            />
            <Input
              labelName="Max Rating"
              placeholder="5"
              wrapperClassName="w-full sm:flex-1 lg:w-auto"
              defaultMaxWidth={false}
              type="number"
              name="rateMax"
              min={0}
              max={5}
              value={filterInputs.rateMax}
              onChange={(e) => setFilterInputs((p) => ({ ...p, rateMax: e.target.value }))}
            />
          </div>
        </div>
        {paginationData && paginationData.total > 0 && (
          <div className="mt-3 flex items-center gap-2 border-t border-gray-200 pt-3 text-sm text-gray-600">
            <span className="text-primary font-semibold">
              {filteredHospitals.length} {filteredHospitals.length === 1 ? 'Hospital' : 'Hospitals'}
            </span>
            <span>found</span>
            {filteredHospitals.length < hospitals.length && (
              <span className="text-gray-500">(filtered from {hospitals.length})</span>
            )}
            {queryParameters.search && <span>matching &quot;{queryParameters.search}&quot;</span>}
          </div>
        )}
      </div>
      <Suggested title={'Hospitals'} showViewAll={false}>
        {!isLoading &&
          filteredHospitals.map((hospital) => (
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
      {!isLoading && filteredHospitals.length === 0 && (
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
