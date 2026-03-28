'use client';

import { JSX } from 'react';
import {
  Cookie,
  Lock,
  Settings2,
  BarChart3,
  Megaphone,
  Globe,
  RefreshCw,
  Shield,
  Scale,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LegalLayout, LegalSection, SectionCard, SubSection, BulletItem } from './LegalLayout';
import { BRANDING } from '@/constants/branding.constant';

const LAST_UPDATED = new Date('2026-03-28');

const sections: LegalSection[] = [
  { id: 'ck-1', title: '1. What Are Cookies?', icon: Cookie, number: '01' },
  { id: 'ck-2', title: '2. Why We Use Cookies', icon: Shield, number: '02' },
  { id: 'ck-3', title: '3. Categories We Use', icon: Settings2, number: '03' },
  { id: 'ck-4', title: '4. Third-Party Cookies', icon: Globe, number: '04' },
  { id: 'ck-5', title: '5. Managing Your Preferences', icon: Lock, number: '05' },
  { id: 'ck-6', title: '6. Retention Periods', icon: RefreshCw, number: '06' },
  { id: 'ck-7', title: '7. Updates to This Policy', icon: RefreshCw, number: '07' },
  { id: 'ck-8', title: '8. Contact Us', icon: Mail, number: '08' },
];

const CookiePolicy = (): JSX.Element => (
  <LegalLayout
    title="Cookie Policy"
    description={
      <p>
        This Cookie Policy explains how <strong>Fornix Labs Limited</strong> (&quot;we&quot;,
        &quot;us&quot;, or &quot;our&quot;) uses cookies and similar tracking technologies on the{' '}
        <strong>Fornix Link</strong> telemedicine platform. It should be read alongside our{' '}
        <a href="/privacy-policy" className="text-primary underline-offset-2 hover:underline">
          Privacy &amp; Data Protection Policy
        </a>
        {''}.
      </p>
    }
    sections={sections}
    lastUpdated={LAST_UPDATED}
    heroIcon={Cookie}
    heroBadges={[
      { icon: Shield, label: 'GDPR Harmonized' },
      { icon: Scale, label: 'Act 843 Compliant' },
      { icon: Lock, label: 'Essential Only by Default' },
    ]}
    contactEmail={BRANDING.DPO_EMAIL}
    contactLabel="Contact DPO"
    footerTitle="Questions about cookies?"
    footerDescription="Our Data Protection Officer is here to help with any questions about how we use cookies or to update your preferences."
    footerButtons={
      <>
        <Button
          variant="secondary"
          child={
            <a href={`mailto:${BRANDING.DPO_EMAIL}`} className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Email DPO
            </a>
          }
        />
        <Button
          variant="outline"
          className="hover:text-primary border-white text-white hover:bg-white"
          child={
            <a href="/privacy-policy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Privacy Policy
            </a>
          }
        />
      </>
    }
  >
    {/* ── SECTION 1 ── */}
    <SectionCard id="ck-1" number="01" icon={Cookie} title="1. What Are Cookies?">
      <SubSection title="1.1. Definition">
        <p className="text-foreground text-sm leading-relaxed">
          Cookies are small text files that are placed on your device (computer, smartphone, or
          tablet) when you visit a website or web application. They are widely used to make
          platforms work more efficiently, to remember your preferences, and to provide information
          to the operators of the site.
        </p>
      </SubSection>
      <SubSection title="1.2. Similar Technologies">
        <p className="text-foreground text-sm leading-relaxed">
          In addition to cookies, we may use similar technologies such as:
        </p>
        <ul className="mt-2 space-y-1.5">
          <BulletItem>
            <strong>Local Storage &amp; Session Storage</strong> — browser-side key-value stores
            used for session management and preference persistence on the Fornix Link platform.
          </BulletItem>
          <BulletItem>
            <strong>Web Beacons / Pixels</strong> — currently not deployed; declared for future
            transparency.
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    {/* ── SECTION 2 ── */}
    <SectionCard id="ck-2" number="02" icon={Shield} title="2. Why We Use Cookies">
      <SubSection title="2.1. Lawful Basis">
        <p className="text-foreground text-sm leading-relaxed">
          We rely on the following legal bases under the{' '}
          <strong>Data Protection Act, 2012 (Act 843)</strong> of Ghana and harmonised GDPR
          principles:
        </p>
        <ul className="mt-2 space-y-1.5">
          <BulletItem>
            <strong>Legitimate Interest</strong> — for cookies strictly necessary to provide the
            service you request (e.g. keeping you logged in, CSRF protection).
          </BulletItem>
          <BulletItem>
            <strong>Consent</strong> — for all optional cookies (functional, analytics, marketing).
            You may withdraw consent at any time via the &quot;Manage Preferences&quot; link in the
            cookie banner.
          </BulletItem>
        </ul>
      </SubSection>
      <SubSection title="2.2. Healthcare-Specific Considerations">
        <p className="text-foreground text-sm leading-relaxed">
          As a telemedicine platform, Fornix Link processes sensitive health data under strict
          confidentiality obligations. We do <strong>not</strong> use optional cookies to profile
          your health conditions, share medical identifiers with advertisers, or build behavioural
          profiles based on your clinical interactions.
        </p>
      </SubSection>
    </SectionCard>

    {/* ── SECTION 3 ── */}
    <SectionCard id="ck-3" number="03" icon={Settings2} title="3. Categories We Use">
      <SubSection title="3.1. Essential / Strictly Necessary Cookies">
        <div className="flex items-center gap-2">
          <Lock className="text-primary h-4 w-4 shrink-0" />
          <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Always Active — Cannot Be Disabled
          </span>
        </div>
        <p className="text-foreground mt-2 text-sm leading-relaxed">
          These cookies are necessary for the platform to function and cannot be switched off. They
          are set in response to actions you take such as logging in, setting your privacy
          preferences, or filling in forms.
        </p>
        <ul className="mt-2 space-y-1.5">
          <BulletItem>Authentication tokens &amp; session identifiers</BulletItem>
          <BulletItem>CSRF / security tokens</BulletItem>
          <BulletItem>
            Redux-persist state hydration (authentication slice only — user, role, session
            timestamps)
          </BulletItem>
          <BulletItem>Session-expiry flags and redirect-after-login helpers</BulletItem>
          <BulletItem>Cookie-consent preference record</BulletItem>
        </ul>
        <p className="text-muted-foreground mt-2 text-xs">
          Retention: Session cookies expire when you close the browser. Persistent authentication
          tokens expire after 24 hours (server-enforced).
        </p>
      </SubSection>

      <SubSection title="3.2. Functional Cookies">
        <div className="flex items-center gap-2">
          <Settings2 className="text-primary h-4 w-4 shrink-0" />
          <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Optional — Consent Required
          </span>
        </div>
        <p className="text-foreground mt-2 text-sm leading-relaxed">
          These cookies enable enhanced functionality and personalisation. If you disable them some
          features may not work correctly.
        </p>
        <ul className="mt-2 space-y-1.5">
          <BulletItem>UI layout &amp; display preferences</BulletItem>
          <BulletItem>Language and locale settings</BulletItem>
          <BulletItem>Booking flow state between page navigations</BulletItem>
        </ul>
        <p className="text-muted-foreground mt-2 text-xs">Retention: Up to 12 months.</p>
      </SubSection>

      <SubSection title="3.3. Analytics Cookies">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-primary h-4 w-4 shrink-0" />
          <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Optional — Consent Required
          </span>
        </div>
        <p className="text-foreground mt-2 text-sm leading-relaxed">
          These cookies help us understand how visitors interact with the platform so we can improve
          it. All data is anonymised before processing — no personally identifiable or health
          information is included.
        </p>
        <ul className="mt-2 space-y-1.5">
          <BulletItem>Page view counts and navigation paths</BulletItem>
          <BulletItem>Feature usage rates (anonymised)</BulletItem>
          <BulletItem>Error and performance monitoring</BulletItem>
        </ul>
        <p className="text-muted-foreground mt-2 text-xs">Retention: Up to 12 months.</p>
      </SubSection>

      <SubSection title="3.4. Marketing Cookies">
        <div className="flex items-center gap-2">
          <Megaphone className="text-primary h-4 w-4 shrink-0" />
          <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Optional — Consent Required
          </span>
        </div>
        <p className="text-foreground mt-2 text-sm leading-relaxed">
          Marketing cookies may be used to deliver relevant health information and platform updates.{' '}
          <strong>
            We do not currently use marketing cookies and will update this policy before doing so.
          </strong>{' '}
          This category is declared here in the interest of full transparency.
        </p>
      </SubSection>
    </SectionCard>

    {/* ── SECTION 4 ── */}
    <SectionCard id="ck-4" number="04" icon={Globe} title="4. Third-Party Cookies">
      <SubSection title="4.1. Google OAuth">
        <p className="text-foreground text-sm leading-relaxed">
          When you choose to &quot;Sign in with Google&quot;, Google may set its own cookies in
          accordance with{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-2 hover:underline"
          >
            Google&apos;s Privacy Policy
          </a>
          {''}. We receive only the profile information (name, email, profile picture) you
          authorise; we do not receive Google advertising identifiers.
        </p>
      </SubSection>
      <SubSection title="4.2. Payment Processors">
        <p className="text-foreground text-sm leading-relaxed">
          Payment transactions are handled by third-party processors. These processors may set their
          own essential security cookies. We do not have access to or control over those cookies.
        </p>
      </SubSection>
      <SubSection title="4.3. No Health-Data Sharing">
        <p className="text-foreground text-sm leading-relaxed">
          We do not share any health-related identifiers, diagnoses, prescriptions, or clinical data
          with any third-party cookie provider.
        </p>
      </SubSection>
    </SectionCard>

    {/* ── SECTION 5 ── */}
    <SectionCard id="ck-5" number="05" icon={Lock} title="5. Managing Your Preferences">
      <SubSection title="5.1. Via the Consent Banner">
        <p className="text-foreground text-sm leading-relaxed">
          On your first visit you will see a cookie consent banner at the bottom of the page. You
          may select &quot;Accept All&quot;, &quot;Reject All&quot;, or &quot;Manage
          Preferences&quot; to control optional categories individually.
        </p>
      </SubSection>
      <SubSection title="5.2. Changing Your Mind">
        <p className="text-foreground text-sm leading-relaxed">
          You can update your preferences at any time by clearing your browser&apos;s local storage
          for this site or by contacting our Data Protection Officer. After clearing, the banner
          will reappear on your next visit.
        </p>
      </SubSection>
      <SubSection title="5.3. Browser-Level Controls">
        <p className="text-foreground text-sm leading-relaxed">
          Most browsers allow you to refuse or delete cookies via their settings. Please note that
          disabling <em>all</em> cookies — including essential ones — may prevent you from logging
          in or using core platform features.
        </p>
        <ul className="mt-2 space-y-1.5">
          <BulletItem>
            <strong>Chrome</strong>: Settings → Privacy and security → Cookies
          </BulletItem>
          <BulletItem>
            <strong>Firefox</strong>: Options → Privacy &amp; Security → Cookies and Site Data
          </BulletItem>
          <BulletItem>
            <strong>Safari</strong>: Preferences → Privacy → Manage Website Data
          </BulletItem>
          <BulletItem>
            <strong>Edge</strong>: Settings → Cookies and site permissions
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    {/* ── SECTION 6 ── */}
    <SectionCard id="ck-6" number="06" icon={RefreshCw} title="6. Retention Periods">
      <SubSection title="6.1. Summary Table">
        <div className="overflow-x-auto">
          <table className="text-foreground w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="py-2 pr-4 text-left font-semibold">Category</th>
                <th className="py-2 pr-4 text-left font-semibold">Max Retention</th>
                <th className="py-2 text-left font-semibold">Storage Location</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-2 pr-4">Essential</td>
                <td className="py-2 pr-4">24 hours (session) / session</td>
                <td className="py-2">Browser cookie / LocalStorage</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Functional</td>
                <td className="py-2 pr-4">12 months</td>
                <td className="py-2">LocalStorage</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Analytics</td>
                <td className="py-2 pr-4">12 months</td>
                <td className="py-2">Third-party / LocalStorage</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Marketing</td>
                <td className="py-2 pr-4">Not currently used</td>
                <td className="py-2">—</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Consent record</td>
                <td className="py-2 pr-4">Until manually cleared</td>
                <td className="py-2">LocalStorage</td>
              </tr>
            </tbody>
          </table>
        </div>
      </SubSection>
    </SectionCard>

    {/* ── SECTION 7 ── */}
    <SectionCard id="ck-7" number="07" icon={RefreshCw} title="7. Updates to This Policy">
      <SubSection title="7.1. Policy Versioning">
        <p className="text-foreground text-sm leading-relaxed">
          We may update this Cookie Policy to reflect changes in technology, legislation, or our
          data practices. When we make material changes we will increment the policy version number
          embedded in this page, which will trigger a new consent prompt for all users on their next
          visit.
        </p>
      </SubSection>
      <SubSection title="7.2. Notification">
        <p className="text-foreground text-sm leading-relaxed">
          For significant changes we will also notify registered users via the email address
          associated with their account or via an in-platform notification at least 14 days before
          the changes take effect.
        </p>
      </SubSection>
    </SectionCard>

    {/* ── SECTION 8 ── */}
    <SectionCard id="ck-8" number="08" icon={Mail} title="8. Contact Us">
      <SubSection title="8.1. Data Protection Officer">
        <p className="text-foreground text-sm leading-relaxed">
          For questions or complaints relating to this Cookie Policy or our use of cookies, please
          contact our Data Protection Officer:
        </p>
        <ul className="mt-2 space-y-1.5">
          <BulletItem>
            <strong>Email:</strong>{' '}
            <a
              href={`mailto:${BRANDING.DPO_EMAIL}`}
              className="text-primary underline-offset-2 hover:underline"
            >
              {BRANDING.DPO_EMAIL}
            </a>
          </BulletItem>
          <BulletItem>
            <strong>Phone:</strong>{' '}
            <a
              href={`tel:${BRANDING.CONTACT_PHONE}`}
              className="text-primary underline-offset-2 hover:underline"
            >
              {BRANDING.CONTACT_PHONE}
            </a>
          </BulletItem>
          <BulletItem>
            <strong>Address:</strong> {BRANDING.CONTACT_ADDRESS}
          </BulletItem>
        </ul>
      </SubSection>
      <SubSection title="8.2. Regulatory Authority">
        <p className="text-foreground text-sm leading-relaxed">
          If you believe we have not handled your personal data in accordance with applicable law,
          you have the right to lodge a complaint with the{' '}
          <strong>Data Protection Commission of Ghana</strong>.
        </p>
      </SubSection>
    </SectionCard>
  </LegalLayout>
);

export default CookiePolicy;
