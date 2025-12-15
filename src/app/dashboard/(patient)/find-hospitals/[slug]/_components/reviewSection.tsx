'use client';
import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ReviewSectionProps {
  hospitalName: string;
}

const ReviewSection = ({ hospitalName }: ReviewSectionProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a star rating before submitting.',
        variant: 'destructive',
      });
      return;
    }

    if (!reviewText.trim()) {
      toast({
        title: 'Review Required',
        description: 'Please write a review before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      toast({
        title: 'Review Submitted Successfully! ✓',
        description: `Thank you for your ${rating}-star review of ${hospitalName}. Your feedback helps others make better healthcare decisions.`,
        variant: 'success',
      });

      setRating(0);
      setReviewText('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-xl font-bold">Write a Review</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Your Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={32}
                  className={`${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-none text-gray-300'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <span className="text-sm text-gray-600">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="review" className="text-sm font-medium text-gray-700">
            Your Review
          </label>
          <textarea
            id="review"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience with this hospital... (e.g., quality of care, cleanliness, staff professionalism, wait times)"
            className="min-h-[120px] rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            maxLength={1000}
          />
          <span className="text-xs text-gray-500">{reviewText.length}/1000 characters</span>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || rating === 0 || !reviewText.trim()}
          child={isSubmitting ? 'Submitting...' : 'Submit Review'}
          className="w-fit"
        />
      </form>

      <div className="mt-8 border-t border-gray-200 pt-6">
        <h3 className="mb-4 text-lg font-semibold">Recent Reviews</h3>
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-gray-100 p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={`${star <= 5 ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">Sarah M.</span>
              <span className="text-xs text-gray-500">2 days ago</span>
            </div>
            <p className="text-sm text-gray-700">
              Excellent hospital with caring staff. The emergency department was quick and
              efficient. Highly recommend!
            </p>
          </div>

          <div className="rounded-lg border border-gray-100 p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={`${star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">John D.</span>
              <span className="text-xs text-gray-500">1 week ago</span>
            </div>
            <p className="text-sm text-gray-700">
              Good facility with modern equipment. Wait times can be a bit long during peak hours,
              but overall a positive experience.
            </p>
          </div>

          <div className="rounded-lg border border-gray-100 p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={`${star <= 5 ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">Ama K.</span>
              <span className="text-xs text-gray-500">2 weeks ago</span>
            </div>
            <p className="text-sm text-gray-700">
              Very professional doctors and nurses. Clean environment and well-organized system. The
              staff took great care of my mother.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;
