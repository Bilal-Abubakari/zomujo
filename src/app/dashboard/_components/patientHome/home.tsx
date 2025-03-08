import SearchDoctorsCard from '@/app/dashboard/_components/patientHome/_component/searchDoctorCard';
import UpcomingAppointmentCard from '@/app/dashboard/_components/patientHome/_component/upcomingAppointments';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import PatientVitalsCard from '@/app/dashboard/_components/patient/patientVitalsCard';
import { AvatarGreetings } from '@/app/dashboard/_components/avatarGreetings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JSX, ReactNode, useMemo } from 'react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { IPatient } from '@/types/patient.interface';
import { IDoctor } from '@/types/doctor.interface';
import { IHospital } from '@/types/hospital.interface';
import HospitalCard from '@/app/dashboard/(patient)/_components/hospitalCard';
import DoctorCard from '@/app/dashboard/(patient)/_components/doctorCard';

// TODO: We will replace this with real requests

const patientVitals = {
  weight: 63.3,
  heartRate: 120,
  bloodSugarLevel: 100,
  temperature: 37,
} as IPatient;
const mockDoctors = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    specializations: ['Cardiology', 'Pediatrics'],
    ratings: 4.5,
    experience: 8,
    noOfConsultations: 120,
    rate: 2,
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    specializations: ['Dermatology', 'Cosmetology'],
    ratings: 4.8,
    experience: 10,
    noOfConsultations: 200,
    rate:1,
  },
] as IDoctor[];

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
  const suggest = useMemo(
    () => (
      <>
        <Suggested title={'Suggested Hospitals'}>
          {mockHospitals.map((hospital) => (
            <HospitalCard key={hospital.id} {...hospital} />
          ))}
        </Suggested>
        <Suggested title={'Suggested Doctors'}>
          {mockDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} {...doctor} />
          ))}
        </Suggested>
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
              {mockDoctors.map((doctor) => (
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
        <PatientVitalsCard {...patientVitals} />
      </div>
    ),
    [],
  );

  return (
    <div className="w-full border border-grayscale-100 bg-grayscale-10 px-4 max-me:pb-[80px] max-me:pt-4 md:px-6">
      <AvatarGreetings />
      <div className="mt-[27px] w-full gap-6 md:flex">
        <div className="flex-grow space-y-12">
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
      <p className="text-xl font-bold leading-5">{title}</p>
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
