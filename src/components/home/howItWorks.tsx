import { JSX } from 'react';

const HowItWorks = (): JSX.Element => {
  const patientSteps = [
    'Register & Verify (simple sign-up, phone/email verification)',
    'Set Insurance or Payment Preference',
    'Browse Doctors (by specialty, location)',
    'Book Appointment & Pay',
    'Attend Virtual or In-Person Visit',
    'Access Medical Records Anytime',
  ];

  return (
    <section className="bg-medical-light-gray py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <p className="text-primary mb-2 font-semibold">Features</p>
          <h2 className="text-foreground mb-4 text-4xl font-bold">How it works</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Whether you&apos;re a patient seeking care or a healthcare provider, our platform has
            the tools you need to succeed.
          </p>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="rounded-lg border bg-white p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row">
              <div className="mb-8 lg:mb-0 lg:w-1/3">
                <div className="bg-muted flex h-64 items-center justify-center rounded-lg">
                  <div className="text-muted-foreground text-center">
                    <div className="bg-primary/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg">
                      <span className="text-2xl">📱</span>
                    </div>
                    <p>Mobile & Desktop App</p>
                  </div>
                </div>
              </div>

              <div className="lg:w-2/3 lg:pl-8">
                <div className="mb-6 flex items-start justify-between">
                  <h3 className="text-foreground text-2xl font-bold">For Patients</h3>
                  <div className="flex space-x-4">
                    <span className="bg-primary text-primary-foreground rounded px-3 py-1 text-sm font-medium">
                      02
                    </span>
                    <span className="bg-muted text-muted-foreground rounded px-3 py-1 text-sm font-medium">
                      03
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {patientSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className="bg-primary text-primary-foreground mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium">
                        {index + 1}
                      </span>
                      <p className="text-foreground">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-right">
                  <div className="text-vertical text-primary origin-bottom-right rotate-90 transform font-semibold">
                    For Individual Doctors
                  </div>
                  <div className="text-vertical text-muted-foreground mt-20 origin-bottom-right rotate-90 transform font-semibold">
                    For Clinics
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
