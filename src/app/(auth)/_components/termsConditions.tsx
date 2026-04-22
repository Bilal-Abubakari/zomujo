'use client';

import { JSX } from 'react';
import {
  Shield,
  FileText,
  Scale,
  AlertTriangle,
  Mail,
  Gavel,
  CreditCard,
  ShoppingCart,
  Lock,
  Globe,
  Building2,
} from 'lucide-react';
import { BRANDING } from '@/constants/branding.constant';
import { Button } from '@/components/ui/button';
import { LegalLayout, LegalSection, SectionCard, SubSection, BulletItem } from './LegalLayout';

const LAST_UPDATED = new Date('2026-03-19');

const sections: LegalSection[] = [
  { id: 'tc-1', title: '1. Introduction & Agreement', icon: FileText, number: '01' },
  { id: 'tc-2', title: '2. Interpretation & Defined Terms', icon: FileText, number: '02' },
  { id: 'tc-3', title: '3. Eligibility & Credentialing', icon: Shield, number: '03' },
  { id: 'tc-4', title: '4. Scope of Services', icon: Globe, number: '04' },
  { id: 'tc-5', title: '5. Clinical Disclaimers', icon: AlertTriangle, number: '05' },
  { id: 'tc-6', title: '6. Financial Obligations', icon: CreditCard, number: '06' },
  { id: 'tc-7', title: '7. GPO & Supply Chain', icon: ShoppingCart, number: '07' },
  { id: 'tc-8', title: '8. Physical Infrastructure', icon: Building2, number: '08' },
  { id: 'tc-9', title: '9. Data Privacy & AI', icon: Lock, number: '09' },
  { id: 'tc-10', title: '10. Insurance Interoperability', icon: Shield, number: '10' },
  { id: 'tc-11', title: '11. Prohibited Conduct', icon: AlertTriangle, number: '11' },
  { id: 'tc-12', title: '12. Intellectual Property', icon: FileText, number: '12' },
  { id: 'tc-13', title: '13. Limitation of Liability', icon: Scale, number: '13' },
  { id: 'tc-14', title: '14. Governing Law & ADR', icon: Gavel, number: '14' },
  { id: 'tc-15', title: '15. Termination', icon: AlertTriangle, number: '15' },
];

