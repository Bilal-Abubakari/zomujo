'use client';
import { Search } from 'lucide-react';
import React, { useEffect, useState, useRef, JSX } from 'react';
import styles from './home.module.css';
import { Button } from '@/components/ui/button';
import { specialties } from '@/constants/constants';
import { IQueryParams } from '@/types/shared.interface';
import { AcceptDeclineStatus } from '@/types/shared.enum';
import { QueryParamKey, useQueryParam } from '@/hooks/useQueryParam';
import { Combobox } from '@/components/ui/select';
import Header from './header';

const Hero = (): JSX.Element => {
  const [current, setCurrent] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [queryParameters, setQueryParameters] = useState<IQueryParams<AcceptDeclineStatus>>();
  const { updateQuery } = useQueryParam();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % specialties.length);
    }, 1800);
    return (): void => clearInterval(interval);
  }, []);

  const handleSearch = (): void => {
    updateQuery('q', 'true');
    Object.entries(queryParameters ?? {}).forEach(([key, value]) => {
      updateQuery(key as QueryParamKey, value);
    });
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
        <h1 className="mb-2 text-5xl font-extrabold text-white drop-shadow-lg md:text-6xl">
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
        <div className="mt-8 flex w-full max-w-3xl flex-col items-center space-y-4 rounded-lg bg-white/80 p-6 shadow-2xl backdrop-blur-md md:flex-row md:space-y-0 md:space-x-4">
          <div className="w-full flex-grow">
            <Combobox
              onChange={(value) =>
                setQueryParameters({
                  specialty: value,
                })
              }
              options={specialties}
              value={queryParameters?.specialty ?? ''}
              className="px-4 py-6"
              placeholder="Search by specialty..."
              searchPlaceholder="Search for specialty..."
              defaultMaxWidth={false}
            />
          </div>
          <Button
            onClick={handleSearch}
            className="bg-primary hover:bg-primary-dark rounded-md p-6 font-bold text-white shadow-lg transition"
            child={
              <>
                <Search className="mr-2 h-5 w-5" />
                Search
              </>
            }
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
