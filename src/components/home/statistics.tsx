import React, { JSX } from 'react';

const Statistics = (): JSX.Element => (
  <section className="bg-white py-16 pt-40">
    <div className="container mx-auto px-4">
      <div className="mb-12 text-center">
        <h2 className="text-foreground mb-4 text-4xl font-bold">
          Empowering the Future
          <br />
          of Healthcare in Africa
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          Connecting you directly to the care you need, powered by a platform that puts patients and
          doctors in control.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
        <div className="text-center">
          <div className="text-primary mb-2 text-5xl font-bold">500+</div>
          <p className="text-muted-foreground">
            Across all 18 regions in
            <br />
            Ghana
          </p>
        </div>
        <div className="text-center">
          <div className="text-primary mb-2 text-5xl font-bold">1,000+</div>
          <p className="text-muted-foreground">Empowered Clients</p>
        </div>
        <div className="text-center">
          <div className="text-primary mb-2 text-5xl font-bold">150</div>
          <p className="text-muted-foreground">Expert Collaborations</p>
        </div>
      </div>
    </div>
  </section>
);

export default Statistics;
