'use client';
import React, { JSX } from 'react';
import Hospitals from './hospitals';

const FindHospitals = (): JSX.Element => (
  <div>
    {/* Sticky title at top - stays within page */}
    <section className="sticky top-0 z-30 bg-grayscale-100 pb-2 pt-2 -mx-4 px-4 2xl:-mx-6 2xl:px-6">
      <p className="text-2xl font-bold md:text-[32px]">Find Hospitals</p>
    </section>

    <section className="mt-4">
      <Hospitals />
    </section>
  </div>
);

export default FindHospitals;

