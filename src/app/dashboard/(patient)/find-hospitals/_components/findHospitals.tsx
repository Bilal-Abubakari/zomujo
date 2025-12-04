'use client';
import React, { JSX } from 'react';
import Hospitals from './hospitals';

const FindHospitals = (): JSX.Element => (
  <div>
    <section>
      <p className="text-2xl font-bold md:text-[32px]">Find Hospitals</p>
    </section>

    <section className="mt-4">
      <Hospitals />
    </section>
  </div>
);

export default FindHospitals;

