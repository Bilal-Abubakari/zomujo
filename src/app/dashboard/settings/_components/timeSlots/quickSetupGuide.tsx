'use client';
import { JSX } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

const STEPS = [
  {
    title: 'Select Your Working Days',
    desc: "Choose which days you'll be available for appointments",
  },
  {
    title: 'Choose Frequency',
    desc: 'Select how often this pattern repeats (usually "Weekly")',
  },
  {
    title: 'Set Date Range',
    desc: 'Pick the dates when this availability should start and end',
  },
  { title: 'Define Working Hours', desc: 'Set your daily start and end times' },
  { title: 'Generate Slots', desc: 'Review and confirm your schedule' },
];

interface QuickSetupGuideProps {
  onClose: () => void;
}

export const QuickSetupGuide = ({ onClose }: QuickSetupGuideProps): JSX.Element => (
  <Card className="border-primary/50 bg-primary/5">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="text-primary" size={20} />
          Quick Setup Guide
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} child="Close" />
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="space-y-3 text-sm">
        {STEPS.map(({ title, desc }, i) => (
          <div key={title} className="flex gap-3">
            <span className="bg-primary text-primary-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
              {i + 1}
            </span>
            <div>
              <p className="font-medium">{title}</p>
              <p className="text-gray-600">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
