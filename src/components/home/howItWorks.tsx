import { DocPatient } from '@/assets/images';
import Image from 'next/image';
import { JSX, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const HowItWorks = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');

  const patientSteps = [
    'Register & Verify (simple sign-up, email verification)',
    'Payment Preference',
    'Browse Doctors (by specialty, location)',
    'Book Appointment & Pay',
    'Attend Virtual or In-Person Visit',
    'Access Medical Records Anytime',
  ];

  const doctorSteps = [
    'Register & Verify (doctor onboarding, credential verification)',
    'Set Up Profile (specialty, location, pricing)',
    'Create Time Slots & Availability',
    'Receive Appointment Requests & Confirm',
    'Conduct Virtual or In-Person Consultations',
    'Manage Patient Records & Prescriptions',
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
            <div className="mb-6 flex justify-center">
              <div className="bg-muted relative inline-flex rounded-lg p-1 shadow-inner">
                <motion.div
                  className="bg-primary absolute inset-y-1 rounded-md shadow-lg"
                  initial={false}
                  layoutId="activeTab"
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                  style={{
                    width: 'calc(50% - 4px)',
                    left: activeTab === 'patient' ? '2px' : 'calc(50% + 2px)',
                  }}
                />
                <button
                  onClick={() => setActiveTab('patient')}
                  className={cn(
                    'relative z-10 rounded-md px-8 py-3 text-sm font-semibold transition-all duration-300',
                    activeTab === 'patient'
                      ? 'text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  For Patients
                </button>
                <button
                  onClick={() => setActiveTab('doctor')}
                  className={cn(
                    'relative z-10 rounded-md px-8 py-3 text-sm font-semibold transition-all duration-300',
                    activeTab === 'doctor'
                      ? 'text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  For Doctors
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row">
              <div className="mb-8 lg:mb-0 lg:w-1/3">
                <Image
                  src={DocPatient}
                  alt="Doctor and Patient"
                  className="h-auto w-full rounded-lg"
                />
              </div>
              <div className="lg:w-2/3 lg:pl-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-foreground text-2xl font-bold">
                          {activeTab === 'patient' ? 'For Patients' : 'For Doctors'}
                        </h3>
                        <span className="bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold">
                          {(activeTab === 'patient' ? patientSteps : doctorSteps).length} Simple
                          Steps
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Follow these steps to get started on the platform
                      </p>
                    </div>

                    <div className="space-y-4">
                      {(activeTab === 'patient' ? patientSteps : doctorSteps).map((step, index) => (
                        <motion.div
                          key={step}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                          className="flex items-start space-x-3"
                        >
                          <span className="bg-primary text-primary-foreground mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium shadow-md">
                            {index + 1}
                          </span>
                          <p className="text-foreground">{step}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 text-right">
                  <div className="text-vertical text-primary origin-bottom-right rotate-90 transform font-semibold">
                    {activeTab === 'patient' ? 'For Patients' : 'Individual Doctors '}
                  </div>
                  {/* TODO: Implement this when we have the clinics feature */}
                  {/* <div className="text-vertical text-muted-foreground mt-20 origin-bottom-right rotate-90 transform font-semibold">
                    For Clinics
                  </div> */}
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
