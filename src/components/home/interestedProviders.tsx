import { ProviderDashboard } from '@/assets/images';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Image from 'next/image';
import { JSX } from 'react';

const InterestedProvider = (): JSX.Element => {
  const benefits = [
    'Reach patients in your area looking for a new provider',
    'Fill last-minute openings in your schedule',
    'Strengthen your online reputation with verified reviews',
  ];

  return (
    <section className="bg-medical-light-gray py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-12 lg:flex-row">
          <div className="lg:w-1/2">
            <h2 className="text-foreground mb-6 text-4xl font-bold">
              Are you a provider interested in reaching new patients?
            </h2>

            <div className="mb-8 space-y-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start space-x-3">
                  <div className="bg-primary mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full">
                    <Check className="text-primary-foreground h-4 w-4" />
                  </div>
                  <p className="text-foreground">{benefit}</p>
                </div>
              ))}
            </div>

            <Button size="lg" className="bg-primary hover:bg-primary/90" child={'Get started'} />
          </div>

          <div className="lg:w-1/2">
            <Image
              src={ProviderDashboard}
              alt="Provider dashboard interface"
              className="h-auto w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default InterestedProvider;
