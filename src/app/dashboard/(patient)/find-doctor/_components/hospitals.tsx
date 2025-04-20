import { NotFound } from '@/assets/images';
import { toast } from '@/hooks/use-toast';
import { useAppDispatch } from '@/lib/hooks';
import { showErrorToast } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import React, { JSX, useEffect, useState } from 'react';
import { IHospital } from '@/types/hospital.interface';
import { getNearByHospitals } from '@/lib/features/hospitals/hospitalThunk';
import { getCoordinates } from '@/lib/location';
import { MAX_RADIUS_IN_KM, METERS_TO_KM_FACTOR, reassuringMessages } from '@/constants/constants';
import { ToastStatus } from '@/types/shared.enum';
import HospitalCard from '@/app/dashboard/(patient)/_components/hospitalCard';
import { Suggested } from '@/app/dashboard/_components/patientHome/_component/suggested';
type HospitalProps = {
  title?: string;
  showViewAll?: boolean;
};

const Hospitals = ({ title = 'Hospitals', showViewAll = false }: HospitalProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [hospitals, setHospitals] = useState<IHospital[]>([]);
  const [searchMessage, setSearchMessage] = useState('');
  const [geoLocationError, setGeoLocationError] = useState(false);

  useEffect(() => {
    let radius = 5; //starting range is 5km;
    setSearchMessage(`Searching for hospitals in ${radius}km range `);
    async function hospitals(): Promise<void> {
      setGeoLocationError(false);
      try {
        setIsLoading(true);
        const { longitude, latitude } = await getCoordinates();
        const { payload } = await dispatch(
          getNearByHospitals({
            lat: latitude,
            long: longitude,
            radius: radius * METERS_TO_KM_FACTOR,
          }),
        );

        const nearbyHospitals = payload as IHospital[];

        if (!nearbyHospitals.length && radius < MAX_RADIUS_IN_KM) {
          radius += 5;
          const randomIndex = Math.floor(Math.random() * reassuringMessages.length);
          setSearchMessage(
            `${reassuringMessages[randomIndex]}. Expanding search to ${radius}km range`,
          );
          return hospitals();
        }

        {
          if (payload && showErrorToast(payload)) {
            toast(payload);
            setIsLoading(false);
            return;
          }
        }
        setHospitals(nearbyHospitals);
        setIsLoading(false);
      } catch (error) {
        let message = 'We unable to find a hospital at this time. Try again later';
        if (error instanceof GeolocationPositionError) {
          setGeoLocationError(true);
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
    void hospitals();
  }, []);

  return (
    <>
      <div className="mb-6 flex w-full flex-wrap gap-4"></div>
      <Suggested title={title} showViewAll={showViewAll} link="/dashboard/find-doctor?tab=hospitals">
        {hospitals.map((hospital) => (
          <HospitalCard key={hospital.id} {...hospital} />
        ))}
      </Suggested>
      {isLoading && (
        <div className="mt-20 flex flex-col items-center justify-center gap-6">
          <div>{searchMessage}</div>
          <Loader2 className="animate-spin" />
        </div>
      )}
      {geoLocationError && (
        <div className="mt-8 max-w-md place-self-center text-center">
          We are unable to get your location. Please turn on your location and refresh the page.
          Don&#39;t know how?{' '}
          <a
            className="text-primary hover:text-gray-500"
            href="https://www.youtube.com/watch?v=ROW_HwDhLKc"
            target="_blank"
            rel="noreferrer"
          >
            Click here
          </a>
        </div>
      )}
      {!isLoading && hospitals.length === 0 && !geoLocationError && (
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
          <p className="mt-4 text-center text-xl">Sorry nothing to find here </p>
        </section>
      )}
    </>
  );
};

export default Hospitals;
