'use client';
import { JSX, ReactNode, useState } from 'react';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, HelpCircle, Lightbulb } from 'lucide-react';

interface SectionLabelProps {
  title: string;
  detailedInfo: string | ReactNode;
  tips?: string[];
}

export const SectionLabel = ({ title, detailedInfo, tips }: SectionLabelProps): JSX.Element => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-base font-medium">
        <span>{title}</span>
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-primary hover:text-primary/80 flex cursor-pointer items-center gap-1 text-xs font-medium transition-colors"
        >
          <HelpCircle size={14} />
          <span>{isExpanded ? 'Hide info' : 'Learn more'}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </Label>
      {isExpanded && (
        <div className="border-primary space-y-2 rounded-r-md border-l-4 bg-green-50 p-4">
          <div className="text-sm text-gray-700">
            {typeof detailedInfo === 'string' ? <p>{detailedInfo}</p> : detailedInfo}
          </div>
          {tips && tips.length > 0 && (
            <div className="mt-3 border-t border-green-200 pt-3">
              <div className="flex items-start gap-2">
                <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber-600" />
                <div className="space-y-1">
                  {tips.map((tip, idx) => (
                    <p key={`${idx}-${tip}`} className="text-xs text-gray-600">
                      {tip}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
