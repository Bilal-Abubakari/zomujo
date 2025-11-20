import { ContentProfile } from '@/assets/images';
import { Shield, Zap, BarChart } from 'lucide-react';
import Image from 'next/image';
import { JSX } from 'react';

const SolutionsOffered = (): JSX.Element => {
  const solutions = [
    {
      icon: Shield,
      title: 'Own Your Medical Records',
      description: 'Connect with top healthcare providers and access your health data anytime',
    },
    {
      icon: Zap,
      title: 'Go Independent, Go Digital',
      description:
        'Integrated scheduling, billing, and video consultations. Streamline your patient care experience.',
    },
    {
      icon: BarChart,
      title: 'Seamless Operations Management',
      description:
        'Simplify scheduling, track patient visits, and keep your operations running smoothly.',
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <p className="text-primary mb-2 font-semibold">Features</p>
          <h2 className="text-foreground mb-8 text-4xl font-bold">Solutions for Everyone</h2>
          <p className="text-muted-foreground mx-auto mb-12 max-w-2xl">
            Whether you&apos;re a patient seeking care or a healthcare provider, our platform has
            the tools you need to succeed.
          </p>
        </div>

        <div className="mb-16 flex flex-col items-center gap-12">
          <div className="lg:w-3/4">
            <Image src={ContentProfile} alt="Healthcare app mockup" className="h-auto w-full" />
          </div>
          <div className="flex flex-col space-y-8 xl:flex-row">
            {solutions.map(({ title, description, icon }) => {
              const IconComponent = icon;
              return (
                <div key={title} className="flex items-start space-x-4">
                  <div className="bg-primary/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg">
                    <IconComponent className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold">{title}</h3>
                    <p className="text-muted-foreground">{description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <blockquote className="text-foreground mb-8 text-2xl font-medium md:text-3xl">
            &quot;This platform has transformed how I manage my practice. I can now see more
            patients efficiently while maintaining the quality care they deserve.&quot;
          </blockquote>
          <div className="flex items-center justify-center space-x-4">
            <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
              <span className="text-lg font-semibold">TD</span>
            </div>
            <div className="text-left">
              <div className="font-semibold">Dr. Teata Duut</div>
              <div className="text-muted-foreground">General Practitioner, Ghana</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionsOffered;
