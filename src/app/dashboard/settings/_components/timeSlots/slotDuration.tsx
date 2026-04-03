'use client';
import { JSX } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SectionLabel } from './sectionLabel';

interface SlotDurationProps {
  slotDuration: number;
  onSlotDurationChange: (duration: number) => void;
}

export const SlotDuration = ({
  slotDuration,
  onSlotDurationChange,
}: SlotDurationProps): JSX.Element => (
  <div className="space-y-2">
    <SectionLabel
      title="Slot Duration (minutes):"
      detailedInfo={
        <div className="space-y-2">
          <p className="font-medium">How long should each appointment be?</p>
          <p className="text-sm">
            Currently, all appointment slots are set to <strong>45 minutes</strong>. This duration
            works well for most consultations and allows adequate time for patient interaction,
            examination, and documentation.
          </p>
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
            <p className="mb-1 text-sm font-medium text-amber-800">Why 45 minutes?</p>
            <ul className="ml-4 list-disc space-y-1 text-sm text-amber-700">
              <li>Provides sufficient time for thorough consultations</li>
              <li>Allows for patient questions and discussions</li>
              <li>Includes time for documentation between appointments</li>
              <li>Balances quality care with daily patient capacity</li>
            </ul>
          </div>
          <div className="mt-3">
            <p className="text-xs text-gray-600">
              <strong>Note:</strong> Custom durations (15, 30, or 60 minutes) will be available in a
              future update. If you need different slot durations now, please contact support.
            </p>
          </div>
        </div>
      }
      tips={[
        'With 45-minute slots from 9:00 AM to 5:00 PM, you can see up to 10 patients per day',
        'This duration is recommended by many healthcare professionals for virtual consultations',
      ]}
    />
    <Select
      value={slotDuration.toString()}
      onValueChange={(v) => onSlotDurationChange(Number.parseInt(v))}
      disabled={true}
    >
      <SelectTrigger className="cursor-not-allowed text-sm sm:text-base">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {[15, 30, 45, 60].map((duration) => (
          <SelectItem key={duration} value={duration.toString()}>
            {duration} minutes
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <p className="text-muted-foreground text-xs italic">
      Duration is currently fixed at 45 minutes for all appointments
    </p>
  </div>
);
