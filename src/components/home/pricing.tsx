import { Check } from 'lucide-react';
import { JSX } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const Pricing = (): JSX.Element => {
  const features = [
    'Book appointments with any doctor',
    'Access to medical records',
    'Virtual and in-person consultations',
    'Secure payment processing',
    'Instant notifications on request & approval',
    '24/7 platform access',
  ];

  const doctorFeatures = [
    'Set your own consultation rates',
    'Manage unlimited appointments',
    'Dashboard to view pending & all requests',
    'Patient management system',
    'Virtual consultation platform',
    'Instant notifications on request & approval',
  ];

  return (
    <section id="pricing" className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <p className="text-primary mb-2 font-semibold">Pricing</p>
          <h2 className="text-foreground mb-4 text-4xl font-bold">Simple, transparent pricing</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Choose the plan that works best for you. No hidden fees, no surprises.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
          {/* Patient Plan */}
          <div className="rounded-lg border-2 border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-lg">
            <div className="mb-6">
              <h3 className="text-foreground mb-2 text-2xl font-bold">For Patients</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Everything you need to manage your healthcare journey
              </p>
              <div className="flex flex-col">
                <span className="text-foreground text-4xl font-bold">Pay per appointment</span>
                <span className="text-muted-foreground mt-1 text-sm">
                  Rates set by your chosen doctor
                </span>
              </div>
            </div>

            <ul className="mb-8 space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-start">
                  <Check className="text-primary mt-0.5 mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/sign-up?role=patient">
              <Button className="w-full" child="Get Started" />
            </Link>
          </div>

          {/* Doctor Plan */}
          <div className="border-primary rounded-lg border-2 bg-white p-8 shadow-lg">
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-foreground text-2xl font-bold">For Doctors</h3>
                <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-semibold">
                  POPULAR
                </span>
              </div>
              <p className="text-muted-foreground mb-4 text-sm">
                Complete platform to manage your practice independently
              </p>
              <div className="flex flex-col">
                <span className="text-foreground text-4xl font-bold">Free to join</span>
                <span className="text-muted-foreground mt-1 text-sm">
                  Sign up, get approved, and start using the platform
                </span>
              </div>
            </div>

            <ul className="mb-8 space-y-3">
              {doctorFeatures.map((feature) => (
                <li key={feature} className="flex items-start">
                  <Check className="text-primary mt-0.5 mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/sign-up?role=doctor">
              <Button className="w-full" variant="default" child="Get Started" />
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            All plans include secure data storage, HIPAA compliance, and regular platform updates.{' '}
            <Link href="/dashboard/help-support" className="text-primary hover:underline">
              Contact support
            </Link>{' '}
            if you have any questions.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
