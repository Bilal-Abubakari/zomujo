'use client';

import { JSX } from 'react';
import { Cookie, Lock, Settings2, BarChart3, Megaphone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { type CookiePreferences } from '@/hooks/useCookieConsent';

interface CookieCategoryRowProps {
  icon: JSX.Element;
  title: string;
  description: string;
  badge?: string;
  checked: boolean;
  disabled?: boolean;
  name: string;
  onCheckedChange: (value: boolean) => void;
}

const CookieCategoryRow = ({
  icon,
  title,
  description,
  badge,
  checked,
  disabled = false,
  name,
  onCheckedChange,
}: CookieCategoryRowProps): JSX.Element => (
  <div className="flex items-start justify-between gap-4 py-4">
    <div className="flex items-start gap-3">
      <div className="bg-primary/10 text-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
        {icon}
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{title}</span>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
      </div>
    </div>
    <Switch
      name={name}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-label={`Toggle ${title} cookies`}
    />
  </div>
);

interface CookiePreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftPreferences: CookiePreferences;
  onSetPreference: (key: keyof CookiePreferences, value: boolean) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onSave: () => void;
}

const CookiePreferencesModal = ({
  open,
  onOpenChange,
  draftPreferences,
  onSetPreference,
  onAcceptAll,
  onRejectAll,
  onSave,
}: CookiePreferencesModalProps): JSX.Element => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg" showClose>
      <DialogHeader>
        <div className="bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
          <Cookie className="text-primary h-6 w-6" />
        </div>
        <DialogTitle className="text-center">Cookie Preferences</DialogTitle>
        <DialogDescription className="text-center text-xs">
          Choose which cookies you allow. Essential cookies are always active as they are required
          for the platform to function. Your preferences are saved locally and respected on every
          visit.
        </DialogDescription>
      </DialogHeader>

      <div className="divide-y">
        <CookieCategoryRow
          icon={<Lock className="h-4 w-4" />}
          title="Essential Cookies"
          description="Required for authentication, session management, security, and core platform functionality. Cannot be disabled."
          badge="Always Active"
          checked={true}
          disabled={true}
          name="essential"
          onCheckedChange={() => undefined}
        />
        <CookieCategoryRow
          icon={<Settings2 className="h-4 w-4" />}
          title="Functional Cookies"
          description="Remember your preferences such as language, UI layout, and other personalisation settings to improve your experience."
          checked={draftPreferences.functional}
          name="functional"
          onCheckedChange={(v) => onSetPreference('functional', v)}
        />
        <CookieCategoryRow
          icon={<BarChart3 className="h-4 w-4" />}
          title="Analytics Cookies"
          description="Help us understand how users interact with the platform using anonymised usage data. No personally identifiable information is shared."
          checked={draftPreferences.analytics}
          name="analytics"
          onCheckedChange={(v) => onSetPreference('analytics', v)}
        />
        <CookieCategoryRow
          icon={<Megaphone className="h-4 w-4" />}
          title="Marketing Cookies"
          description="Used to deliver relevant health information and platform updates. Currently not in use — declared for future transparency."
          checked={draftPreferences.marketing}
          name="marketing"
          onCheckedChange={(v) => onSetPreference('marketing', v)}
        />
      </div>

      <Separator />

      <p className="text-muted-foreground text-xs">
        Learn more about how we use cookies in our{' '}
        <a href="/cookie-policy" className="text-primary underline-offset-2 hover:underline">
          Cookie Policy
        </a>
        {''}.
      </p>

      <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
        <Button child="Save My Preferences" className="w-full" onClick={onSave} />
        <div className="flex gap-2">
          <Button variant="outline" child="Accept All" className="flex-1" onClick={onAcceptAll} />
          <Button variant="outline" child="Reject All" className="flex-1" onClick={onRejectAll} />
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default CookiePreferencesModal;
