import SearchDoctorsCard from '@/app/dashboard/_components/patientHome/_component/searchDoctorCard';
import UpcomingAppointmentCard from '@/app/dashboard/_components/patientHome/_component/upcomingAppointments';
import Link from 'next/link';
import { ChevronRight, Loader2 } from 'lucide-react';
import PatientVitalsCard from '@/app/dashboard/_components/patient/patientVitalsCard';
import { AvatarGreetings } from '@/app/dashboard/_components/avatarGreetings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JSX, ReactNode, useEffect, useMemo, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { IDoctor } from '@/types/doctor.interface';
import { IHospital } from '@/types/hospital.interface';
import HospitalCard from '@/app/dashboard/(patient)/_components/hospitalCard';
import DoctorCard from '@/app/dashboard/(patient)/_components/doctorCard';
import { useAppDispatch } from '@/lib/hooks';
import { suggestedDoctors } from '@/lib/features/doctors/doctorsThunk';
import { getCoordinates } from '@/lib/location';
import { showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ToastStatus } from '@/types/shared.enum';

// TODO: We will replace this with live requests
const mockHospitals = [
  {
    id: '1',
    name: 'New Crystal Hospital',
    specialties: ['Cardiology', 'Pediatrics'],
    location: 'Effiakwanta, Takoradi',
    distance: 4.5,
    googleMapsUrl: 'https://maps.google.com/?q=...',
    imageUrl: 'https://thumbs.dreamstime.com/b/hospital-building-modern-parking-lot-59693686.jpg',
  },
  {
    id: '2',
    name: 'Korlebu Teaching Hospital',
    location: 'Korlebu, Accra',
    specialties: ['Dermatology', 'Cosmetology'],
    distance: 4.8,
    googleMapsUrl: 'https://maps.google.com/?q=...',
  },
  {
    id: '3',
    name: 'New Crystal Hospital',
    specialties: ['Cardiology', 'Pediatrics'],
    location: 'Effiakwanta, Takoradi',
    distance: 4.5,
    googleMapsUrl: 'https://maps.google.com/?q=...',
    imageUrl: 'https://thumbs.dreamstime.com/b/hospital-building-modern-parking-lot-59693686.jpg',
  },
] as unknown as IHospital[];

const PatientHome = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const suggest = useMemo(
    () => (
      <>
        <Suggested title={'Suggested Hospitals'}>
          {mockHospitals.map((hospital) => (
            <HospitalCard key={hospital.id} {...hospital} />
          ))}
        </Suggested>
        <div className="mt-4">
          <Suggested title={'Suggested Doctors'}>
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} {...doctor} />
            ))}
          </Suggested>
          {!isLoading && !(doctors.length > 1) && (
            <div>
              <p className="text-sm">
                Doctor suggestions based on your location are currently not available.{' '}
                <a href="dashboard/find-doctor" className="text-primary underline">
                  Find available doctors
                </a>{' '}
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
        </div>
      </>
    ),
    [],
  );

  const suggestSmallerScreen = useMemo(
    () => (
      <>
        <Suggested title={'Suggested Hospitals'}>
          <Carousel>
            <CarouselContent>
              {mockHospitals.map((hospital) => (
                <CarouselItem key={hospital.id}>
                  <HospitalCard key={hospital.id} {...hospital} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </Suggested>
        <Suggested title={'Suggested Doctors'}>
          <Carousel className="w-full">
            <CarouselContent>
              {doctors.map((doctor) => (
                <CarouselItem key={doctor.id}>
                  <DoctorCard key={doctor.id} {...doctor} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
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
    async function getSuggestedDoctors():Promise<void> {
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

type SuggestedProps = {
  title: string;
  children: ReactNode;
  showViewAll?: boolean;
};

export const Suggested = ({ title, children, showViewAll = true }: SuggestedProps): JSX.Element => (
  <div className="flex w-full flex-col gap-6 max-md:mt-10">
    <div className="flex flex-row items-center justify-between">
      <p className="text-xl leading-5 font-bold">{title}</p>
      {showViewAll && (
        <Link href="/" className="flex flex-row items-center text-sm">
          View All <ChevronRight size={16} />
        </Link>
      )}
    </div>
    <div className="flex-row flex-wrap gap-6 md:flex">{children}</div>
  </div>
);

export default PatientHome;
