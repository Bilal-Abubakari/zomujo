import SearchDoctorsCard from '@/app/dashboard/_components/patientHome/_component/searchDoctorCard';
import UpcomingAppointmentCard from '@/app/dashboard/_components/patientHome/_component/upcomingAppointments';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import PatientVitalsCard from '@/app/dashboard/_components/patient/patientVitalsCard';
import { AvatarGreetings } from '@/app/dashboard/_components/avatarGreetings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JSX, useEffect, useMemo, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { IDoctor } from '@/types/doctor.interface';
import DoctorCard from '@/app/dashboard/(patient)/_components/doctorCard';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { suggestedDoctors } from '@/lib/features/doctors/doctorsThunk';
import { getCoordinates } from '@/lib/location';
import { showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ToastStatus } from '@/types/shared.enum';
import Hospitals from '../../(patient)/find-doctor/_components/hospitals';
import { Suggested } from './_component/suggested';
import { selectExtra } from '@/lib/features/auth/authSelector';
import { getPatientRecords } from '@/lib/features/records/recordsThunk';

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
              <Link href="dashboard/find-doctor" className="text-primary underline">
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
    [],
  );
  const suggest = useMemo(
    () => (
      <>
        <div className="-mt-10">
          <Hospitals title="Suggested Hospitals" showViewAll={true} />
        </div>
        <div className="mt-4">
          <Suggested title={'Suggested Doctors'} link={findDoctorsLink}>
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </Suggested>
          {doctorSuggestions}
        </div>
      </>
    ),
    [],
  );

  const suggestSmallerScreen = useMemo(
    () => (
      <>
        <Hospitals title="Suggested Hospitals" showViewAll={true} />
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
      </>
    ),
    [],
  );

  const upcomingAppointments = useMemo(
    () => (
      <div className="space-y-6">
        <UpcomingAppointmentCard />
        <PatientVitalsCard />
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
  }, []);

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
  }, []);
  return (
    <div className="border-grayscale-100 bg-grayscale-10 max-me:pb-[80px] max-me:pt-4 w-full border px-4 md:px-6">
      <AvatarGreetings />
      <div className="mt-[27px] w-full gap-6 md:flex">
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
