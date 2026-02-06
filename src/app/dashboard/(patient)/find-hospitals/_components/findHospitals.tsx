'use client';
import React, { JSX } from 'react';
import Hospitals from './hospitals';

const FindHospitals = (): JSX.Element => (
  <div>
    {/* Title */}
    <section className="mb-4">
      <p className="text-2xl font-bold md:text-[32px]">Find Hospitals</p>
    </section>

    <section>
      <Hospitals />
    </section>
  </div>
);

export default FindHospitals;

