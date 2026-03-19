'use client';

import { Logo } from '@/assets/images';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BRANDING } from '@/constants/branding.constant';
import { cn } from '@/lib/utils';
import { ArrowLeft, ChevronRight, FileText, Mail, RefreshCw, LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { JSX, useEffect, useState, ReactNode } from 'react';

export interface LegalSection {
  id: string;
  title: string;
  icon: LucideIcon;
  number: string;
}

interface LegalLayoutProps {
  title: string;
  description: ReactNode;
  sections: LegalSection[];
  lastUpdated: Date;
  heroIcon: LucideIcon;
  heroBadges: { icon: LucideIcon; label: string }[];
  contactEmail: string;
  contactLabel: string;
  footerTitle: string;
  footerDescription: string;
  children: ReactNode;
  footerButtons?: ReactNode;
}

export const BulletItem = ({ children }: { children: ReactNode }): JSX.Element => (
  <li className="text-foreground flex items-start gap-2 text-sm leading-relaxed">
    <div className="bg-primary mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />
    <span>{children}</span>
  </li>
);

export const SubSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): JSX.Element => (
  <div className="space-y-2">
    <h4 className="text-foreground text-sm font-semibold">{title}</h4>
    {children}
  </div>
);

export const SectionCard = ({
  id,
  number,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  number: string;
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}): JSX.Element => (
  <section id={id} className="scroll-mt-24">
    <Card className="shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
            <Icon className="text-primary h-5 w-5" />
          </div>
          <div>
            <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
              Section {number}
            </span>
            <CardTitle className="text-foreground text-lg leading-tight font-bold">
              {title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-5 pt-6">{children}</CardContent>
    </Card>
  </section>
);

export const LegalLayout = ({
  title,
  description,
  sections,
  lastUpdated,
  heroIcon: HeroIcon,
  heroBadges,
  contactEmail,
  contactLabel,
  footerTitle,
  footerDescription,
  children,
  footerButtons,
}: LegalLayoutProps): JSX.Element => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState(sections[0]?.id);

  useEffect(() => {
    const handleScroll = (): void => {
      const scrollPos = window.scrollY + 130;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return (): void => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (id: string): void => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const formattedDate = lastUpdated.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b bg-white/95 shadow-sm backdrop-blur">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <Separator orientation="vertical" className="h-5" />
              <button onClick={() => router.push('/')} className="flex items-center gap-2">
                <Image className="h-8 w-8" src={Logo} alt="Logo" />
                <span className="text-foreground text-lg font-bold">{BRANDING.APP_NAME}</span>
              </button>
            </div>
            <Badge variant="brown" className="text-xs">
              <RefreshCw className="mr-1 h-3 w-3" />
              Last Updated: {formattedDate}
            </Badge>
          </div>
        </div>
      </header>

      <div className="bg-primary text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-white/20 p-3">
                <HeroIcon className="h-8 w-8" />
              </div>
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-5xl">{title}</h1>
            <div className="text-lg leading-relaxed text-white/90">{description}</div>
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
              {heroBadges.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2"
                >
                  <Icon className="h-4 w-4" /> {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="gap-8 lg:grid lg:grid-cols-4">
          <aside className="hidden lg:col-span-1 lg:block">
            <Card className="sticky top-24 p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="text-primary h-4 w-4" />
                <h3 className="text-foreground text-sm font-semibold">Table of Contents</h3>
              </div>
              <nav className="max-h-[calc(100vh-12rem)] space-y-0.5 overflow-y-auto">
                {sections.map(({ id, title, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs transition-all',
                      activeSection === id
                        ? 'bg-primary font-medium text-white'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="leading-tight">{title}</span>
                    {activeSection === id && <ChevronRight className="ml-auto h-3 w-3 shrink-0" />}
                  </button>
                ))}
              </nav>
              <Separator className="my-4" />
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full text-xs"
                  child={
                    <a href={`mailto:${contactEmail}`} className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" /> {contactLabel}
                    </a>
                  }
                />
              </div>
            </Card>
          </aside>

          <div className="mb-6 lg:hidden">
            <details className="rounded-lg border bg-white p-4 shadow-sm">
              <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                <FileText className="text-primary h-4 w-4" /> Table of Contents
              </summary>
              <nav className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-2">
                {sections.map(({ id, title, number: sectionNum }) => (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className="text-muted-foreground hover:text-primary block w-full py-1 text-left text-sm transition-colors"
                  >
                    {sectionNum}. {title}
                  </button>
                ))}
              </nav>
            </details>
          </div>

          <main className="space-y-6 lg:col-span-3">
            {children}

            <Card className="bg-primary overflow-hidden text-white">
              <CardContent className="p-8">
                <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="mb-1 text-xl font-bold">{footerTitle}</h3>
                    <p className="text-sm text-white/80">{footerDescription}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row">{footerButtons}</div>
                </div>
                <Separator className="my-6 bg-white/20" />
                <p className="text-center text-xs text-white/70">
                  {title} is effective as of {formattedDate}.{' '}
                  {title === 'Comprehensive Privacy & Data Protection Policy'
                    ? 'Material changes will be communicated via email notifications to all registered users.'
                    : `By using ${BRANDING.APP_NAME}, You agree to be bound by these Terms in their entirety.`}
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};
