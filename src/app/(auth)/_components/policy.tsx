'use client';

import {
  Shield,
  Lock,
  Users,
  FileText,
  Database,
  Globe,
  Clock,
  Mail,
  Phone,
  Scale,
  Fingerprint,
  Baby,
  Bot,
  Building2,
  Stethoscope,
  Pill,
  FlaskConical,
  Scan,
  GitMerge,
} from 'lucide-react';
import { JSX } from 'react';
import { BRANDING } from '@/constants/branding.constant';
import { Button } from '@/components/ui/button';
import { LegalLayout, LegalSection, SectionCard, SubSection, BulletItem } from './LegalLayout';
import { Separator } from '@/components/ui/separator';

const LAST_UPDATED = new Date('2026-03-19');

const sections: LegalSection[] = [
  {
    id: 'section-1',
    title: '1. Introduction & Statutory Registration',
    icon: FileText,
    number: '01',
  },
  { id: 'section-2', title: '2. Taxonomic Classification of Data', icon: Database, number: '02' },
  { id: 'section-3', title: '3. Lawful Basis for Processing', icon: Scale, number: '03' },
  { id: 'section-4', title: '4. Relational Health Memory', icon: Lock, number: '04' },
  { id: 'section-5', title: '5. Third-Party Disclosures', icon: Users, number: '05' },
  { id: 'section-6', title: '6. Cross-Border Transfers', icon: Globe, number: '06' },
  { id: 'section-7', title: '7. Data Retention', icon: Clock, number: '07' },
  { id: 'section-8', title: '8. Data Subject Rights', icon: Shield, number: '08' },
  { id: 'section-9', title: '9. AI & Digital Tracking', icon: Bot, number: '09' },
  { id: 'section-10', title: '10. Security & Incident Response', icon: Fingerprint, number: '10' },
  { id: 'section-11', title: '11. Pediatric Data', icon: Baby, number: '11' },
  { id: 'section-12', title: '12. Dispute Resolution', icon: Scale, number: '12' },
  {
    id: 'section-13',
    title: '13. Patient Consultation Data Recording',
    icon: FileText,
    number: '13',
  },
];

