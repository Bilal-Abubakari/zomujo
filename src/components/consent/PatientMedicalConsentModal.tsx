'use client';

import { JSX } from 'react';
import {
  ShieldCheck,
  FileText,
  FlaskConical,
  Pill,
  Stethoscope,
  Scan,
  GitMerge,
  Scale,
} from 'lucide-react';
import { BRANDING } from '@/constants/branding.constant';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface DataItemRowProps {
  icon: JSX.Element;
  title: string;
  description: string;
}

const DataItemRow = ({ icon, title, description }: DataItemRowProps): JSX.Element => (
  <div className="flex items-start gap-3">
    <div className="bg-primary/10 text-primary mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
    </div>
  </div>
);

interface PatientMedicalConsentModalProps {
  open: boolean;
  onConsent: () => void;
  doctorName?: string;
}

const PatientMedicalConsentModal = ({
  open,
  onConsent,
  doctorName,
}: PatientMedicalConsentModalProps): JSX.Element => (
  <Dialog
    open={open}
    // Non-dismissible: patient must actively consent to proceed
    onOpenChange={() => undefined}
  >
    <DialogContent
      className="max-h-[92vh] overflow-y-auto sm:max-w-lg"
      // Prevent the default X-button from appearing so the modal is non-dismissible
      showClose={false}
    >
      <DialogHeader>
        <div className="bg-primary/10 mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full">
          <ShieldCheck className="text-primary h-7 w-7" />
        </div>
        <DialogTitle className="text-center text-lg">Informed Consent for Consultation</DialogTitle>
        <DialogDescription className="text-center text-xs leading-relaxed">
          Before your consultation{doctorName ? ` with Dr. ${doctorName}` : ''} begins, please
          review the information below and give your informed consent for the recording of your
          medical data.
        </DialogDescription>
      </DialogHeader>

      {/* Legal badges */}
      <div className="flex flex-wrap justify-center gap-2">
        <Badge variant="secondary" className="text-xs">
          <Scale className="mr-1 h-3 w-3" /> Act 843 (Ghana)
        </Badge>
        <Badge variant="secondary" className="text-xs">
          <ShieldCheck className="mr-1 h-3 w-3" /> HIPAA Aligned
        </Badge>
        <Badge variant="secondary" className="text-xs">
          <ShieldCheck className="mr-1 h-3 w-3" /> GDPR Harmonized
        </Badge>
      </div>

      <Separator />

      {/* What will be recorded */}
      <div className="space-y-1">
        <p className="text-sm font-semibold">
          What your doctor may record during this consultation
        </p>
        <p className="text-muted-foreground text-xs">
          All data is processed in accordance with our{' '}
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-2 hover:underline"
          >
            Privacy &amp; Data Protection Policy
          </a>
          {''}.
        </p>
      </div>

      <div className="space-y-3">
        <DataItemRow
          icon={<Stethoscope className="h-3.5 w-3.5" />}
          title="Symptoms &amp; Chief Complaints"
          description="A description of your current symptoms, duration, severity, and related history."
        />
        <DataItemRow
          icon={<FileText className="h-3.5 w-3.5" />}
          title="Medical History &amp; Notes"
          description="Past medical conditions, surgical history, allergies, family history, and doctor's clinical notes."
        />
        <DataItemRow
          icon={<Pill className="h-3.5 w-3.5" />}
          title="Diagnoses &amp; Prescriptions"
          description="Your diagnosis, prescribed medications (dosage, frequency, duration), and related instructions."
        />
        <DataItemRow
          icon={<FlaskConical className="h-3.5 w-3.5" />}
          title="Laboratory Requests"
          description="Requests for blood tests, urine analysis, cultures, or other diagnostic lab investigations."
        />
        <DataItemRow
          icon={<Scan className="h-3.5 w-3.5" />}
          title="Radiology &amp; Imaging Requests"
          description="Requests for X-rays, ultrasounds, MRI, CT scans, or other imaging investigations."
        />
        <DataItemRow
          icon={<GitMerge className="h-3.5 w-3.5" />}
          title="Referrals &amp; Follow-Up Plans"
          description="Referrals to specialists or other healthcare facilities, and post-consultation follow-up plans."
        />
      </div>

      <Separator />

      {/* Rights */}
      <div className="bg-muted/50 rounded-lg p-3 text-xs leading-relaxed text-gray-600">
        <p className="mb-1 font-semibold text-gray-800">Your Rights</p>
        <p>
          Under the <strong>Data Protection Act, 2012 (Act 843)</strong> of Ghana and harmonised
          GDPR principles, you have the right to access, correct, or request deletion of your health
          data at any time. Contact our Data Protection Officer at{' '}
          <a
            href={`mailto:${BRANDING.DPO_EMAIL}`}
            className="text-primary underline-offset-2 hover:underline"
          >
            {BRANDING.DPO_EMAIL}
          </a>
          {''}.
        </p>
        <p className="mt-1">
          Your data is stored securely, accessible only to authorised healthcare professionals
          involved in your care, and is never sold or shared with advertisers.
        </p>
      </div>

      <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
        <Button
          onClick={onConsent}
          className="w-full"
          child={
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />I Understand &amp; Give My Consent
            </span>
          }
        />
        <p className="text-muted-foreground text-center text-xs">
          By clicking above you confirm you have read and understood how your data will be used
          during this consultation.
        </p>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default PatientMedicalConsentModal;
