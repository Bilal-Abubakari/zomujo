import { Calendar, CreditCard, MessageSquare, Shield, BarChart, Search } from 'lucide-react';
import { JSX } from 'react';

const AvailableFeatures = (): JSX.Element => {
  const features = [
    {
      icon: Calendar,
      title: 'Schedule & Appointments',
      description:
        'Sync appointments with personal calendars and get automatic reminders via SMS/email',
    },
    {
      icon: CreditCard,
      title: 'Billing & Insurance',
      description:
        'Integrated payment gateway with insurance eligibility checks and quick payment options',
    },
    {
      icon: MessageSquare,
      title: 'Telehealth & Messaging',
      description: 'HD video consults and secure chat with store-and-forward capabilities',
    },
    {
      icon: Shield,
      title: 'Data Ownership & Portability',
      description: 'Securely store and manage medical records with controlled access',
    },
    {
      icon: BarChart,
      title: 'Analytics & Reporting',
      description: 'Comprehensive operational dashboards and performance insights',
    },
    {
      icon: Search,
      title: 'Find Healthcare Providers',
      description: 'Easily search and connect with healthcare providers in your area',
    },
  ];

  return (
    <section className="bg-medical-light-gray py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <p className="text-primary mb-2 font-semibold">Features</p>
          <h2 className="text-foreground mb-4 text-4xl font-bold">
            No fluff...here&apos;s what you get
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Everything you need to manage your healthcare journey, all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({description,icon,title}) => {
            const IconComponent = icon;
            return (
              <div
                key={title}
                className="rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  <IconComponent className="text-primary h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AvailableFeatures;