const Policy = (): JSX.Element => (
  <LegalLayout
    title="Comprehensive Privacy & Data Protection Policy"
    description={
      <p>
        Fornix Labs Limited is formally registered as a Data Controller under the Data Protection
        Act, 2012 (Act 843) of the Republic of Ghana. Your privacy is our fiduciary duty.
      </p>
    }
    sections={sections}
    lastUpdated={LAST_UPDATED}
    heroIcon={Shield}
    heroBadges={[
      { icon: Shield, label: 'GDPR Harmonized' },
      { icon: Lock, label: 'HIPAA Aligned' },
      { icon: Scale, label: 'Act 843 Compliant' },
    ]}
    contactEmail={BRANDING.DPO_EMAIL}
    contactLabel="Contact DPO"
    footerTitle="Have privacy questions?"
    footerDescription="Our Data Protection Officer is here to assist you with any privacy concerns or to exercise your data subject rights."
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
            <a href={`tel:${BRANDING.CONTACT_PHONE}`} className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> Call Us
            </a>
          }
        />
      </>
    }
  >
    {/* ── SECTION 1 ── */}
    <SectionCard
      id="section-1"
      number="01"
      icon={FileText}
      title="1. Introduction, Scope of Application, and Statutory Registration"
    >
      <SubSection title="1.1. Corporate Identity and Statutory Designation">
        <p className="text-foreground text-sm leading-relaxed">
          This Comprehensive Privacy and Data Protection Policy (the &quot;Privacy Policy&quot; or
          &quot;Policy&quot;) is formally promulgated by <strong>Fornix Labs Limited</strong> (the
          &quot;Company,&quot; &quot;We,&quot; &quot;Us,&quot; or &quot;Our&quot;). For the purposes
          of rigorous statutory interpretation under the Data Protection Act, 2012 (Act 843) of the
          Republic of Ghana:
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Data Controller:</strong> The Company legally acts in the capacity of a
            &quot;Data Controller&quot; when it determines the purposes and the technological means
            of collecting, storing, and processing the personal data and sensitive health
            informatics of Users (hereinafter &quot;Data Subjects&quot;) within the proprietary
            ecosystem of Fornix Link.
          </BulletItem>
          <BulletItem>
            <strong>Data Processor:</strong> In specific contractual matrices where the Company
            provisions digital infrastructure (Software-as-a-Service) strictly for the internal,
            localized operational utility of a Partner Hospital or an institutional Healthcare
            Provider—and does not independently determine the clinical purpose of the data
            processing—the Company operates strictly as a &quot;Data Processor&quot; acting upon the
            documented, lawful instructions of said Provider.
          </BulletItem>
        </ul>
      </SubSection>

      <SubSection title="1.2. Jurisdictional Anchor and International Harmonization">
        <p className="text-foreground text-sm leading-relaxed">
          This Policy is fundamentally anchored in, and governed exclusively by, the substantive
          data privacy laws of the Republic of Ghana, specifically the{' '}
          <strong>Data Protection Act, 2012 (Act 843)</strong>, the{' '}
          <strong>Electronic Transactions Act, 2008 (Act 772)</strong>, and the regulatory
          enforcement mandates governed by the <strong>Data Protection Commission (DPC)</strong>.
          Furthermore, to facilitate structural interoperability with global health organizations,
          international reinsurers, and transnational clinical entities, the architectural framework
          of this Policy is voluntarily harmonized with the foundational data processing principles
          established by the <strong>General Data Protection Regulation (GDPR)</strong> of the
          European Union and the{' '}
          <strong>Health Insurance Portability and Accountability Act (HIPAA)</strong> of the United
          States.
        </p>
      </SubSection>

      <SubSection title="1.3. Scope of Extraterritorial and Digital Application">
        <p className="text-foreground text-sm leading-relaxed">
          This Privacy Policy exercises universal application over all classifications of personal
          data, cryptographic biometric identifiers, and sensitive longitudinal health informatics
          collected, processed, encrypted, or transmitted across the entirety of the Company&apos;s
          technological portfolio. This uncompromising scope encompasses:
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            The Fornix Link web applications, mobile platforms, and integrated Application
            Programming Interfaces (APIs).
          </BulletItem>
          <BulletItem>
            The proprietary, AES-256 encrypted &quot;Relational Health Memory&quot; architecture.
          </BulletItem>
          <BulletItem>
            The Group Purchasing Organization (GPO) collective bargaining and supply chain networks.
          </BulletItem>
          <BulletItem>
            The physical, localized technological infrastructure deployed within HeFRA-licensed
            &quot;Fornix Guild Houses.&quot;
          </BulletItem>
        </ul>
        <p className="text-foreground mt-2 text-sm leading-relaxed">
          By authenticating into the Platform or executing a digital booking, the User, the
          Healthcare Provider, or their lawfully appointed proxies unequivocally acknowledge and
          submit to the rigorous data governance protocols codified herein.
        </p>
      </SubSection>

      <SubSection title="1.4. Statutory Registration and Fiduciary Covenant">
        <p className="text-foreground text-sm leading-relaxed">
          The Company expressly represents, warrants, and publicly records that it is duly
          registered, certified, and recognized as a Data Controller in impeccable standing with the{' '}
          <strong>Data Protection Commission (DPC) of Ghana</strong>. The Company strictly covenants
          to maintain this statutory registration, subject its algorithmic architecture to periodic
          regulatory audits, and uncompromisingly execute its fiduciary duty to protect the
          fundamental, constitutional right to privacy of every Data Subject within its digital
          jurisdiction.
        </p>
      </SubSection>
    </SectionCard>

    {/* ── SECTION 2 ── */}
    <SectionCard
      id="section-2"
      number="02"
      icon={Database}
      title="2. Taxonomic Classification of Data Collected"
    >
      <p className="text-foreground text-sm leading-relaxed">
        To ensure absolute regulatory transparency and to strictly satisfy the disclosure and
        processing mandates of the Data Protection Commission, the Company enforces a rigid
        taxonomic classification of all data ingested, processed, or generated within the Fornix
        Link ecosystem. This data is legally bifurcated into the following distinct categories:
      </p>

      <SubSection title="2.1. Standard Personally Identifiable Information (PII)">
        <p className="text-foreground text-sm leading-relaxed">
          This category encompasses the foundational identity and logistical metrics required to
          establish privity of contract, provision user accounts, and execute the core
          administrative functions of the Platform. PII includes, but is not legally limited to:
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Nomenclature and Demographics:</strong> Legal names, chronological age, dates of
            birth, and designated biological sex or gender for the purposes of accurate clinical
            routing and actuarial matching.
          </BulletItem>
          <BulletItem>
            <strong>Telecommunications and Geolocation:</strong> Active mobile network directory
            numbers (MSISDNs), primary electronic mail addresses, and declared residential or
            geographic domicile data. This spatial data is principally utilized for proximity-based
            algorithmic matching with Partner Hospitals or Fornix Guild Houses.
          </BulletItem>
          <BulletItem>
            <strong>Statutory Cryptographic Identifiers:</strong> For Healthcare Providers, this
            explicitly mandates the collection of the alphanumeric sequence, cryptographic hash, and
            associated metadata of the National Identity Card (Ghana Card) pursuant to the National
            Identity Register Act, 2008 (Act 750). Furthermore, it includes verifiable credential
            registration numbers issued by the Medical and Dental Council (MDC), Pharmacy Council,
            or Allied Health Professions Council (AHPC).
          </BulletItem>
        </ul>
      </SubSection>

      <Separator />

      <SubSection title='2.2. Special Personal Data (The "Relational Health Memory")'>
        <p className="text-foreground text-sm leading-relaxed">
          Pursuant to the heightened statutory protections and stringent processing thresholds
          codified under <strong>Section 37 of the Data Protection Act, 2012 (Act 843)</strong>, the
          Company strictly classifies all clinical, biological, and diagnostic information as
          &quot;Special Personal Data.&quot; This data is afforded the highest echelon of
          cryptographic isolation and encompasses:
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Longitudinal Health Informatics:</strong> Historical and active medical records,
            pharmacological histories, diagnostic imaging reports, immunization registries, and
            physician-authored clinical notes.
          </BulletItem>
          <BulletItem>
            <strong>Telemetric and Physiological Data:</strong> Vital signs, anthropometric
            measurements, and symptomatic data manually inputted by the User or captured via API
            integrations with validated wearable diagnostic devices.
          </BulletItem>
          <BulletItem>
            <strong>Biometric Authentication Data:</strong> Encrypted biometric hashes utilized
            specifically and exclusively for integration with the National Health Insurance
            Authority&apos;s (NHIA) Biometric Membership Authentication System (BMAS) prior to the
            dispensation of covered care.
          </BulletItem>
        </ul>
      </SubSection>

      <Separator />

      <SubSection title="2.3. Financial, Commercial, and Escrow Telemetry">
        <p className="text-foreground text-sm leading-relaxed">
          To facilitate the economic viability of the Platform, administer the mandatory Platform
          Commission, and execute the Group Purchasing Organization (GPO) supply chain architecture,
          the Company necessarily processes specific financial metadata:
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Transactional Routing Data:</strong> Mobile Money (MoMo) routing identifiers,
            Mobile Money Network Operator metadata (e.g., MTN, Telecel, AT), and cryptographically
            tokenized references for interoperable card networks.
          </BulletItem>
          <BulletItem>
            <strong>Escrow and Settlement Ledgers:</strong> Granular audit logs detailing the
            remittance of Financial Assurance Deposits, digital escrow states, and the chronological
            sequencing of disbursement receipts to Provider wallets.
          </BulletItem>
          <BulletItem>
            <strong>Statutory Tax and Insurance Data:</strong> Digital Value Added Tax (VAT)
            receipts generated via mandatory integration with the GRA Virtual Sales Data Controller
            (VSDC), as well as private Health Maintenance Organization (HMO) policy numbers and
            benefit limits necessary to power the algorithmic &quot;Insurance Matcher&quot; utility.
          </BulletItem>
          <BulletItem>
            <strong>PCI-DSS Disclaimer:</strong> The Company categorically does not collect, store,
            or process raw, unhashed Primary Account Numbers (PAN) or Card Verification Values
            (CVV). All highly sensitive financial clearing data is passed instantaneously via
            encrypted conduits to our licensed, PCI-DSS compliant Payment Service Providers (PSPs).
          </BulletItem>
        </ul>
      </SubSection>

      <Separator />

      <SubSection title="2.4. Algorithmic, Ephemeral, and System Telemetry Data">
        <p className="text-foreground text-sm leading-relaxed">
          To continuously optimize the Platform&apos;s infrastructure, defend against
          cyber-intrusions, and power the proprietary algorithmic &quot;Trust Engine,&quot; the
          Company automatically harvests specific technical telemetry:
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Device and Network Diagnostics:</strong> Internet Protocol (IP) addresses, Media
            Access Control (MAC) addresses, browser user-agents, operating system versions, and
            localized time-zone data.
          </BulletItem>
          <BulletItem>
            <strong>Algorithmic Interaction Logs:</strong> Heuristic data tracking User journey
            mapping, search query syntax, and UI/UX engagement metrics to detect fraudulent
            &quot;ghost bookings&quot; or algorithmic manipulation.
          </BulletItem>
          <BulletItem>
            <strong>Telemedicine Metadata (Strictly Non-Clinical):</strong> Call duration,
            timestamps of connection and disconnection, routing node pathways, and bandwidth
            utilization.
          </BulletItem>
          <BulletItem>
            <strong>The Ephemeral Guarantee:</strong> As unequivocally stipulated in the Terms of
            Use, the actual audio and video data streams generated during virtual consultations are
            strictly ephemerally routed via secure WebRTC protocols. They are structurally immune
            from being recorded, transcribed, or archived by the Company absent the explicit,
            mutually recorded verbal consent mandated under the Electronic Transactions Act, 2008
            (Act 772).
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    {/* ── SECTION 3 ── */}
    <SectionCard
      id="section-3"
      number="03"
      icon={Scale}
      title="3. Lawful Basis for Processing and Statutory Justification"
    >
      <p className="text-foreground text-sm leading-relaxed">
        To strictly satisfy the legality mandates enshrined within{' '}
        <strong>Section 18 of the Data Protection Act, 2012 (Act 843)</strong>, the Company strictly
        processes the aforementioned data categories predicated upon one or more of the following
        legally cognizable bases:
      </p>

      <SubSection title="3.1. Explicit and Informed Consent (The Primary Directive for Health Data)">
        <p className="text-foreground text-sm leading-relaxed">
          The processing, storage, and transmission of all Special Personal Data (including the
          Relational Health Memory and biometric identifiers) is strictly anchored upon the
          User&apos;s explicit, freely given, specific, and informed digital consent.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Revocability:</strong> The Data Subject retains the absolute statutory right to
            withdraw this consent at any juncture. However, the User acknowledges that the
            revocation of consent regarding Special Personal Data will instantaneously render the
            clinical and telemedicine utilities of the Platform technically inoperable for that
            specific User.
          </BulletItem>
        </ul>
      </SubSection>

      <SubSection title="3.2. Contractual Necessity and Execution">
        <p className="text-foreground text-sm leading-relaxed">
          The ingestion and processing of Standard PII and Financial Telemetry are strictly
          necessary for the execution and performance of the legally binding Terms of Use to which
          the User or Healthcare Provider is a party. This includes:
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            Provisioning user accounts and verifying professional credentials.
          </BulletItem>
          <BulletItem>
            Executing digital scheduling, algorithmic routing, and capacity management.
          </BulletItem>
          <BulletItem>
            Facilitating collective bargaining and procurement via the GPO marketplace.
          </BulletItem>
        </ul>
      </SubSection>

      <SubSection title="3.3. Statutory and Regulatory Legal Obligations">
        <p className="text-foreground text-sm leading-relaxed">
          The Company is compelled by superior statutory law to process and retain specific
          datasets, superseding the immediate consent of the Data Subject. This includes:
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Fiscal Compliance:</strong> Retaining transactional ledgers and digital VAT
            receipts to satisfy the audit mandates of the Ghana Revenue Authority (GRA) under the
            Value Added Tax Act, 2025.
          </BulletItem>
          <BulletItem>
            <strong>Clinical Credentialing:</strong> Logging and retaining the verified credential
            numbers and audit trails of Independent Doctors to comply with the investigative
            mandates of the Medical and Dental Council (MDC) and the Health Facilities Regulatory
            Agency (HeFRA).
          </BulletItem>
        </ul>
      </SubSection>

      <SubSection title="3.4. Legitimate Corporate Interests (Proportionality Doctrine)">
        <p className="text-foreground text-sm leading-relaxed">
          The Company processes specific subsets of Algorithmic and System Telemetry based on its
          legitimate commercial and security interests, provided such interests are not overridden
          by the fundamental privacy rights of the Data Subject. These interests are strictly
          confined to:
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            Deploying cybersecurity countermeasures against algorithmic manipulation, DDoS attacks,
            and unauthorized network intrusions.
          </BulletItem>
          <BulletItem>
            Optimizing the latency and operational efficiency of the Platform&apos;s infrastructure.
          </BulletItem>
          <BulletItem>
            Operating the &quot;Trust Engine&quot; to ensure the qualitative integrity of the
            clinical marketplace.
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    {/* ── SECTION 4 ── */}
    <SectionCard
      id="section-4"
      number="04"
      icon={Lock}
      title='4. Clinical Data Governance: The "Relational Health Memory"'
    >
      <SubSection title="4.1. The Zero-Knowledge Architectural Paradigm">
        <p className="text-foreground text-sm leading-relaxed">
          The &quot;Relational Health Memory&quot; is engineered upon a foundational
          &quot;zero-knowledge&quot; architectural principle.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Cryptographic Isolation:</strong> All longitudinal health informatics,
            diagnostic imaging, and physician notes are encrypted at rest using Advanced Encryption
            Standard with a 256-bit key size (AES-256).
          </BulletItem>
          <BulletItem>
            <strong>Custodian Limitation:</strong> Fornix Labs acts exclusively as the secure
            cryptographic custodian. The Company&apos;s administrative personnel, database
            administrators, and executive officers do not possess the decryption keys necessary to
            parse, read, or commercially exploit an individual Patient&apos;s medical history.
          </BulletItem>
        </ul>
      </SubSection>

      <SubSection title='4.2. Time-Bound "Consent Grants" and Access Control'>
        <p className="text-foreground text-sm leading-relaxed">
          The legal premise of the Platform is absolute Patient data sovereignty. No Healthcare
          Provider may query, view, or append data to a Patient&apos;s Relational Health Memory by
          default.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>The Grant Mechanism:</strong> Access is strictly mediated via a digital
            &quot;Consent Grant&quot; executed by the Patient. This grant cryptographically
            provisions the specific Independent Doctor or Partner Hospital with temporary decryption
            access.
          </BulletItem>
          <BulletItem>
            <strong>Temporal Expiration:</strong> All Consent Grants are strictly time-bound (e.g.,
            active only for the 24-hour window surrounding a scheduled consultation) and
            automatically expire, instantaneously revoking the Provider&apos;s access to the
            historical longitudinal record.
          </BulletItem>
        </ul>
      </SubSection>

      <SubSection title="4.3. Virtual Care and Telemedicine Privacy Protocols">
        <p className="text-foreground text-sm leading-relaxed">
          In addition to the ephemeral routing protocols outlined in Section 2.4, the Platform
          deploys peer-to-peer (P2P) WebRTC encryption for all synchronous audio-visual Telemedicine
          encounters. This ensures that the clinical dialogue between the Patient and the
          Independent Doctor is end-to-end encrypted (E2EE) and immune to middlebox interception or
          unauthorized packet sniffing by the Company or third-party telecommunications networks.
        </p>
      </SubSection>

      <SubSection title='4.4. Artificial Intelligence (AI) and the "Human-in-the-Loop" Mandate'>
        <p className="text-foreground text-sm leading-relaxed">
          Where the Platform utilizes Large Language Models (LLMs) or algorithmic heuristics to
          synthesize, chronologically order, or summarize a Patient&apos;s historical data for the
          rapid administrative review of an Independent Doctor:
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Ephemeral Processing:</strong> The AI processing occurs within a secure,
            ephemeral enclave. The AI models do not retain the Patient&apos;s Special Personal Data
            for subsequent model training or algorithmic reinforcement.
          </BulletItem>
          <BulletItem>
            <strong>Diagnostic Prohibition:</strong> The AI outputs are strictly legally classified
            as administrative decision-support tools. They are structurally prohibited from
            generating autonomous diagnostic conclusions, ensuring absolute compliance with the
            &quot;Human-in-the-Loop&quot; (HITL) clinical oversight mandates.
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    {/* ── SECTION 5 ── */}
    <SectionCard
      id="section-5"
      number="05"
      icon={Users}
      title="5. Authorized Third-Party Disclosures and Data Syndication"
    >
      <p className="text-foreground text-sm leading-relaxed">
        The Company fundamentally operates upon the principle of data minimization and strict
        non-disclosure. We categorically do not sell, rent, or indiscriminately syndicate standard
        PII or Special Personal Data to unauthorized third-party data brokers or marketing
        conglomerates. Disclosures are strictly compartmentalized and executed solely under the
        following operational and legal mandates:
      </p>

      <SubSection title='5.1. Clinical Interoperability (The "Consent Grant" Execution)'>
        <p className="text-foreground text-sm leading-relaxed">
          The primary mechanism for the disclosure of Special Personal Data (specifically, the
          Relational Health Memory) is executed intrinsically through the Platform&apos;s
          architecture to facilitate clinical care.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Patient-Directed Syndication:</strong> Data is disclosed to a specific
            Independent Doctor, Partner Hospital, or Fornix Guild House exclusively when the User
            actively executes a time-bound &quot;Consent Grant&quot; in anticipation of, or during,
            a clinical encounter.
          </BulletItem>
          <BulletItem>
            <strong>Limitation of Scope:</strong> The Healthcare Provider receiving this data
            operates strictly as an independent Data Controller regarding their clinical use of the
            information and is legally bound by the professional confidentiality dictates of the
            Medical and Dental Council (MDC).
          </BulletItem>
        </ul>
      </SubSection>

      <SubSection title='5.2. The GPO Ecosystem and "Just-In-Time" (JIT) Anonymization'>
        <p className="text-foreground text-sm leading-relaxed">
          To power the collective bargaining utility of the Group Purchasing Organization (GPO) and
          facilitate efficient, Just-In-Time (JIT) medical inventory management across the provider
          network, the Company must interface with third-party pharmaceutical and medical consumable
          suppliers.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Cryptographic Aggregation:</strong> All data syndicated to the GPO marketplace
            or external suppliers is rigorously aggregated, mathematically obfuscated, and
            cryptographically anonymized.
          </BulletItem>
          <BulletItem>
            <strong>Absolute PII Firewall:</strong> Suppliers receive macro-level procurement volume
            telemetry and inventory forecasting algorithms. Under no circumstances is patient-level
            Special Personal Data, clinical diagnoses, or identifying PII ever exposed to the supply
            chain.
          </BulletItem>
        </ul>
      </SubSection>

      <SubSection title="5.3. Actuarial and Insurance Routing (APIs)">
        <p className="text-foreground text-sm leading-relaxed">
          To execute the algorithmic &quot;Insurance Matcher&quot; and facilitate seamless benefit
          verification, the Company transmits highly restricted, pre-authorized data packets to
          statutory and private insurers.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>NHIA Integration:</strong> For Users invoking public benefits, encrypted
            biometric hashes and basic demographic identifiers are transmitted directly to the
            National Health Insurance Authority&apos;s (NHIA) Biometric Membership Authentication
            System (BMAS).
          </BulletItem>
          <BulletItem>
            <strong>Private HMOs:</strong> For commercial insurance, policy numbers and procedure
            codes are transmitted via secure APIs to regulated Health Maintenance Organizations to
            confirm active coverage and benefit thresholds prior to the clinical encounter.
          </BulletItem>
        </ul>
      </SubSection>

      <SubSection title='5.4. Statutory Subpoenas, Law Enforcement, and "The Shield Clause"'>
        <p className="text-foreground text-sm leading-relaxed">
          The Company recognizes its civic duty but fiercely protects the constitutional privacy
          rights of its Users against unwarranted state intrusion.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Strict Legal Threshold:</strong> Fornix Labs will not voluntarily surrender PII,
            financial ledgers, or the Relational Health Memory to any law enforcement agency,
            including the Criminal Investigations Department (CID) or the Economic and Organised
            Crime Office (EOCO), absent a formally executed, judicially binding warrant or subpoena
            issued by a Ghanaian Court of competent jurisdiction.
          </BulletItem>
          <BulletItem>
            <strong>Notification Precedent:</strong> Unless explicitly gagged by a lawful court
            order, the Company covenants to deploy commercial best efforts to notify the affected
            Data Subject of the legal demand prior to the surrender of any digital assets, affording
            the User the opportunity to seek independent legal quashal.
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    {/* ── SECTION 6 ── */}
    <SectionCard
      id="section-6"
      number="06"
      icon={Globe}
      title="6. Cross-Border Data Transfers and Cloud Sovereignty"
    >
      <SubSection title="6.1. Trans-National Cloud Infrastructure">
        <p className="text-foreground text-sm leading-relaxed">
          To guarantee 99.9% uptime, algorithmic redundancy, and military-grade disaster recovery,
          the Fornix Link ecosystem is deployed across decentralized, Tier-4 hyper-scale cloud
          environments (e.g., Amazon Web Services, Google Cloud Platform). Consequently, User data
          may be routed, processed, or backed up on server clusters physically domiciled outside the
          sovereign borders of the Republic of Ghana.
        </p>
      </SubSection>

      <SubSection title="6.2. Act 843 Trans-Border Adequacy Compliance">
        <p className="text-foreground text-sm leading-relaxed">
          The Company executes all cross-border data transfers in uncompromising adherence to the
          restrictive mandates of{' '}
          <strong>Section 17 and Section 73 of the Data Protection Act, 2012 (Act 843)</strong> .
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Adequacy Doctrine:</strong> The Company warrants that any foreign jurisdiction
            hosting Fornix Labs&apos; server instances possesses domestic data protection
            architectures formally recognized by the Data Protection Commission (DPC) as adequate
            and commensurate with Ghanaian law.
          </BulletItem>
          <BulletItem>
            <strong>Standard Contractual Clauses (SCCs):</strong> Where data must transit through
            jurisdictions lacking formal DPC adequacy rulings, the Company enforces stringent
            Standard Contractual Clauses (SCCs) and Data Processing Agreements (DPAs) with its cloud
            infrastructure providers. These legally bind the foreign processor to Ghanaian privacy
            standards and mandate continuous AES-256 encryption at rest and TLS 1.3 encryption in
            transit, ensuring the data remains cryptographically impenetrable to foreign sovereign
            entities.
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    {/* ── SECTION 7 ── */}
    <SectionCard
      id="section-7"
      number="07"
      icon={Clock}
      title="7. Data Retention, Archival Protocols, and Statutory Minimums"
    >
      <SubSection title="7.1. The Principle of Retention Limitation">
        <p className="text-foreground text-sm leading-relaxed">
          In strict adherence to the data minimization and retention limitation principles codified
          within the Data Protection Act, 2012 (Act 843), the Company covenants to retain Standard
          Personally Identifiable Information (PII) and Special Personal Data only for the
          contiguous duration necessary to fulfill the operational, clinical, and commercial
          purposes explicitly outlined in this Policy, or as otherwise rigidly mandated by superior
          statutory law.
        </p>
      </SubSection>

      <SubSection title="7.2. Active Account and Platform Utility Retention">
        <p className="text-foreground text-sm leading-relaxed">
          During the lifecycle of an active User or Healthcare Provider account, the Relational
          Health Memory and associated demographic telemetry shall be continuously retained to
          facilitate seamless longitudinal care, algorithmic routing, and the execution of the Group
          Purchasing Organization (GPO) supply chain mechanics.
        </p>
      </SubSection>

      <SubSection title="7.3. Post-Termination and The 90-Day Statutory Export Window">
        <p className="text-foreground text-sm leading-relaxed">
          Upon the formalized termination, suspension, or voluntary deactivation of a User&apos;s
          account—and aligning with the stipulations of the Terms of Use—the Company initiates a
          legally mandated archival protocol:
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>The Export Grace Period:</strong> The User&apos;s encrypted Relational Health
            Memory shall be securely transitioned into a restricted, &quot;read-only&quot; archival
            state. This data shall remain accessible exclusively for the purpose of secure digital
            export and data portability for a contiguous, non-extendable period of{' '}
            <strong>ninety (90) calendar days</strong>.
          </BulletItem>
          <BulletItem>
            <strong>Irreversible Cryptographic Destruction:</strong> Upon the absolute expiration of
            this 90-day grace period, the Company shall execute automated, irreversible
            cryptographic shredding (digital obliteration) of the User&apos;s PII and digital
            footprint from the active Fornix Link server clusters, subject only to the overriding
            clinical retention exemptions detailed in Section 7.4.
          </BulletItem>
        </ul>
      </SubSection>

      <SubSection title="7.4. The Clinical Exemption: Medical Record Statutory Minimums">
        <p className="text-foreground text-sm leading-relaxed">
          The User and the Healthcare Provider expressly acknowledge a fundamental intersection of
          law: a Patient&apos;s right to digital erasure does not supersede a medical
          practitioner&apos;s statutory and ethical duty to maintain clinical records.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>MDC and HeFRA Mandates:</strong> Independent Doctors and Partner Hospitals are
            legally bound by the Medical and Dental Council (MDC) and the Health Facilities
            Regulatory Agency (HeFRA) to retain patient medical records, diagnostic imaging, and
            pharmacological histories for prescribed statutory minimums (frequently extending up to{' '}
            <strong>ten years post-encounter</strong>, or until a minor reaches the age of
            majority).
          </BulletItem>
          <BulletItem>
            <strong>Severability of Deletion:</strong> Consequently, while the Company will
            obliterate the User&apos;s Fornix Link profile and PII from the general Platform
            architecture upon request, the specific Special Personal Data constituting the formal
            clinical record of a completed Telemedicine or physical encounter shall be
            pseudonymized, securely archived, and retained strictly to shield the Healthcare
            Provider against future medical malpractice litigation or regulatory audits.
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    {/* ── SECTION 8 ── */}
    <SectionCard
      id="section-8"
      number="08"
      icon={Shield}
      title="8. Fundamental Data Subject Rights and User Empowerment"
    >
      <SubSection title="8.1. Statutory Invocation of Rights (Act 843)">
        <p className="text-foreground text-sm leading-relaxed">
          The Company recognizes and empowers the Data Subject to exercise their fundamental rights
          of subject participation as enshrined under the{' '}
          <strong>Data Protection Act, 2012 (Act 843)</strong>. These rights are actionable via
          formal written request to the designated Data Protection Officer (DPO).
        </p>
      </SubSection>

      <SubSection title="8.2. The Right of Access and Cryptographic Portability">
        <p className="text-foreground text-sm leading-relaxed">
          The User retains the absolute right to query the Company regarding the nature, scope, and
          processing state of their personal data.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Interoperable Export:</strong> Upon identity verification, the User may demand
            the transmission of their Relational Health Memory in a structured, commonly used, and
            machine-readable format (e.g., HL7 FHIR or encrypted JSON) to facilitate seamless
            porting to an alternative healthcare provider or EMR infrastructure, unencumbered by
            artificial technological barriers.
          </BulletItem>
        </ul>
      </SubSection>

      <SubSection title="8.3. The Right to Rectification and Algorithmic Accuracy">
        <p className="text-foreground text-sm leading-relaxed">
          The User possesses the right to mandate the immediate rectification, amendment, or
          completion of any inaccurate, obsolete, or misleading demographic or financial data held
          by the Company. (Note: Clinical diagnoses authored by an Independent Doctor cannot be
          unilaterally altered by the User; such disputes must be mediated clinically with the
          issuing practitioner).
        </p>
      </SubSection>

      <SubSection title='8.4. The Right to Erasure ("The Right to Be Forgotten")'>
        <p className="text-foreground text-sm leading-relaxed">
          Subject to the severe clinical and statutory retention exemptions delineated in Section
          7.4, the User holds the right to compel the Company to permanently erase their PII and
          dismantle their digital identity within the Fornix Labs ecosystem.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Financial Ledger Exemption:</strong> The User acknowledges that transactional
            data linked to digital VAT receipts and MoMo escrow clearances cannot be erased, as they
            must be preserved to satisfy the aggressive anti-money laundering (AML) and fiscal audit
            mandates of the Ghana Revenue Authority (GRA) and the Bank of Ghana.
          </BulletItem>
        </ul>
      </SubSection>

      <SubSection title="8.5. The Right to Withdraw Consent and Cease Processing">
        <p className="text-foreground text-sm leading-relaxed">
          Where the lawful basis for processing is predicated entirely upon explicit consent (e.g.,
          the execution of a &quot;Consent Grant&quot; for Telemedicine or access to the Relational
          Health Memory), the User may instantaneously revoke this consent.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Waiver of Utility:</strong> The User is legally put on notice that the
            revocation of such consent fundamentally cripples the Platform&apos;s ability to
            provision clinical connectivity. Upon revocation, the Company shall immediately cease
            syndicating the User&apos;s data to Healthcare Providers, effectively terminating the
            User&apos;s capacity to receive care via the Platform.
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    {/* ── SECTION 9 ── */}
    <SectionCard
      id="section-9"
      number="09"
      icon={Bot}
      title="9. Algorithmic Governance, Artificial Intelligence, and Digital Tracking"
    >
      <SubSection title='9.1. Artificial Intelligence and the "Human-in-the-Loop" (HITL) Doctrine'>
        <p className="text-foreground text-sm leading-relaxed">
          In the deployment of machine learning algorithms, Large Language Models (LLMs), or
          proprietary diagnostic routing agents (including any AI interactions designated under the
          &quot;Zyptyk&quot; cognitive architecture), the Company imposes a strict, immutable
          &quot;Human-in-the-Loop&quot; (HITL) regulatory framework.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Prohibition of Autonomous Diagnostics:</strong> The Data Subject expressly
            acknowledges that no artificial intelligence model deployed within the Fornix Link
            ecosystem is authorized, licensed, or technologically permitted to render autonomous,
            final medical diagnoses or prescribe definitive pharmacological interventions.
          </BulletItem>
          <BulletItem>
            <strong>Algorithmic Summarization:</strong> All AI-driven outputs are legally classified
            as administrative, clinical decision-support utilities designed to synthesize the
            Relational Health Memory for the exclusive review and final interpretive judgment of a
            licensed, human Independent Doctor.
          </BulletItem>
        </ul>
      </SubSection>

      <SubSection title="9.2. Protection Against Solely Automated Decision-Making">
        <p className="text-foreground text-sm leading-relaxed">
          In absolute conformity with the rights of the Data Subject under the Data Protection Act,
          2012 (Act 843), the Company warrants that no User shall be subject to a legally binding or
          clinically significant decision predicated solely upon automated processing or algorithmic
          profiling, absent the intervention and ratifying signature of a human practitioner.
        </p>
      </SubSection>

      <SubSection title="9.3. Cookie Architecture and Digital Telemetry (Act 772 Compliance)">
        <p className="text-foreground text-sm leading-relaxed">
          To facilitate the seamless operation of the Platform, the Company deploys standard web
          technologies, including HTTP cookies, web beacons, and encrypted local storage.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Strictly Necessary (Functional) Cookies:</strong> These are non-negotiable
            cryptographic tokens required to maintain active session states, execute MoMo escrow
            handshakes, and route traffic to secure server nodes. They do not require preemptive
            consent.
          </BulletItem>
          <BulletItem>
            <strong>Analytical and Performance Telemetry:</strong> The Company utilizes anonymized
            tracking to measure UI/UX latency, API response times, and algorithmic drop-off rates.
          </BulletItem>
          <BulletItem>
            <strong>Consent Banner:</strong> Pursuant to the electronic consent mandates of the
            Electronic Transactions Act, 2008 (Act 772), the User retains the right to expressly
            opt-in or opt-out of non-essential analytical cookies via the Platform&apos;s designated
            privacy dashboard.
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    {/* ── SECTION 10 ── */}
    <SectionCard
      id="section-10"
      number="10"
      icon={Fingerprint}
      title="10. Security Architecture and Statutory Incident Response"
    >
      <SubSection title="10.1. Technical and Organizational Safeguards">
        <p className="text-foreground text-sm leading-relaxed">
          The Company executes its fiduciary duty as a Data Controller by deploying military-grade
          cybersecurity architectures to insulate the Relational Health Memory against unauthorized
          exfiltration, brute-force intrusion, or internal espionage.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Access Protocols:</strong> The Company enforces strictly audited Role-Based
            Access Control (RBAC) and mandatory Multi-Factor Authentication (MFA) for all
            administrative personnel, database architects, and registered Healthcare Providers.
          </BulletItem>
          <BulletItem>
            <strong>Continuous Auditing:</strong> The Platform&apos;s perimeter defense is subjected
            to continuous, automated vulnerability scanning and bi-annual, third-party penetration
            testing (Pen-Tests) conducted by certified ethical hackers.
          </BulletItem>
        </ul>
      </SubSection>

      <SubSection title="10.2. The Statutory Breach Notification Mandate (The 72-Hour Rule)">
        <p className="text-foreground text-sm leading-relaxed">
          While the Company deploys commercial best efforts to maintain an impenetrable digital
          fortress, it operates under a legally binding, transparent incident response protocol.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Regulatory Escalation:</strong> In the event of a confirmed cryptographic
            compromise, unauthorized data exfiltration, or a material breach of the Relational
            Health Memory that poses a high risk to the fundamental rights and freedoms of the Data
            Subject, the Company covenants to formally notify the Data Protection Commission (DPC)
            within a maximum of <strong>seventy-two (72) hours</strong> of achieving definitive
            situational awareness.
          </BulletItem>
          <BulletItem>
            <strong>Victim Notification:</strong> Concurrently, and unless explicitly enjoined by a
            sovereign law enforcement gag order, the Company shall transmit encrypted, written
            notifications directly to the affected Users. This notice shall detail the vector of the
            breach, the specific taxonomy of the data compromised, and the immediate remedial
            countermeasures deployed by the Company.
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    {/* ── SECTION 11 ── */}
    <SectionCard
      id="section-11"
      number="11"
      icon={Baby}
      title="11. Pediatric Data, Guardianship, and Capacity to Consent"
    >
      <SubSection title="11.1. The Age of Majority and Contractual Voidability">
        <p className="text-foreground text-sm leading-relaxed">
          The processing of Special Personal Data concerning minors requires heightened,
          uncompromising legal scrutiny. Pursuant to the{' '}
          <strong>Contracts Act, 1960 (Act 25)</strong> and the{' '}
          <strong>Children&apos;s Act, 1998 (Act 560)</strong> of the Republic of Ghana, an
          individual chronologically under the age of <strong>eighteen (18) years</strong> lacks the
          requisite legal capacity to independently execute a valid &quot;Consent Grant&quot; or
          enter into the Platform&apos;s Terms of Use.
        </p>
      </SubSection>

      <SubSection title="11.2. Vicarious Consent and Proxy Authentication">
        <p className="text-foreground text-sm leading-relaxed">
          The Company strictly prohibits the direct, unmediated collection of data from minors.
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Guardian Mandate:</strong> The creation of a pediatric Relational Health Memory,
            and the subsequent scheduling of any clinical encounter for a minor, must be executed
            exclusively by a biologically or legally verified parent, court-appointed guardian, or
            authorized proxy possessing documented familial legal authority.
          </BulletItem>
          <BulletItem>
            <strong>Absolute Vicarious Liability:</strong> The verified adult executing the proxy
            account assumes absolute, non-delegable responsibility for the accuracy of the pediatric
            data entered and explicitly indemnifies the Company against any claims of unauthorized
            data processing arising from a misrepresentation of guardianship.
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    {/* ── SECTION 12 ── */}
    <SectionCard
      id="section-12"
      number="12"
      icon={Scale}
      title="12. Dispute Resolution, Escalation, and Regulatory Contact"
    >
      <SubSection title="12.1. The Office of the Data Protection Officer (DPO)">
        <p className="text-foreground text-sm leading-relaxed">
          To ensure continuous statutory compliance and to provide Users with a direct, legally
          accountable liaison for the invocation of their Data Subject rights, the Company has
          formally appointed a Data Protection Officer (DPO). All formal privacy inquiries, consent
          revocations, Subject Access Requests (SARs), and data portability demands must be directed
          to:
        </p>
        <div className="mt-3 space-y-2">
          <a
            href={`mailto:${BRANDING.DPO_EMAIL}`}
            className="text-primary flex items-center gap-2 text-sm font-medium hover:underline"
          >
            <Mail className="h-4 w-4" />
            <strong>Official DPO Corridor:</strong>&nbsp;{BRANDING.DPO_EMAIL}
          </a>
          <div className="flex items-start gap-2 text-sm">
            <Building2 className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
            <span className="text-foreground">
              <strong>Corporate Domicile:</strong> Fornix Labs Limited, Accra, Greater Accra Region,
              Republic of Ghana.
            </span>
          </div>
        </div>
      </SubSection>

      <SubSection title="12.2. Statutory Right of Escalation (The DPC Recourse)">
        <p className="text-foreground text-sm leading-relaxed">
          The Company covenants to address all privacy grievances in good faith, expeditiously, and
          in strict adherence to Act 843. However, should a Data Subject adjudge that the Company
          has materially failed to resolve a legitimate privacy dispute, or has engaged in the
          unlawful processing of their Special Personal Data, the Data Subject retains the absolute,
          unencumbered statutory right to escalate the grievance by lodging a formal complaint
          directly with the sovereign regulatory authority:
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>The Data Protection Commission (DPC) of the Republic of Ghana.</strong>
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>

    {/* ── SECTION 13 ── */}
    <SectionCard
      id="section-13"
      number="13"
      icon={FileText}
      title="13. Patient Consultation Data Recording"
    >
      <SubSection title="13.1. What This Section Covers">
        <p className="text-foreground text-sm leading-relaxed">
          This section is written in plain language specifically for <strong>patients</strong>. It
          explains exactly what clinical information your doctor records about you during a
          consultation on Fornix Link, why it is recorded, and how it is protected. By creating an
          account and accepting these policies you give your informed consent for this processing,
          as required under the <strong>Data Protection Act, 2012 (Act 843)</strong>.
        </p>
      </SubSection>

      <SubSection title="13.2. Clinical Data Recorded During a Consultation">
        <p className="text-foreground text-sm leading-relaxed">
          When you attend a consultation (in-person at a Fornix Guild House or virtually through the
          platform), your treating doctor may record any or all of the following categories of
          clinical data directly within your Relational Health Memory:
        </p>
        <ul className="mt-3 space-y-3">
          <BulletItem>
            <span className="flex items-start gap-2">
              <Stethoscope className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>Symptoms &amp; Chief Complaints</strong> — A description of your current
                symptoms, when they started, their severity, and any associated factors you describe
                to the doctor.
              </span>
            </span>
          </BulletItem>
          <BulletItem>
            <span className="flex items-start gap-2">
              <FileText className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>Medical History &amp; Clinical Notes</strong> — Your past medical
                conditions, surgical history, known allergies, family health history, and the
                doctor&apos;s own clinical assessment notes from the consultation.
              </span>
            </span>
          </BulletItem>
          <BulletItem>
            <span className="flex items-start gap-2">
              <Pill className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>Diagnoses &amp; Prescriptions</strong> — The diagnosis reached by your
                doctor and any medications prescribed, including the name, dosage, frequency, and
                duration of each prescription.
              </span>
            </span>
          </BulletItem>
          <BulletItem>
            <span className="flex items-start gap-2">
              <FlaskConical className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>Laboratory Investigation Requests</strong> — Requests for blood tests, urine
                analysis, microbiological cultures, or any other diagnostic laboratory
                investigations ordered by the doctor.
              </span>
            </span>
          </BulletItem>
          <BulletItem>
            <span className="flex items-start gap-2">
              <Scan className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>Radiology &amp; Imaging Requests</strong> — Requests for X-rays, ultrasound
                scans, MRI, CT scans, or other diagnostic imaging investigations ordered by the
                doctor.
              </span>
            </span>
          </BulletItem>
          <BulletItem>
            <span className="flex items-start gap-2">
              <GitMerge className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>Referrals &amp; Follow-Up Plans</strong> — Any referrals to specialist
                doctors or external healthcare facilities, and post-consultation follow-up
                instructions or scheduled review appointments.
              </span>
            </span>
          </BulletItem>
        </ul>
      </SubSection>

      <SubSection title="13.3. Purpose and Lawful Basis for Recording">
        <p className="text-foreground text-sm leading-relaxed">
          This clinical data is recorded for the following purposes, each of which has a distinct
          lawful basis under Act 843:
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Continuity of Care</strong> — So that any doctor you consult on the platform
            (with your consent) has access to your longitudinal health history, enabling safer,
            better-informed clinical decisions. <em>Lawful basis: Vital interests / healthcare.</em>
          </BulletItem>
          <BulletItem>
            <strong>Statutory Medical Records Obligation</strong> — Healthcare providers in Ghana
            are legally required to maintain accurate patient records under professional practice
            regulations. <em>Lawful basis: Legal obligation.</em>
          </BulletItem>
          <BulletItem>
            <strong>Patient Access &amp; Portability</strong> — So that you can access, download,
            and share your own records at any time.{' '}
            <em>Lawful basis: Explicit consent / data subject rights.</em>
          </BulletItem>
        </ul>
      </SubSection>

      <SubSection title="13.4. Who Can See Your Consultation Records">
        <p className="text-foreground text-sm leading-relaxed">
          Access to your consultation records is strictly controlled:
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Only the doctor who conducted the consultation</strong> can create or append
            records to that specific consultation note.
          </BulletItem>
          <BulletItem>
            Any other doctor on the platform may only access your records if you explicitly grant
            them a time-bound <strong>Consent Grant</strong> (see Section 9.3). There is no passive,
            open access to your data.
          </BulletItem>
          <BulletItem>
            Platform administrators may access records solely for the purpose of resolving technical
            disputes or responding to lawful legal process — never for commercial purposes.
          </BulletItem>
          <BulletItem>
            <strong>Your data is never sold.</strong> It is not shared with advertisers, insurers
            (without your consent), or any third party for commercial profiling.
          </BulletItem>
        </ul>
      </SubSection>

      <SubSection title="13.5. Your Rights Regarding Consultation Records">
        <p className="text-foreground text-sm leading-relaxed">
          You retain full data subject rights over your consultation records at all times:
        </p>
        <ul className="mt-2 space-y-2">
          <BulletItem>
            <strong>Right of Access</strong> — You may view and download all consultation records
            associated with your account at any time from your patient dashboard.
          </BulletItem>
          <BulletItem>
            <strong>Right of Rectification</strong> — If you believe a clinical record contains a
            factual inaccuracy, you may raise a formal dispute with the treating doctor or contact
            our Data Protection Officer at{' '}
            <a
              href={`mailto:${BRANDING.DPO_EMAIL}`}
              className="text-primary underline-offset-2 hover:underline"
            >
              {BRANDING.DPO_EMAIL}
            </a>
            {''}.
          </BulletItem>
          <BulletItem>
            <strong>Right to Erasure</strong> — Subject to statutory medical record retention
            obligations under Ghanaian law, you may request the deletion of your data. Requests are
            reviewed within 30 days.
          </BulletItem>
          <BulletItem>
            <strong>Right to Withdraw Consent</strong> — You may withdraw your consent for any
            non-essential processing at any time without affecting the lawfulness of processing
            carried out prior to withdrawal.
          </BulletItem>
        </ul>
      </SubSection>
    </SectionCard>
  </LegalLayout>
);

export default Policy;
