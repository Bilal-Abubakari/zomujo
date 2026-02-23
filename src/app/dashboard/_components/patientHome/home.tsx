import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { AvatarGreetings } from '@/app/dashboard/_components/avatarGreetings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JSX, useEffect, useMemo, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { IDoctor } from '@/types/doctor.interface';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { suggestedDoctors } from '@/lib/features/doctors/doctorsThunk';
import { getCoordinates } from '@/lib/location';
import { showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ToastStatus } from '@/types/shared.enum';
import { Suggested } from './_component/suggested';
import { selectExtra } from '@/lib/features/auth/authSelector';
import { getPatientRecords } from '@/lib/features/records/recordsThunk';

const SearchDoctorsCard = dynamic(
  () => import('@/app/dashboard/_components/patientHome/_component/searchDoctorCard'),
  { loading: () => <LoadingCard />, ssr: false },
);
const UpcomingAppointmentCard = dynamic(
  () => import('@/app/dashboard/_components/patientHome/_component/upcomingAppointments'),
  { loading: () => <LoadingCard />, ssr: false },
);
// TODO: Telemedicine limitation - vitals measurement not supported yet. PatientVitalsCard disabled until remote vitals integration.
// const PatientVitalsCard = dynamic(
//   () => import('@/app/dashboard/_components/patient/patientVitalsCard'),
//   { loading: () => <LoadingCard />, ssr: false },
// );
const DoctorCard = dynamic(() => import('@/app/dashboard/(patient)/_components/doctorCard'), {
  loading: () => <LoadingCard />,
  ssr: false,
});

const LoadingCard = (): JSX.Element => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="animate-spin" size={24} />
  </div>
);

const PatientHome = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const extra = useAppSelector(selectExtra);
  const findDoctorsLink = '/dashboard/find-doctor?tab=doctors';

  const doctorSuggestions = useMemo(
    () => (
      <>
        {' '}
        {!isLoading && doctors.length <= 1 && (
          <div>
            <p className="text-sm">
              Doctor suggestions based on your location are currently not available.{' '}
              <Link href="/dashboard/find-doctor" className="text-primary underline">
                Find available doctors
              </Link>{' '}
              manually.
            </p>
          </div>
        )}{' '}
        {isLoading && (
          <div className="flex h-32 w-full items-center justify-center">
            <p className="flex gap-2 text-sm">
              <Loader2 className="animate-spin" size={16} />
              Please wait, getting suggestions of some doctors close to you.
            </p>
          </div>
        )}
      </>
    ),
    [isLoading, doctors.length],
  );

  const suggest = useMemo(
    () => (
      <div className="mt-4">
        <Suggested title={'Suggested Doctors'} link={findDoctorsLink}>
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </Suggested>
        {doctorSuggestions}
      </div>
    ),
    [doctors, doctorSuggestions, findDoctorsLink],
  );

  const suggestSmallerScreen = useMemo(
    () => (
      <Suggested title={'Suggested Doctors'} link={findDoctorsLink}>
        <Carousel className="w-full">
          <CarouselContent>
            {doctors.map((doctor) => (
              <CarouselItem key={doctor.id}>
                <DoctorCard key={doctor.id} doctor={doctor} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        {doctorSuggestions}
      </Suggested>
    ),
    [doctors, doctorSuggestions, findDoctorsLink],
  );

  const upcomingAppointments = useMemo(
    () => (
      <div className="space-y-6">
        <UpcomingAppointmentCard />
        {/* TODO: Re-enable <PatientVitalsCard /> when remote vitals collection becomes available */}
        {/* <PatientVitalsCard /> */}
      </div>
    ),
    [],
  );

  useEffect(() => {
    async function getSuggestedDoctors(): Promise<void> {
      try {
        setIsLoading(true);
        const { longitude: long, latitude: lat } = await getCoordinates();
        const { payload } = await dispatch(suggestedDoctors({ long, lat }));
        if (payload && showErrorToast(payload)) {
          toast(payload);
          setIsLoading(false);
          return;
        }

        setIsLoading(false);
        setDoctors(payload as IDoctor[]);
      } catch (error) {
        let message = 'We unable to suggest a doctor at this time. Try again later';
        if (error instanceof GeolocationPositionError) {
          message = error.message;
        }
        toast({
          title: ToastStatus.Error,
          description: message,
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    }
    void getSuggestedDoctors();
  }, [dispatch]);

  useEffect(() => {
    async function getUserRecords(): Promise<void> {
      if (!extra) {
        return;
      }
      const { payload } = await dispatch(getPatientRecords(extra.id));
      if (payload && showErrorToast(payload)) {
        toast(payload);
      }
    }

    void getUserRecords();
  }, [dispatch, extra]);

  return (
    <div className="border-grayscale-100 bg-grayscale-10 max-me:pb-20 max-me:pt-4 w-full border px-4 md:px-6">
      <AvatarGreetings />
      <div className="mt-6.75 w-full gap-6 md:flex">
        <div className="grow space-y-12">
          <SearchDoctorsCard />
          <div className="flex w-full items-center justify-center md:hidden">
            <Tabs defaultValue="home" className="w-full text-center text-sm md:hidden">
              <TabsList>
                <TabsTrigger value="home">Home</TabsTrigger>
                <TabsTrigger value="upcomingAppointments">Upcoming Appointments 2</TabsTrigger>
              </TabsList>
              <TabsContent className="mt-6" value="home">
                {suggestSmallerScreen}
              </TabsContent>
              <TabsContent className="mt-6" value="upcomingAppointments">
                {upcomingAppointments}
              </TabsContent>
            </Tabs>
          </div>
          <div className="max-md:hidden">{suggest}</div>
        </div>
        <div className="max-md:hidden">{upcomingAppointments}</div>
      </div>
    </div>
  );
};

export default PatientHome;
