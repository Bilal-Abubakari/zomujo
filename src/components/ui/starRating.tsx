import React, { JSX } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  maxRating?: number;
  className?: string;
  disabled?: boolean;
}

export const StarRating = ({
  rating,
  onRatingChange,
  maxRating = 5,
  className,
  disabled = false,
}: StarRatingProps): JSX.Element => (
  <div className={cn('flex items-center gap-1', className)}>
    {Array.from({ length: maxRating }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= rating;
      return (
        <button
          key={starValue}
          type="button"
          onClick={() => !disabled && onRatingChange(starValue)}
          disabled={disabled}
          className={cn(
            'transition-colors focus:outline-none',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110',
          )}
        >
          <Star
            className={cn(
              'h-5 w-5 transition-colors',
              isFilled ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200',
            )}
          />
        </button>
      );
    })}
  </div>
);
