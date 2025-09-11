'use client';
import { JSX, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, FileText, Users, Eye, Heart } from 'lucide-react';
import Image from 'next/image';
import { Logo } from '@/assets/images';
import { useRouter, useSearchParams } from 'next/navigation';

const TermsAndCondition = (): JSX.Element => {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get('section') || '';
  const router = useRouter();

  const [activeSection, setActiveSection] = useState(sectionParam);
  const sections = [
    { id: 'introduction', title: 'Introduction', icon: FileText },
    { id: 'acceptance', title: 'Acceptance of Terms', icon: Shield },
    { id: 'medical', title: 'Medical Disclaimer', icon: Heart },
    { id: 'usage', title: 'Permitted Usage', icon: Users },
    { id: 'liability', title: 'Limitation of Liability', icon: Eye },
    { id: 'modifications', title: 'Modifications', icon: FileText },
  ];

  const scrollToSection = (sectionId: string): void => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToSection(activeSection);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-background border-border shadow-soft border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-gradient-hero shadow-medium flex h-12 w-12 items-center justify-center rounded-xl">
              <button onClick={() => router.back()} className="cursor-pointer">
                <Image src={Logo} alt="Logo" />
              </button>
            </div>
            <div>
              <h1 className="text-foreground text-3xl font-bold">Zumojo</h1>
              <p className="text-muted-foreground">Your trusted health companion</p>
            </div>
          </div>
          <h2 className="text-foreground mb-2 text-xl font-bold md:text-4xl">Terms & Conditions</h2>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Please read these terms carefully. By using our health application, you agree to be
            bound by these terms and conditions.
          </p>
          <p className="text-muted-foreground mt-4 text-sm">
            Last updated:{' '}
            {new Date('2025, 09, 10').toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Card className="shadow-medium sticky top-8 p-6">
              <h3 className="text-foreground mb-4 flex items-center gap-2 font-semibold">
                <FileText className="h-4 w-4" />
                Table of Contents
              </h3>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? 'default' : 'ghost'}
                      className="transition-smooth w-full justify-start text-sm"
                      onClick={() => scrollToSection(section.id)}
                      child={
                        <>
                          <Icon className="mr-2 h-4 w-4" />
                          {section.title}
                        </>
                      }
                    ></Button>
                  );
                })}
              </nav>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="h-[calc(100vh-12rem)] overflow-y-auto">
              <div className="space-y-8 pr-4">
                <section id="introduction" className="scroll-mt-8">
                  <Card className="shadow-medium p-8">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="bg-health-surface flex h-10 w-10 items-center justify-center rounded-lg">
                        <FileText className="text-health-primary h-5 w-5" />
                      </div>
                      <h3 className="text-foreground text-2xl font-bold">Introduction</h3>
                    </div>
                    <div className="prose prose-blue max-w-none">
                      <p className="text-foreground leading-relaxed">
                        Welcome to Zumojo. These Terms and Conditions (&quot;Terms&quot;) govern
                        your use of our health and wellness mobile application and related services
                        (collectively, the &quot;Service&quot;).
                      </p>
                      <p className="text-foreground mt-2 leading-relaxed">
                        Our Service is designed to provide a secure and reliable avenue for doctors
                        to assist patients with their health-related issues. Through the platform,
                        users may sign up either as a doctor, offering professional support and
                        guidance, or as a patient, seeking assistance and advice. We are committed
                        to connecting doctors and patients in a way that supports health and
                        wellness, while maintaining the highest standards of data security and
                        privacy.
                      </p>
                    </div>
                  </Card>
                </section>

                <section id="acceptance" className="scroll-mt-8">
                  <Card className="shadow-medium p-8">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="bg-health-surface flex h-10 w-10 items-center justify-center rounded-lg">
                        <Shield className="text-health-primary h-5 w-5" />
                      </div>
                      <h3 className="text-foreground text-2xl font-bold">Acceptance of Terms</h3>
                    </div>
                    <div className="prose prose-blue max-w-none space-y-4">
                      <p className="text-foreground leading-relaxed">
                        By accessing or using our Service, you acknowledge that you have read,
                        understood, and agree to be bound by these Terms. If you do not agree to
                        these Terms, please do not use our Service.
                      </p>
                      <ul className="text-foreground space-y-2">
                        <li>• You must be at least 18 years old to use this Service</li>
                        <li>• You must provide accurate and complete information</li>
                        <li>
                          • You are responsible for maintaining the confidentiality of your account
                        </li>
                        <li>• You agree to use the Service only for lawful purposes</li>
                      </ul>
                    </div>
                  </Card>
                </section>

                <section id="medical" className="scroll-mt-8">
                  <Card className="shadow-medium border-l-4 border-l-amber-400 p-8">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="bg-health-surface flex h-10 w-10 items-center justify-center rounded-lg">
                        <Heart className="text-health-primary h-5 w-5" />
                      </div>
                      <h3 className="text-foreground text-2xl font-bold">Medical Disclaimer</h3>
                    </div>
                    <div className="prose prose-blue max-w-none space-y-4">
                      <div className="border-health-warning/20 rounded-lg border bg-amber-400/10 p-4">
                        <p className="text-foreground leading-relaxed font-medium">
                          <strong>Important:</strong> This app is not intended to replace
                          professional medical advice, diagnosis, or treatment. Always seek the
                          advice of your physician or other qualified health provider with any
                          questions you may have regarding a medical condition.
                        </p>
                      </div>
                      <ul className="text-foreground space-y-2">
                        <li>
                          • Never disregard professional medical advice or delay seeking it because
                          of information from this app
                        </li>
                        <li>
                          • In case of a medical emergency, call emergency services immediately
                        </li>
                        <li>• This app is for informational and tracking purposes only</li>
                        <li>
                          • Consult with healthcare professionals before making health-related
                          decisions
                        </li>
                      </ul>
                    </div>
                  </Card>
                </section>

                <section id="usage" className="scroll-mt-8">
                  <Card className="shadow-medium p-8">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="bg-health-surface flex h-10 w-10 items-center justify-center rounded-lg">
                        <Users className="text-health-primary h-5 w-5" />
                      </div>
                      <h3 className="text-foreground text-2xl font-bold">Permitted Usage</h3>
                    </div>
                    <div className="prose prose-blue max-w-none space-y-4">
                      <p className="text-foreground leading-relaxed">
                        You may use our Service for personal, non-commercial purposes to track and
                        monitor your health and wellness. You agree not to:
                      </p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="bg-destructive/5 border-destructive/20 rounded-lg border p-4">
                          <h4 className="text-destructive mb-2 font-semibold">
                            Prohibited Actions:
                          </h4>
                          <ul className="text-foreground space-y-1 text-sm">
                            <li>• Share false or misleading health information</li>
                            <li>• Attempt to hack or breach our systems</li>
                            <li>• Use the app for commercial purposes without permission</li>
                            <li>• Violate any applicable laws or regulations</li>
                          </ul>
                        </div>
                        <div className="bg-primary/5 border-primary/20 rounded-lg border p-4">
                          <h4 className="text-primary mb-2 font-semibold">Encouraged Use:</h4>
                          <ul className="text-foreground space-y-1 text-sm">
                            <li>• Track your health metrics accurately</li>
                            <li>• Share data with healthcare providers</li>
                            <li>• Use insights to improve your wellness</li>
                            <li>• Provide feedback to help us improve</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Card>
                </section>

                <section id="liability" className="scroll-mt-8">
                  <Card className="shadow-medium p-8">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="bg-health-surface flex h-10 w-10 items-center justify-center rounded-lg">
                        <Eye className="text-health-primary h-5 w-5" />
                      </div>
                      <h3 className="text-foreground text-2xl font-bold">
                        Limitation of Liability
                      </h3>
                    </div>
                    <div className="prose prose-blue max-w-none space-y-4">
                      <p className="text-foreground leading-relaxed">
                        To the fullest extent permitted by law, Zumojo shall not be liable for any
                        indirect, incidental, special, consequential, or punitive damages, or any
                        loss of profits or revenues.
                      </p>
                      <p className="text-foreground leading-relaxed">
                        Our total liability to you for any damages shall not exceed the amount you
                        paid for the Service in the twelve months preceding the claim.
                      </p>
                    </div>
                  </Card>
                </section>

                <section id="modifications" className="scroll-mt-8">
                  <Card className="shadow-medium p-8">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="bg-health-surface flex h-10 w-10 items-center justify-center rounded-lg">
                        <FileText className="text-health-primary h-5 w-5" />
                      </div>
                      <h3 className="text-foreground text-2xl font-bold">Modifications to Terms</h3>
                    </div>
                    <div className="prose prose-blue max-w-none space-y-4">
                      <p className="text-foreground leading-relaxed">
                        We reserve the right to modify these Terms at any time. We will notify you
                        of any material changes by posting the new Terms within the app and updating
                        the &quot;Last updated&quot; date.
                      </p>
                      <p className="text-foreground leading-relaxed">
                        Your continued use of the Service after the posting of revised Terms
                        constitutes your acceptance of such changes.
                      </p>
                    </div>
                  </Card>
                </section>

                <Card className="shadow-medium bg-primary p-8 text-white">
                  <h3 className="mb-4 text-2xl font-bold">Questions or Concerns?</h3>
                  <p className="mb-4 opacity-90">
                    If you have any questions about these Terms and Conditions, please contact us:
                  </p>
                  <div className="space-y-2 text-sm opacity-90">
                    <p>Email: zumojo@gmail.com</p>
                    <p>Phone: +233 20 146 2313</p>
                    <p>Address: Ghana, Accra</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndCondition;
