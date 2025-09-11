'use client';
import { Search } from 'lucide-react';
import React, { useEffect, useState, useRef, JSX } from 'react';
import styles from './home.module.css';
import { Button } from '@/components/ui/button';
import { specialties } from '@/constants/constants';
import { IQueryParams } from '@/types/shared.interface';
import { AcceptDeclineStatus } from '@/types/shared.enum';
import { useQueryParam } from '@/hooks/useQueryParam';
import { Combobox } from '@/components/ui/select';
import Header from './header';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';

const Hero = (): JSX.Element => {
  const [current, setCurrent] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [queryParameters, setQueryParameters] = useState<IQueryParams<AcceptDeclineStatus>>();
  const { updateQueries } = useQueryParam();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % specialties.length);
    }, 1800);
    return (): void => clearInterval(interval);
  }, []);

  const handleSearch = (): void => {
    updateQueries({ ...queryParameters, q: 'true' });
  };

  return (
    <section
      ref={heroRef}
      className={`relative h-[95vh] overflow-hidden text-white ${styles.heroBackground} ${styles.panoramic}`}
    >
      <Header />

      <div className={styles.gradientOverlay}></div>
      <div className={styles.circle1}></div>
      <div className={styles.circle2}></div>
      <div className={styles.triangle}></div>
      <div className={styles.arc1}></div>
      <div className={styles.arc2}></div>
      <div
        className={`relative z-10 flex h-full flex-col items-center justify-center px-4 text-center ${styles.fadeIn}`}
      >
        <h1 className="t mt-48 mb-2 text-3xl font-extrabold text-white drop-shadow-lg sm:mt-0 sm:text-5xl md:text-6xl">
          Book local Specialist who take your insurance{' '}
        </h1>
        <div className="mb-2 flex min-h-[2.2rem] items-center justify-center text-lg font-bold md:text-xl">
          <span className="animate-fadeSpeciality text-lg font-extrabold">
            {specialties[current].label}
          </span>
        </div>
        <p className="mb-2 text-lg font-bold text-white drop-shadow-md md:text-xl">
          Connect with the best healthcare professionals.
        </p>
        <div className="items-left mt-8 flex w-full max-w-3xl flex-col space-y-4 rounded-lg bg-white/80 p-6 shadow-2xl backdrop-blur-md md:flex-col md:space-y-0 md:space-x-4">
          <div className="w-full flex-grow">
            <div className="flex flex-col gap-2 md:flex-row">
              <Combobox
                onChange={(value) => setQueryParameters((prev) => ({ ...prev, specialty: value }))}
                label="Specialty"
                options={specialties}
                value={queryParameters?.specialty ?? ''}
                className="px-4 py-6"
                placeholder="Search by specialty..."
                searchPlaceholder="Search for specialty..."
                defaultMaxWidth={false}
                wrapperClassName="text-left text-[#111111]"
              />

              <Input
                type="text"
                placeholder="Search by doctors' name"
                className="py-6 font-medium text-[#111111] placeholder:text-[#111111] focus:border-0 focus:border-transparent focus:shadow-none focus:outline-none"
                labelName="Doctors' name"
                labelClassName="text-left text-[#111]"
                value={queryParameters?.search}
                onChange={(event) =>
                  setQueryParameters((prev) => ({ ...prev, search: event.target.value }))
                }
                defaultMaxWidth={false}
              />
            </div>
            <p className="mt-2 text-left text-sm font-bold text-[#111111]">Max Price</p>
            <Slider
              value={[Number(queryParameters?.priceMax)]}
              onValueChange={(value) =>
                setQueryParameters((prev) => ({ ...prev, priceMax: String(value[0]) }))
              }
              min={80}
              max={10000}
              step={10}
              className="mt-4"
            />
            <div className="absolute mt-2 flex h-8 items-center justify-center rounded-full bg-gray-500 px-2.5">
              <p className="text-sm font-medium text-black">
                GHS {Number(queryParameters?.priceMax || 80).toLocaleString()}{' '}
              </p>
            </div>
          </div>
          <Button
            onClick={handleSearch}
            className="bg-primary hover:bg-primary-dark mt-14 rounded-md p-6 font-bold text-white shadow-lg transition"
            child={
              <>
                <Search className="mr-2 h-5 w-5" />
                Search
              </>
            }
          />

          <div className="mt-12 flex flex-wrap justify-center gap-4 text-sm font-medium text-black/80">
            <div className="flex items-center">
              <div className="mr-2 h-2 w-2 rounded-full bg-green-400"></div>
              Insurance Verified
            </div>
            <div className="flex items-center">
              <div className="mr-2 h-2 w-2 rounded-full bg-blue-400"></div>
              Same-Day Booking
            </div>
            <div className="flex items-center">
              <div className="mr-2 h-2 w-2 rounded-full bg-purple-400"></div>
              Trusted Reviews
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
