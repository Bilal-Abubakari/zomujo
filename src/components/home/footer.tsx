import Link from 'next/link';
import { JSX } from 'react';
import { BRANDING } from '@/constants/branding.constant';
import { Shield, FileText } from 'lucide-react';

const Footer = (): JSX.Element => {
  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Terms & Conditions', href: '/terms-conditions' },
      ],
    },
  ];

  return (
    <footer className="border-border border-t bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-start justify-between space-y-8 md:flex-row md:space-y-0">
          <div>
            <p className="text-muted-foreground font-medium">More Comfortable.</p>
            <p className="text-muted-foreground font-medium">More Clean.</p>
          </div>

          <div className="flex flex-col space-y-8 md:flex-row md:space-y-0 md:space-x-16">
            {footerSections.map(({ links, title }) => (
              <div key={title}>
                <h4 className="text-foreground mb-4 font-semibold">{title}</h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-border mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} {BRANDING.COPYRIGHT_HOLDER}. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/privacy-policy"
                className="text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors"
              >
                <Shield className="h-3.5 w-3.5" />
                Privacy Policy
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link
                href="/terms-conditions"
                className="text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
