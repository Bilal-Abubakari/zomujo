'use client';
import Image from 'next/image';
import { Hospital } from 'lucide-react';
import { UnderConstruction } from '@/assets/images';
import { JSX } from 'react';
import styles from './home.module.css';

const OrganizationsComingSoon = (): JSX.Element => (
  <section className="relative mx-auto my-24 flex max-w-5xl flex-col items-center justify-center px-4">
    <div className="pointer-events-none absolute -top-8 left-0 z-10 w-full overflow-hidden">
      <svg
        viewBox="0 0 800 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-full"
      >
        <path d="M0,30 C200,60 600,0 800,30 L800,60 L0,60 Z" fill="#08af85" fillOpacity="0.13">
          <animate
            attributeName="d"
            dur="5s"
            repeatCount="indefinite"
            values="
              M0,30 C200,60 600,0 800,30 L800,60 L0,60 Z;
              M0,20 C220,50 580,10 800,20 L800,60 L0,60 Z;
              M0,30 C200,60 600,0 800,30 L800,60 L0,60 Z
            "
          />
        </path>
      </svg>
    </div>
    <div className={`absolute top-10 right-10 z-0 hidden md:block ${styles.polygonShape}`} />
    <div className={`absolute bottom-0 left-0 z-0 hidden md:block ${styles.arcShape}`} />
    <div className="relative z-20 flex w-full flex-col rounded-2xl border border-white/30 bg-white/30 p-0 shadow-2xl backdrop-blur-lg md:flex-row">
      <div className="flex items-center justify-center rounded-l-2xl bg-gradient-to-br from-[#08af85]/10 via-[#e4e7ec]/30 to-[#08af85]/10 p-12 md:w-1/2">
        <Image
          src={UnderConstruction}
          alt="Hospital Illustration"
          width={280}
          height={200}
          className="rounded-xl object-contain shadow-xl"
        />
      </div>
      <div className="flex flex-col items-center justify-center p-12 text-center md:w-1/2">
        <div className="mb-8 flex items-center justify-center">
          <Hospital
            className={`text-primary h-16 w-16 drop-shadow-lg ${styles.animateBounceSlow}`}
          />
        </div>
        <h2 className="mb-6 bg-gradient-to-r from-[#08af85] via-[#e4e7ec] to-[#08af85] bg-clip-text text-5xl font-extrabold text-transparent drop-shadow-lg">
          Organizations Coming Soon
        </h2>
        <p className="mx-auto mb-10 max-w-lg text-xl font-medium text-gray-700">
          Soon, hospitals and clinics will be able to sign up and use{' '}
          <span className="text-primary font-bold">Zomujo</span> to connect their patients with
          their doctors, manage appointments, and streamline healthcare services with advanced
          tools.
        </p>
        <span
          className={`bg-primary/10 text-primary inline-block rounded-full px-8 py-4 text-lg font-semibold shadow-lg ${styles.animatePulseSlow}`}
        >
          🚀 Stay tuned for updates!
        </span>
      </div>
    </div>
  </section>
);

export default OrganizationsComingSoon;