const TermsAndCondition = (): JSX.Element => (
  <LegalLayout
    title="Terms of Service Agreement"
    description={
      <p>
        This Terms of Service Agreement constitutes a legally binding contract between You and{' '}
        <strong>Fornix Labs Limited</strong>, governing your use of the Fornix Link platform and all
        associated services.
      </p>
    }
    sections={sections}
    lastUpdated={LAST_UPDATED}
    heroIcon={Gavel}
    heroBadges={[
      { icon: Scale, label: 'Ghana Law Governed' },
      { icon: Shield, label: 'Act 992 Incorporated' },
      { icon: Gavel, label: 'Act 772 Compliant' },
    ]}
    contactEmail={BRANDING.CONTACT_EMAIL}
    contactLabel="Contact Support"
    footerTitle="Questions about these Terms?"
    footerDescription="Contact our legal team for clarification on any provision of this Agreement."
    footerButtons={
      <>
        <Button
          variant="secondary"
          child={
            <a href={`mailto:${BRANDING.CONTACT_EMAIL}`} className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Contact Us
            </a>
          }
        />
        <Button
          variant="outline"
          className="border-white bg-transparent text-white hover:bg-white"
          child={
            <a href="/privacy-policy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Privacy Policy
            </a>
          }
        />
      </>
    }
  >
    <SectionCard
      id="tc-1"
      number="01"
      icon={FileText}
      title="1. Introduction, Binding Effect, and Nature of the Agreement"
    >
      <SubSection title="1.1. The Contracting Parties and Corporate Identity">
        <p className="text-foreground text-sm leading-relaxed">
          This Terms of Service Agreement (the &quot;Agreement&quot;) constitutes a legally binding
          contract by and between the User (hereinafter referred to as &quot;You,&quot;
          &quot;Your,&quot; or the &quot;User&quot;) and <strong>Fornix Labs Limited</strong>{' '}
          (hereinafter referred to as the &quot;Company,&quot; &quot;We,&quot; &quot;Us,&quot; or
          &quot;Our&quot;), a private company limited by shares, duly incorporated and validly
          existing under the <strong>Companies Act, 2019 (Act 992)</strong> of the Republic of
          Ghana, with its principal operations situated in Accra. The Company is the exclusive
          proprietor and operator of &quot;Fornix Link,&quot; which encompasses the proprietary web
          applications, mobile applications, software interfaces, and interconnected clinical
          utility ecosystems (collectively, the &quot;Platform&quot; or &quot;Services&quot;).
        </p>
      </SubSection>
      <SubSection title="1.2. Express Consent and Electronic Execution">
        <p className="text-foreground text-sm leading-relaxed">
          By accessing, downloading, integrating with, or otherwise utilizing the Services, You
          expressly acknowledge that You have read, comprehended, and unequivocally agree to be
          bound by all stipulations, covenants, and conditions set forth in this Agreement.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Electronic Signature:</strong> Pursuant to Sections 10 and 17 of the Electronic
            Transactions Act, 2008 (Act 772) of the Republic of Ghana, Your affirmative utilization
            of the Platform—including, but not limited to, the creation of an authorized account,
            the execution of digital bookings, or the selection of any &quot;I Agree&quot; or
            &quot;Accept&quot; interface—shall constitute Your valid electronic signature and
            manifest Your legally binding assent to this Agreement in its entirety.
          </BulletItem>
          <BulletItem>
            <strong>Refusal of Terms:</strong> Should You dissent from any provision contained
            herein, Your sole, exclusive, and immediate remedy is to permanently cease all use of
            the Platform and its associated Services.
          </BulletItem>
        </ul>
      </SubSection>
      <SubSection title="1.3. Limitation of Scope: Technology Infrastructure and GPO Status">
        <p className="text-foreground text-sm leading-relaxed">
          You expressly acknowledge and agree that the Company operates exclusively as a digital
          infrastructure provider, functioning primarily as a Software-as-a-Service (SaaS) platform
          and a Group Purchasing Organization (GPO). The Services are strictly limited to providing
          the technological framework necessary to facilitate:
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            The administrative and logistical management of virtual and hybrid practices for
            independent medical practitioners (&quot;Independent Doctors&quot;).
          </BulletItem>
          <BulletItem>
            Capacity management, digital discovery, and insurance interoperability for duly licensed
            healthcare facilities (&quot;Partner Hospitals&quot;).
          </BulletItem>
          <BulletItem>
            Collective procurement and supply chain optimization for participating Healthcare
            Providers.
          </BulletItem>
          <BulletItem>
            <strong>Disclaimer of Clinical Liability:</strong> Fornix Labs Limited is an aggregation
            and technology entity. The Company is not a licensed healthcare facility under the
            Health Institutions and Facilities Act, 2011 (Act 829), nor does it engage in the
            practice of medicine or pharmacy. The Company exercises no clinical oversight, dispenses
            no medical or diagnostic advice, and strictly disclaims any vicarious liability for the
            clinical decisions, treatments, or professional negligence of any Healthcare Provider
            utilizing the Platform. The provider-patient relationship is established exclusively
            between the User and the independent Healthcare Provider.
          </BulletItem>
        </ul>
      </SubSection>
      <SubSection title="1.4. Legal Notices and Official Domicile">
        <p className="text-foreground text-sm leading-relaxed">
          For the purposes of legal service of process, statutory notices, or formal administrative
          inquiries arising under or related to this Agreement, the Company designates the following
          official channels:
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Electronic Mail:</strong> admin@fornixlink.com or admin@fornixlabs.com
          </BulletItem>
          <BulletItem>
            <strong>Physical Domicile:</strong> Accra, Greater Accra Region, Republic of Ghana (A
            detailed registered address shall be provided upon formal written request or as filed
            with the Office of the Registrar of Companies).
          </BulletItem>
        </ul>
      </SubSection>
      <SubSection title="1.5. Unilateral Amendment and Continuing Compliance">
        <p className="text-foreground text-sm leading-relaxed">
          The Company reserves the unilateral right to amend, restate, or modify this Agreement at
          its sole discretion to ensure ongoing compliance with evolving Ghanaian statutory
          frameworks, regulatory directives (including those issued by the Data Protection
          Commission and HeFRA), or international best practices in health informatics.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Notification Protocol:</strong> Material modifications to this Agreement shall
            be communicated to Users either via the primary electronic mail address associated with
            their registered account or through a prominent, unavoidable digital notice within the
            Platform&apos;s interface.
          </BulletItem>
          <BulletItem>
            <strong>Effectuation:</strong> Such amendments shall enter into full legal force and
            effect <strong>thirty (30) days</strong> following the date of publication. Your
            continued access to or utilization of the Platform subsequent to this notice period
            shall constitute an irrevocable waiver of any objection and your explicit acceptance of
            the revised Agreement.
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    <SectionCard id="tc-2" number="02" icon={FileText} title="2. Interpretation and Defined Terms">
      <p className="text-foreground text-sm leading-relaxed">
        To ensure absolute clarity, mitigate ambiguity, and establish legally binding precision
        throughout this Agreement, the following capitalized terms, whether utilized in the singular
        or plural, shall possess the specialized meanings and statutory interpretations ascribed to
        them below:
      </p>
      <ul className="mt-2 space-y-3">
        <BulletItem>
          <strong>2.1. &quot;The Company&quot; or &quot;Fornix Labs&quot;:</strong> Fornix Labs
          Limited, a juristic entity duly incorporated and existing under the Companies Act, 2019
          (Act 992) of the Republic of Ghana, acting in its capacity as the absolute owner,
          developer, and exclusive licensor of the Platform.
        </BulletItem>
        <BulletItem>
          <strong>2.2. &quot;Platform&quot; or &quot;Fornix Link&quot;:</strong> The proprietary,
          multi-tenant digital ecosystem comprising web applications, mobile interfaces,
          software-as-a-service (SaaS) modules, and application programming interfaces (APIs)
          engineered by the Company to facilitate health informatics, clinical utility, and provider
          connectivity.
        </BulletItem>
        <BulletItem>
          <strong>2.3. &quot;Healthcare Provider&quot;:</strong> Any natural person or duly
          incorporated entity empirically verified and provisioned with an active, authorized
          account on the Platform for the dispensation of medical, allied health, or wellness
          services. This classification is strictly bifurcated into:{' '}
          <strong>(a) &quot;Independent Doctor&quot;</strong> — a medical practitioner possessing a
          valid, unencumbered license issued by the Medical and Dental Council (MDC) or the Allied
          Health Professions Council (AHPC) of Ghana; and{' '}
          <strong>(b) &quot;Partner Hospital&quot;</strong> — a primary, secondary, or tertiary
          health facility categorized as Level 4 or Level 5 by the Ghana Health Service (GHS) and
          holding a current HeFRA certificate of registration.
        </BulletItem>
        <BulletItem>
          <strong>2.4. &quot;User&quot; or &quot;Patient&quot;:</strong> Any natural person, acting
          in their own legal capacity or as a lawfully authorized proxy for a minor or dependent,
          who authenticates into the Platform to access informational content, schedule clinical
          encounters, or procure related healthcare services.
        </BulletItem>
        <BulletItem>
          <strong>2.5. &quot;Relational Health Memory&quot;:</strong> The Company&apos;s
          proprietary, AES-256 encrypted, interoperable Electronic Medical Record (EMR) and Personal
          Health Record (PHR) architecture, designed to chronologically aggregate, synthesize, and
          safeguard a User&apos;s longitudinal health data in strict compliance with the Data
          Protection Act, 2012 (Act 843).
        </BulletItem>
        <BulletItem>
          <strong>2.6. &quot;Group Purchasing Organization&quot; (GPO):</strong> The centralized
          collective bargaining and supply chain aggregation utility native to the Platform,
          established to leverage economies of scale on behalf of subscribed Healthcare Providers to
          negotiate preferential procurement tariffs from vetted medical and pharmaceutical
          suppliers.
        </BulletItem>
        <BulletItem>
          <strong>2.7. &quot;Shadow Calendar&quot;:</strong> A proprietary inventory and
          capacity-mapping algorithm deployed by Partner Hospitals to digitally list, manage, and
          monetize idle or underutilized clinical assets (e.g., MRI scheduling, operating theatre
          allocations, specialist out-patient department hours) as an extranet overlay, purposefully
          decoupled from their internal Hospital Information Systems (HIS).
        </BulletItem>
        <BulletItem>
          <strong>2.8. &quot;Certified Lead&quot;:</strong> A User whose commercial intent has been
          cryptographically and financially validated through the remittance of a &quot;Financial
          Assurance Deposit&quot; or the total requisite consultation fee via the Platform&apos;s
          escrow gateway, thereby creating a binding reservation for a specific clinical service.
        </BulletItem>
        <BulletItem>
          <strong>2.9. &quot;Ghana Card&quot;:</strong> The definitive national biometric
          identification document issued by the National Identification Authority (NIA) under the
          National Identity Register Act, 2008 (Act 750). It is mandated by the Company as the
          irrebuttable, primary proof of identity for the credentialing, continuous verification,
          and anti-fraud auditing of Healthcare Providers on the Platform.
        </BulletItem>
        <BulletItem>
          <strong>2.10. &quot;MoMo&quot; (Mobile Money):</strong> Regulated electronic money
          services and digital payment interoperability frameworks operated by licensed
          telecommunications networks and authorized Electronic Money Issuers (EMIs) within Ghana.
          MoMo serves as the designated conduit for financial settlement, escrow execution, and
          disbursements on the Platform, governed by the Payment Systems and Services Act, 2019 (Act
          987).
        </BulletItem>
      </ul>
    </SectionCard>

    <SectionCard
      id="tc-3"
      number="03"
      icon={Shield}
      title="3. Eligibility, Legal Capacity, and Mandatory Credentialing"
    >
      <SubSection title="3.1. User Capacity and Agency">
        <p className="text-foreground text-sm leading-relaxed">
          Access to and utilization of the Platform is strictly predicated upon the User possessing
          the requisite legal capacity to enter into binding contracts pursuant to the Contracts
          Act, 1960 (Act 25) and the Children&apos;s Act, 1998 (Act 560) of the Republic of Ghana.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Age of Majority:</strong> You hereby represent and warrant that You are at least{' '}
            <strong>eighteen (18) years of age</strong> and of sound mind.
          </BulletItem>
          <BulletItem>
            <strong>Minors and Vicarious Liability:</strong> Individuals chronologically under the
            age of eighteen (&quot;Minors&quot;) are expressly prohibited from utilizing the
            Services independently. Any access by a Minor must be executed under the direct,
            continuous, and authenticated supervision of a parent or court-appointed legal guardian.
            Said guardian shall be designated as the primary account holder and hereby accepts
            absolute vicarious liability and indemnifies the Company against any claims,
            obligations, or financial liabilities arising from the Minor&apos;s use of the Platform.
          </BulletItem>
        </ul>
      </SubSection>
      <SubSection title='3.2. Statutory Vetting and Provider Credentialing (The "Ghana Card" Imperative)'>
        <p className="text-foreground text-sm leading-relaxed">
          In strict adherence to national security directives, anti-money laundering (AML)
          protocols, and paramount healthcare safety standards, the Company enforces a
          zero-tolerance credentialing framework. All Healthcare Providers must satisfy the
          following mandatory conditions precedent before access is granted:
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Cryptographic Identity Verification:</strong> Pursuant to the National Identity
            Register Act, 2008 (Act 750) and the National Identity Register Regulations, 2012 (L.I.
            2111), the National Identity Card (&quot;Ghana Card&quot;) is the sine qua non for
            provider authentication. No alternative form of identification shall be accepted for
            individual clinical account provisioning.
          </BulletItem>
          <BulletItem>
            <strong>Professional Licensure and Standing:</strong> Independent Doctors are compelled
            to submit valid, verifiable registration numbers issued by the Medical and Dental
            Council (MDC), the Pharmacy Council, or the Allied Health Professions Council (AHPC), as
            governed by the Health Professions Regulatory Bodies Act, 2013 (Act 857).
          </BulletItem>
          <BulletItem>
            <strong>Automated Real-Time Auditing:</strong> The User and Provider acknowledge that
            the Company deploys automated APIs integrated directly with the Ghana Medical
            Registry&apos;s 2026 Verification Portal, executing real-time, continuous audits to
            conclusively affirm that every practitioner&apos;s license remains active, unencumbered,
            and in impeccable professional standing.
          </BulletItem>
          <BulletItem>
            <strong>Facility Accreditation:</strong> Partner Hospitals represent and warrant that
            they possess, and shall continuously maintain, a valid operational license issued by the
            Health Facilities Regulatory Agency (HeFRA) in accordance with the Health Institutions
            and Facilities Act, 2011 (Act 829).
          </BulletItem>
        </ul>
      </SubSection>
      <SubSection title="3.3. Continuous Compliance and Revocation of Privileges">
        <p className="text-foreground text-sm leading-relaxed">
          The covenants regarding licensure and identity contained within this Section 3 are
          continuing obligations.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Right of Suspension:</strong> The Company reserves the unilateral right to
            immediately, and without prior notice (ex parte), suspend, restrict, or permanently
            terminate the access of any Healthcare Provider whose periodic automated audit yields a
            suspended, expired, or revoked professional license.
          </BulletItem>
          <BulletItem>
            <strong>Document Expiration:</strong> Furthermore, the lapse or expiration of a
            Provider&apos;s Ghana Card, or the failure to furnish an updated, verified biometric
            credential upon request, shall constitute a material breach of this Agreement,
            triggering immediate account deactivation until statutory compliance is restored.
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    <SectionCard
      id="tc-4"
      number="04"
      icon={Globe}
      title="4. Scope of Services and Platform Infrastructure"
    >
      <SubSection title="4.1. Nature of the Interoperable Digital Conduit">
        <p className="text-foreground text-sm leading-relaxed">
          You expressly acknowledge that the Company functions exclusively as an intermediary
          electronic communications and infrastructure provider within the meaning of the Electronic
          Transactions Act, 2008 (Act 772). The Platform is engineered as a digital nexus to
          provision scheduling, facilitate synchronous and asynchronous virtual consultations, and
          execute collective bargaining utilities.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Absolute Disclaimer of Medical Practice:</strong> The Company categorically
            disclaims any involvement in the practice of medicine, pharmacy, or any regulated health
            profession. The Company does not intervene in, review, or exercise control over the
            independent clinical judgment of the practitioners utilizing the Platform. The Platform
            is a conduit for health informatics, not a substitute for clinical expertise.
          </BulletItem>
        </ul>
      </SubSection>
      <SubSection title='4.2. Extranet Capacity Management (The "Shadow Calendar")'>
        <p className="text-foreground text-sm leading-relaxed">
          For the operational benefit of Partner Hospitals, the Platform provisions an asynchronous
          digital ledger designated as the &quot;Shadow Calendar.&quot;
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Hospital Fiduciary Duty:</strong> The Partner Hospital retains absolute and
            non-delegable responsibility for the manual configuration, synchronization, and
            real-time maintenance of this calendar to accurately reflect idle clinical inventory
            (e.g., Specialist OPD hours, radiological imaging slots).
          </BulletItem>
          <BulletItem>
            <strong>Waiver of Liability for Scheduling Exigencies:</strong> The Company accepts no
            liability, and is hereby fully indemnified by the Partner Hospital and User alike, for
            any tortious or contractual claims arising from scheduling conflicts, overbookings, or
            failure to deliver care resulting from a hospital&apos;s negligence in maintaining their
            allocated digital inventory.
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    <SectionCard
      id="tc-5"
      number="05"
      icon={AlertTriangle}
      title="5. Clinical Disclaimers and Emergency Exclusions"
    >
      <SubSection title="5.1. Non-Diagnostic Information and Algorithmic Aids">
        <p className="text-foreground text-sm leading-relaxed">
          All data, content, clinical summaries, or artificial intelligence-generated outputs
          surfaced within the Platform, including but not limited to those residing within the
          Relational Health Memory, are provided strictly for administrative, logistical, and
          informational augmentation.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Absence of Medical Advice:</strong> None of the aforementioned technological
            aids constitute a medical diagnosis, a therapeutic prescription, a formalized treatment
            plan, or a substitute for independent, in-person clinical evaluation by a licensed
            medical professional. Reliance on any non-practitioner-generated data within the
            Platform is done solely at the User&apos;s own assumed risk.
          </BulletItem>
        </ul>
      </SubSection>
      <SubSection title="5.2. Absolute Prohibition on Emergency Utilization">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm leading-relaxed font-bold text-red-700 uppercase">
            THE PLATFORM IS FUNDAMENTALLY NOT CONFIGURED, DESIGNED, NOR INTENDED FOR THE TRIAGE,
            DISCOVERY, OR MANAGEMENT OF ACUTE MEDICAL EMERGENCIES.
          </p>
        </div>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Mandatory Emergency Protocol:</strong> If a User is experiencing a
            life-threatening condition, acute physiological distress, or a psychiatric emergency,
            they are strictly mandated to cease use of the Platform immediately. The User must
            proceed to the nearest HeFRA-accredited emergency department, or contact the appropriate
            national emergency dispatch, including but not limited to the{' '}
            <strong>National Ambulance Service (Dial 193)</strong> or the{' '}
            <strong>National General Emergency Line (Dial 112)</strong>.
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    <SectionCard
      id="tc-6"
      number="06"
      icon={CreditCard}
      title="6. Financial Obligations, Remuneration, and Payment Clearance"
    >
      <SubSection title="6.1. Platform Remuneration and Technology Licensing Fees">
        <p className="text-foreground text-sm leading-relaxed">
          In consideration for the provisioning, maintenance, and continuous licensing of the
          Platform&apos;s scheduling algorithms, billing infrastructure, and practice management
          technology, the Company levies a strictly delineated Platform Commission.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Commission Quantum:</strong> A mandatory commission of{' '}
            <strong>twenty percent (20%)</strong> shall be assessed on the base tariff of all
            clinical consultations, procedures, or allied services initiated, discovered, or
            executed through the Platform.
          </BulletItem>
          <BulletItem>
            <strong>Disclaimer of Fee-Splitting:</strong> Both the User and the Healthcare Provider
            expressly acknowledge that this commission constitutes a bona fide technology and
            administrative licensing fee. It is entirely decoupled from the clinical intervention
            itself and does not constitute unlawful fee-splitting, kickbacks, or professional
            inducement under the ethical guidelines of the Medical and Dental Council (MDC).
          </BulletItem>
        </ul>
      </SubSection>
      <SubSection title="6.2. Statutory Taxation and Electronic Fiscal Compliance (The 2026 Standard)">
        <p className="text-foreground text-sm leading-relaxed">
          All financial transactions executed within the Platform ecosystem are strictly governed by
          the fiscal mandates of the Ghana Revenue Authority (GRA).
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>VAT Applicability:</strong> Pursuant to the Value Added Tax Act, 2025 (Act 1151)
            and its corresponding legislative instruments, a standard statutory Value Added Tax
            (VAT) of <strong>twenty percent (20%)</strong>, inclusive of all applicable statutory
            levies (e.g., NHIL, GETFund, COVID-19 Levy), shall be applied to all taxable services
            rendered.
          </BulletItem>
          <BulletItem>
            <strong>Exclusivity of Tariffs:</strong> The twenty percent (20%) Platform Commission
            designated in Section 6.1 is explicitly exclusive of VAT and any other applicable
            withholding taxes.
          </BulletItem>
          <BulletItem>
            <strong>VSDC Integration and E-Invoicing:</strong> To ensure absolute statutory
            compliance, the Platform&apos;s billing architecture is natively integrated with the
            GRA&apos;s Virtual Sales Data Controller (VSDC). Upon the financial clearing of any
            transaction, the User shall automatically be issued a cryptographically verifiable
            digital E-VAT receipt, fulfilling all evidentiary requirements under Ghanaian tax law.
          </BulletItem>
        </ul>
      </SubSection>
      <SubSection title="6.3. Fiduciary Escrow, Counterparty Risk Mitigation, and Settlement">
        <p className="text-foreground text-sm leading-relaxed">
          To preserve the economic integrity of the Platform and decisively eliminate the
          counterparty risk associated with appointment abandonment (&quot;no-shows&quot;), a
          rigorous prepayment protocol is enforced.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Mandatory Upfront Financial Assurance:</strong> The consummation of any digital
            booking is strictly contingent upon the User executing an upfront, non-repudiable
            payment. This remittance—whether constituting the total consultation fee or a predefined
            Financial Assurance Deposit—must be cleared through authorized MoMo gateways or
            interoperable card network switches recognized under the Payment Systems and Services
            Act, 2019 (Act 987).
          </BulletItem>
          <BulletItem>
            <strong>Escrow Mechanics:</strong> All remitted funds are instantaneously routed into a
            segregated, secure digital escrow account managed by a licensed payment service provider
            (PSP).
          </BulletItem>
          <BulletItem>
            <strong>Trigger for Settlement:</strong> Funds shall remain in escrow and are strictly
            prohibited from being commingled with the Company&apos;s operational capital. Final
            settlement and disbursement to the Provider&apos;s designated &quot;Fornix Wallet&quot;
            shall only be triggered upon the cryptographic confirmation of the completed clinical
            encounter or service delivery on the Platform.
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    <SectionCard
      id="tc-7"
      number="07"
      icon={ShoppingCart}
      title="7. The Group Purchasing Organization (GPO) and Supply Chain Aggregation"
    >
      <SubSection title="7.1. Collective Bargaining and Commercial Utility">
        <p className="text-foreground text-sm leading-relaxed">
          The Company operates an embedded Group Purchasing Organization (GPO) designed to function
          as a collective bargaining agent. By aggregating the decentralized procurement volume of
          the Platform&apos;s network of Healthcare Providers, the GPO negotiates preferential
          commercial tariffs, bulk discounts, and supply chain efficiencies with empirically vetted
          medical, pharmaceutical, and consumable suppliers.
        </p>
      </SubSection>
      <SubSection title="7.2. Tiered Access Preconditions and Licensing">
        <p className="text-foreground text-sm leading-relaxed">
          Access to the proprietary GPO Marketplace and the exploitation of its negotiated
          &quot;Member-Only&quot; commercial terms is not an inherent right of basic Platform
          registration; it is an exclusive, licensed commercial utility.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Subscription Mandate:</strong> To unlock and utilize the GPO infrastructure, a
            Healthcare Provider must maintain an active, fully paid subscription to the
            Platform&apos;s premium administrative tiers, specifically designated as{' '}
            <strong>&quot;Fornix Pro&quot;</strong> or{' '}
            <strong>&quot;Fornix Enterprise.&quot;</strong>
          </BulletItem>
        </ul>
      </SubSection>
      <SubSection title="7.3. Administrative Remuneration and Safe Harbor Disclosures">
        <p className="text-foreground text-sm leading-relaxed">
          In the course of operating the GPO and facilitating complex supply chain interoperability,
          the Company incurs substantial infrastructural and administrative costs.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Supplier Disbursements:</strong> The User and Provider acknowledge and consent
            that the Company may exact, receive, and retain administrative fees, rebates, or
            platform integration charges directly from third-party medical suppliers. These
            disbursements are strictly levied as compensation for facilitating high-volume,
            aggregated transactions and maintaining the digital marketplace. They are explicitly
            structured to comply with international anti-kickback safe harbor provisions and do not
            constitute an illegal inducement for the referral of specific clinical services.
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    <SectionCard
      id="tc-8"
      number="08"
      icon={Building2}
      title='8. Physical Infrastructure, Real Estate, and "Guild Houses"'
    >
      <SubSection title="8.1. Commercial Real Estate and Facility Provisioning">
        <p className="text-foreground text-sm leading-relaxed">
          The Company may, at its absolute discretion, acquire, lease, develop, manage, or operate
          physical real property assets, formally designated within this ecosystem as{' '}
          <strong>&quot;Fornix Guild Houses.&quot;</strong> These physical assets are engineered as
          turnkey, technologically integrated clinical hubs provisioned specifically for the
          utilization of credentialed Independent Doctors and allied health professionals.
        </p>
      </SubSection>
      <SubSection title="8.2. Statutory Facility Licensing">
        <p className="text-foreground text-sm leading-relaxed">
          The Company represents, warrants, and covenants that each distinct physical premises
          designated as a Fornix Guild House shall be independently inspected, accredited, licensed,
          and maintained in strict compliance with the health and safety mandates of the{' '}
          <strong>Health Institutions and Facilities Act, 2011 (Act 829)</strong> and the prevailing
          regulatory directives of the <strong>Health Facilities Regulatory Agency (HeFRA)</strong>.
        </p>
      </SubSection>
      <SubSection title="8.3. Severability of Clinical Liability and Mandatory Indemnification">
        <p className="text-foreground text-sm leading-relaxed">
          The User and the Healthcare Provider expressly acknowledge that the Company&apos;s
          provision of physical space, utilities, and digital infrastructure does not, under any
          circumstances, create an employer-employee relationship, an agency, a partnership, or a
          joint venture in law.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Absolute Liability:</strong> The Independent Doctor utilizing a Fornix Guild
            House retains absolute, non-transferable, and non-delegable liability for their clinical
            conduct, strict adherence to the professional standard of care, and all subsequent
            patient outcomes.
          </BulletItem>
          <BulletItem>
            <strong>Insurance Covenant:</strong> The Provider explicitly covenants to procure and
            maintain comprehensive professional indemnity and medical malpractice insurance at all
            times while operating within said premises.
          </BulletItem>
          <BulletItem>
            <strong>Hold Harmless Clause:</strong> The Provider hereby fully, irrevocably
            indemnifies and holds the Company, its directors, and its assigns harmless against any
            and all claims, torts, statutory penalties, or equitable actions arising directly or
            indirectly from their clinical practice within the facility.
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    <SectionCard
      id="tc-9"
      number="09"
      icon={Lock}
      title='9. Data Privacy, Cryptography, and the "Relational Health Memory"'
    >
      <SubSection title="9.1. Statutory Registration and Jurisdictional Compliance">
        <p className="text-foreground text-sm leading-relaxed">
          The Company is duly registered and formally recognized as a Data Controller by the{' '}
          <strong>Data Protection Commission (DPC)</strong> of the Republic of Ghana. The Company
          covenants to collect, process, store, and transmit all personal data and highly sensitive
          health informatics in absolute conformity with the foundational data protection principles
          enshrined in the <strong>Data Protection Act, 2012 (Act 843)</strong> and the rigorously
          enforced 2026 DPC Enforcement Standards.
        </p>
      </SubSection>
      <SubSection title="9.2. Cryptographic Security Standards">
        <p className="text-foreground text-sm leading-relaxed">
          To mitigate the risk of unauthorized exfiltration or data breaches, all electronic medical
          records, personal health histories, and longitudinal data schemas housed within the
          proprietary &quot;Relational Health Memory&quot; architecture are systematically
          encrypted. The Company deploys{' '}
          <strong>Advanced Encryption Standard with a 256-bit key size (AES-256)</strong> for all
          data at rest, and enforces <strong>Transport Layer Security (TLS) 1.3</strong> or higher
          protocols for all data in transit.
        </p>
      </SubSection>
      <SubSection title='9.3. Data Sovereignty and Time-Bound "Consent Grants"'>
        <p className="text-foreground text-sm leading-relaxed">
          The foundational legal premise of the Platform is absolute patient data sovereignty. The
          User retains unencumbered, proprietary ownership of their health data.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Zero-Knowledge Architecture Principles:</strong> The Platform architecture is
            configured to ensure that no Healthcare Provider, administrative staff, or third-party
            entity may access, query, or append data to a User&apos;s Relational Health Memory
            absent an explicit, digitally authenticated, and strictly time-bound &quot;Consent
            Grant&quot; directly executed by the User.
          </BulletItem>
        </ul>
      </SubSection>
      <SubSection title='9.4. Artificial Intelligence (AI) Governance and "Human-in-the-Loop" Mandates'>
        <p className="text-foreground text-sm leading-relaxed">
          To the extent that the Platform deploys machine learning algorithms, Large Language Models
          (LLMs), or other AI-driven heuristic tools to synthesize, summarize, or surface clinical
          data to aid practitioners, the Company warrants full alignment with the regulatory
          frameworks anticipated under the 2026 Emerging Technologies Bill.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Decision Support Limitation:</strong> All AI-generated outputs are strictly
            classified as non-diagnostic, administrative decision-support utilities.
          </BulletItem>
          <BulletItem>
            <strong>Mandatory Oversight:</strong> The Platform&apos;s clinical interface legally and
            technologically mandates &quot;Human-in-the-Loop&quot; (HITL) oversight, ensuring
            unequivocally that final interpretive, diagnostic, and prescriptive authority rests
            exclusively with the licensed human medical practitioner.
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    <SectionCard
      id="tc-10"
      number="10"
      icon={Shield}
      title="10. Insurance Interoperability and Discovery Limitations"
    >
      <SubSection title="10.1. Algorithmic Discovery Utility and Disclaimer of Guaranty">
        <p className="text-foreground text-sm leading-relaxed">
          The Platform incorporates an algorithmic discovery and routing utility (the
          &quot;Insurance Matcher&quot;) engineered to assist Users in identifying Healthcare
          Providers who have ostensibly contracted with specific statutory health insurance schemes
          (e.g., the National Health Insurance Scheme — NHIS) or private commercial health
          maintenance organizations (HMOs) regulated under the Insurance Act, 2021 (Act 1061).
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Informational Safe Harbor:</strong> The User explicitly acknowledges that this
            utility is strictly informational. While the Company endeavors to maintain database
            synchronization with the NHIA 2026 Digital Registry and private insurer APIs,
            third-party provider-insurer contracts are subject to immediate, unnotified termination
            or modification.
          </BulletItem>
          <BulletItem>
            <strong>Waiver of Underwriting Liability:</strong> The Company operates strictly as a
            technology vendor and does not act as an underwriter, a claims adjudicator, or a
            guarantor of coverage. The Company bears zero liability for any denied claims,
            out-of-pocket expenses, or discrepancies between the Platform&apos;s directory and the
            actual billing realities at the point of care.
          </BulletItem>
        </ul>
      </SubSection>
      <SubSection title="10.2. Statutory NHIA (2026) Compliance and Biometric Mandates">
        <p className="text-foreground text-sm leading-relaxed">
          To ensure absolute compliance with the National Health Insurance Authority&apos;s (NHIA)
          2026 &quot;Digitalization and Compliance&quot; regulatory pillars, Users seeking to invoke
          NHIS benefits strictly covenant to the following:
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Biometric Authentication (BMAS):</strong> The User is legally mandated to
            present valid, unexpired NHIS credentials for on-site Biometric Membership
            Authentication System (BMAS) verification at the physical premises of the Partner
            Hospital or Fornix Guild House prior to the dispensation of care.
          </BulletItem>
          <BulletItem>
            <strong>Prohibition of Extortionate Billing (Co-payments):</strong> The Company enforces
            a zero-tolerance compliance doctrine regarding illegal co-payments. Providers are
            strictly prohibited from levying any unauthorized &quot;extra charges&quot; or
            &quot;top-ups&quot; for clinical interventions explicitly covered under the prevailing
            NHIS tariff regime. The Company reserves the right to suspend any Provider reported and
            empirically verified to be engaging in such predatory billing practices.
          </BulletItem>
        </ul>
      </SubSection>
      <SubSection title="10.3. Adjudication and Final Prior Authorization">
        <p className="text-foreground text-sm leading-relaxed">
          The generation of a digital appointment through the Platform does not constitute prior
          authorization for medical procedures. The absolute and final authority regarding the scope
          of coverage, benefit limits, and claims adjudication rests exclusively with the
          User&apos;s designated insurer and must be definitively verified at the physical facility
          upon the commencement of the clinical encounter.
        </p>
      </SubSection>
    </SectionCard>

    <SectionCard
      id="tc-11"
      number="11"
      icon={AlertTriangle}
      title="11. Prohibited Conduct, Disintermediation, and Platform Integrity"
    >
      <SubSection title="11.1. Anti-Circumvention and Disintermediation Covenant">
        <p className="text-foreground text-sm leading-relaxed">
          The commercial viability of the Platform relies entirely upon the trust, discovery, and
          secure escrow mechanisms provided by the Company.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>The Anti-Bypass Rule:</strong> Users and Healthcare Providers enter into a
            strict, mutually binding covenant of non-circumvention. It is a fundamental and material
            breach of this Agreement for any User or Provider to solicit, negotiate, or execute
            financial settlement for clinical services outside of the Platform&apos;s authorized
            MoMo or card gateways, provided that the initial discovery, scheduling, or introduction
            of the parties was facilitated by the Platform.
          </BulletItem>
          <BulletItem>
            <strong>Summary Termination for Fee-Splitting:</strong> Any empirical evidence of
            digital &quot;side-deals,&quot; illicit fee-splitting, or intentional bypassing of the
            Company&apos;s Section 6.1 Platform Commission shall trigger summary, unappealable
            account termination, permanent exclusion from the Fornix Labs ecosystem, and the
            forfeiture of any undisbursed funds held in escrow to cover liquidated damages.
          </BulletItem>
        </ul>
      </SubSection>
      <SubSection title="11.2. Fraudulent and Deceptive Commercial Practices">
        <p className="text-foreground text-sm leading-relaxed">
          To preserve the algorithmic integrity and clinical safety of the Platform, the following
          actions are classified as severe, tortious, and potentially criminal breaches of this
          Agreement:
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>(a) Algorithmic Manipulation (&quot;Ghost Bookings&quot;):</strong> The
            deliberate creation of fictitious, non-clinical appointments or the orchestration of
            synergistic bookings by colluding entities aimed at artificially inflating a
            Provider&apos;s algorithmic ranking, visibility, or perceived demand metrics.
          </BulletItem>
          <BulletItem>
            <strong>(b) Identity Spoofing and &quot;License Renting&quot;:</strong> The unauthorized
            delegation, sub-licensing, or transfer of a verified clinical account. Permitting any
            uncredentialed, unverified, or third-party individual to access the Platform utilizing a
            verified Independent Doctor&apos;s credentials constitutes gross professional misconduct
            and potential criminal impersonation under the Criminal Offences Act, 1960 (Act 29),
            triggering mandatory reporting by the Company to the Medical and Dental Council (MDC)
            and the Ghana Police Service.
          </BulletItem>
          <BulletItem>
            <strong>(c) Unconscionable Pricing (Price Gouging):</strong> Exploiting the Platform to
            exact extortionate tariffs from Users. Unless specifically authorized in writing by the
            Company for complex, highly specialized oncological, surgical, or neurological
            procedures, any attempt to bypass or inflate fees beyond the algorithmic &quot;Fornix
            MVP Pricing Cap&quot; (established at a maximum base fee of <strong>GH₵ 400</strong>)
            shall result in immediate administrative review and account suspension.
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    <SectionCard
      id="tc-12"
      number="12"
      icon={FileText}
      title="12. Intellectual Property Rights and Proprietary Assets"
    >
      <SubSection title="12.1. Absolute Ownership and Copyright Reservation">
        <p className="text-foreground text-sm leading-relaxed">
          The User and the Healthcare Provider expressly acknowledge that Fornix Labs retains
          absolute, indivisible, and unencumbered ownership of all intellectual property residing
          within or generated by the Platform.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Scope of Proprietary Assets:</strong> This includes, but is not limited to, the
            object code, source code, proprietary algorithms, the cryptographic architecture of the
            Relational Health Memory, user interface designs (UI/UX), trademarks, service marks,
            trade secrets, and all associated moral rights.
          </BulletItem>
          <BulletItem>
            <strong>Statutory Protection:</strong> These assets are fiercely protected under the{' '}
            <strong>Copyright Act, 2005 (Act 690)</strong>, the{' '}
            <strong>Trademarks Act, 2004 (Act 664)</strong>, and applicable international
            intellectual property treaties to which the Republic of Ghana is a signatory.
          </BulletItem>
        </ul>
      </SubSection>
      <SubSection title="12.2. Grant of Limited, Revocable License">
        <p className="text-foreground text-sm leading-relaxed">
          Conditioned strictly upon Your continuous compliance with this Agreement, the Company
          grants You a revocable, non-exclusive, non-transferable, and non-sublicensable limited
          license to access and utilize the Platform.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Scope of License:</strong> This license is granted strictly for the bona fide
            intended purpose of the Services—namely, healthcare connectivity, digital discovery, and
            clinical practice management. It grants no ownership interest or equitable right in the
            underlying software.
          </BulletItem>
        </ul>
      </SubSection>
      <SubSection title="12.3. Prohibited Exploitation and Reverse Engineering">
        <p className="text-foreground text-sm leading-relaxed">
          Any utilization of the Platform beyond the scope of the explicitly granted limited license
          constitutes an actionable infringement. You are strictly prohibited from:
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>(a) Decompilation and Reverse Engineering:</strong> Attempting to decipher,
            decompile, disassemble, or reverse-engineer any of the software comprising or in any way
            making up a part of the Platform.
          </BulletItem>
          <BulletItem>
            <strong>(b) Unauthorized Extraction (&quot;Scraping&quot;):</strong> Deploying automated
            scripts, spiders, web crawlers, or unauthorized API bridges to systematically extract,
            harvest, or index the Company&apos;s database of Healthcare Providers, pricing
            architectures, or User data.
          </BulletItem>
          <BulletItem>
            <strong>(c) Derivative Works:</strong> Modifying, adapting, translating, or creating
            derivative works based upon the Platform&apos;s proprietary architecture or brand
            identity without the express, written consent of the Company&apos;s Board of Directors.
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    <SectionCard
      id="tc-13"
      number="13"
      icon={Scale}
      title="13. Limitation of Liability and Equitable Indemnification"
    >
      <SubSection title="13.1. Absolute Firewall Against Clinical Liability (Malpractice Exclusion)">
        <p className="text-foreground text-sm leading-relaxed">
          The commercial architecture of Fornix Link is fundamentally decoupled from the clinical
          dispensation of care.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Absence of Privity in Care:</strong> No privity of contract exists between the
            Company and the User concerning clinical outcomes. The relationship between the
            Independent Doctor (or Partner Hospital) and the Patient is direct, independent, and
            legally autonomous.
          </BulletItem>
          <BulletItem>
            <strong>Exclusion of Medical Negligence Claims:</strong> Fornix Labs categorically
            disclaims any and all liability for medical malpractice, professional negligence,
            misdiagnosis, adverse pharmacological reactions, or any resulting personal injury or
            wrongful death.
          </BulletItem>
          <BulletItem>
            <strong>Direction of Litigious Action:</strong> Any legal action, writ of summons, or
            claim for damages regarding a breach of the standard of care must be instituted
            exclusively against the specific Healthcare Provider or their insuring entity, and never
            against Fornix Labs.
          </BulletItem>
        </ul>
      </SubSection>
      <SubSection title="13.2. Limitation of Technical and Infrastructure Liability">
        <p className="text-foreground text-sm leading-relaxed">
          The Platform is provided on a strictly &quot;as is&quot; and &quot;as available&quot;
          basis. While the Company deploys commercial best efforts to maintain 99.9% technological
          uptime, the Company assumes no liability, either in contract or tort, for financial
          losses, business interruptions, or data delays proximately caused by:
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>(a) National Switch and Telecommunications Failures:</strong> Outages, latency,
            or catastrophic failures within the National Mobile Money Switch (GhIPSS), third-party
            payment gateways, or the national fiber-optic and telecommunications grids.
          </BulletItem>
          <BulletItem>
            <strong>(b) Reliance on Third-Party Data Integrations:</strong> Inaccuracies, delays, or
            falsifications in credentialing or insurance data transmitted via external APIs (e.g.,
            the Medical and Dental Council Registry, HeFRA databases, or the NHIA digital roster).
          </BulletItem>
        </ul>
      </SubSection>
      <SubSection title="13.3. Cap on Damages (Limitation Quantum)">
        <p className="text-foreground text-sm leading-relaxed">
          To the maximum extent permitted under Ghanaian law, in no event shall the Company&apos;s
          total, aggregate liability to You for any actionable claims arising out of or relating to
          this Agreement exceed the total amount of Platform Commissions strictly paid by You to the
          Company within the <strong>six (6) months</strong> immediately preceding the event giving
          rise to the claim. The Company expressly disclaims liability for any indirect, incidental,
          punitive, or consequential damages.
        </p>
      </SubSection>
      <SubSection title="13.4. Mutual Indemnification">
        <p className="text-foreground text-sm leading-relaxed">
          You agree to irrevocably indemnify, defend, and hold harmless Fornix Labs, its directors,
          officers, employees, and legal assigns from any third-party claims, regulatory fines,
          civil judgments, or reasonable legal fees arising directly out of Your material breach of
          this Agreement, Your violation of Ghanaian statutory law, or Your infringement of any
          third-party rights.
        </p>
      </SubSection>
    </SectionCard>

    <SectionCard
      id="tc-14"
      number="14"
      icon={Gavel}
      title="14. Governing Law, Jurisdiction, and Alternative Dispute Resolution"
    >
      <SubSection title="14.1. Exclusive Governing Law">
        <p className="text-foreground text-sm leading-relaxed">
          This Agreement, its interpretation, execution, and any non-contractual obligations arising
          out of or in connection with it, shall be governed by, construed, and enforced exclusively
          in accordance with the substantive and procedural laws of the{' '}
          <strong>Republic of Ghana</strong>, without regard to its conflict of law principles or
          the United Nations Convention on Contracts for the International Sale of Goods (CISG).
        </p>
      </SubSection>
      <SubSection title="14.2. Condition Precedent: Mandatory Good Faith Mediation">
        <p className="text-foreground text-sm leading-relaxed">
          In the event of any controversy, claim, or dispute arising out of or relating to this
          Agreement, or the breach thereof (a &quot;Dispute&quot;), the Parties expressly covenant
          to attempt to resolve the matter amicably before initiating formal adjudicative
          proceedings.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>The 30-Day Cure Period:</strong> Upon written notice of a Dispute served by one
            Party to the other, the Parties shall enter into a mandatory, confidential mediation
            period of <strong>thirty (30) calendar days</strong>.
          </BulletItem>
          <BulletItem>
            <strong>Good Faith Obligation:</strong> Both Parties shall participate in good faith
            negotiations, represented by individuals possessing the requisite authority to settle
            the Dispute. The exhaustion of this 30-day mediation period is an absolute condition
            precedent to the commencement of any arbitral proceedings.
          </BulletItem>
        </ul>
      </SubSection>
      <SubSection title="14.3. Binding Arbitration and Venue">
        <p className="text-foreground text-sm leading-relaxed">
          Should the Parties fail to achieve a negotiated settlement within the aforementioned
          30-day mediation period, the Dispute shall be exclusively and finally resolved by binding
          arbitration.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Statutory Framework:</strong> The arbitration shall be administered pursuant to
            the provisions of the{' '}
            <strong>Alternative Dispute Resolution Act, 2010 (Act 798)</strong> of the Republic of
            Ghana.
          </BulletItem>
          <BulletItem>
            <strong>Seat and Language:</strong> The juridical seat and venue of the arbitration
            shall be <strong>Accra, Greater Accra Region, Ghana</strong>. The proceedings, including
            all documentary evidence and the final award, shall be conducted entirely in the English
            language.
          </BulletItem>
          <BulletItem>
            <strong>Arbitral Tribunal:</strong> The Dispute shall be heard by a sole arbitrator
            mutually agreed upon by the Parties. If the Parties cannot agree within fourteen (14)
            days, the arbitrator shall be appointed by the Ghana Arbitration Centre. The arbitrator
            must possess demonstrable commercial and legal expertise in the intersection of
            technology, health informatics, and corporate law.
          </BulletItem>
          <BulletItem>
            <strong>Finality of Award:</strong> The arbitral award shall be in writing, state the
            reasons upon which it is based, and shall be final and legally binding upon both
            Parties. Judgment upon the award rendered by the arbitrator may be entered in any court
            of competent jurisdiction within the Republic of Ghana.
          </BulletItem>
          <BulletItem>
            <strong>Confidentiality:</strong> All arbitral proceedings, including the existence of
            the dispute, the pleadings, and the final award, shall be maintained in strict
            confidence, save as required by statutory law or for the enforcement of the award.
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    <SectionCard
      id="tc-15"
      number="15"
      icon={AlertTriangle}
      title="15. Termination, Suspension, and Post-Termination Covenants"
    >
      <SubSection title="15.1. The Company's Right of Summary Termination and Suspension">
        <p className="text-foreground text-sm leading-relaxed">
          Fornix Labs reserves the unilateral and absolute right to immediately suspend, restrict,
          or permanently terminate Your access to the Platform, the Services, and the Relational
          Health Memory, without prior notice (ex parte) or liability, under the following
          circumstances:
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>(a) Material Breach:</strong> If You commit a material breach of any covenant,
            representation, or warranty contained within this Agreement (including, but not limited
            to, the Prohibited Conduct outlined in Section 11).
          </BulletItem>
          <BulletItem>
            <strong>(b) Statutory/Regulatory Revocation:</strong> If a Healthcare Provider&apos;s
            license to practice is suspended, revoked, or struck off the register by the Medical and
            Dental Council (MDC), the Pharmacy Council, or if a Partner Hospital loses its HeFRA
            accreditation.
          </BulletItem>
          <BulletItem>
            <strong>(c) Legal Process:</strong> If the Company is compelled to do so by a lawful
            writ, subpoena, or directive from a court of competent jurisdiction, the Data Protection
            Commission, or the Ghana Police Service.
          </BulletItem>
        </ul>
      </SubSection>
      <SubSection title="15.2. Effect of Termination">
        <p className="text-foreground text-sm leading-relaxed">
          Upon the effective date of termination, all limited licenses granted to You under Section
          12 shall instantaneously cease and revert to the Company. You must immediately desist from
          any further utilization of the Platform. The Company shall owe no indemnity, severance, or
          compensation for the loss of digital real estate, GPO access, or algorithmic ranking
          consequent to a lawful termination.
        </p>
      </SubSection>
      <SubSection title="15.3. Statutory Data Portability and the 90-Day Export Covenant">
        <p className="text-foreground text-sm leading-relaxed">
          Notwithstanding the termination of access to the active clinical utilities of the
          Platform, the Company recognizes the paramount importance of continuity of care and the
          User&apos;s statutory right to data sovereignty.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Access for Extraction:</strong> In strict compliance with the data portability
            and access mandates of the Data Protection Act, 2012 (Act 843), Your encrypted medical
            records residing within the Relational Health Memory shall remain accessible in a
            restricted, &quot;read-only/export&quot; state for a contiguous period of{' '}
            <strong>ninety (90) days</strong> following the date of termination.
          </BulletItem>
          <BulletItem>
            <strong>Obligation to Migrate:</strong> This 90-day grace period is provided exclusively
            for the User or the Healthcare Provider to securely download, migrate, or port their
            longitudinal health data to an alternative, legally compliant EMR system or physical
            medium.
          </BulletItem>
          <BulletItem>
            <strong>Post-Extraction Protocol:</strong> Upon the expiration of the 90-day period, the
            Company reserves the right to cryptographically pseudonymize, archive, or irreversibly
            destroy the remaining data, strictly subject to any prevailing statutory medical record
            retention laws governing the Republic of Ghana.
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>
  </LegalLayout>
);

export default TermsAndCondition;
