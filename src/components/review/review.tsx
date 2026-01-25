'use client';

import React, { JSX, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MODE } from '@/constants/constants';
import { IReviewRequest } from '@/types/review.interface';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { createReview } from '@/lib/features/reviews/reviewsThunk';
import { toast } from '@/hooks/use-toast';
import { ToastStatus } from '@/types/shared.enum';
import { StarRating } from '@/components/ui/starRating';
import {
  selectReviewAppointmentId,
  selectAppointmentDoctorId,
} from '@/lib/features/appointments/appointmentSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Overall rating is required').max(5),
  comment: z.string().min(1, 'Comment is required'),
  communicationSkill: z.object({
    isProfessional: z.number().min(1, 'Rating is required').max(5),
    isClear: z.number().min(1, 'Rating is required').max(5),
    isAttentive: z.number().min(1, 'Rating is required').max(5),
    isComfortable: z.number().min(1, 'Rating is required').max(5),
  }),
  expertise: z.object({
    knowledge: z.number().min(1, 'Rating is required').max(5),
    thorough: z.number().min(1, 'Rating is required').max(5),
    confidence: z.number().min(1, 'Rating is required').max(5),
    helpful: z.number().min(1, 'Rating is required').max(5),
  }),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewProps {
  onSuccess?: () => void;
}

const Review = ({ onSuccess }: ReviewProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const reviewAppointmentId = useAppSelector(selectReviewAppointmentId);
  const doctorId = useAppSelector(selectAppointmentDoctorId);

  const {
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
    register,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    mode: MODE.ON_TOUCH,
    defaultValues: {
      rating: 0,
      comment: '',
      communicationSkill: {
        isProfessional: 0,
        isClear: 0,
        isAttentive: 0,
        isComfortable: 0,
      },
      expertise: {
        knowledge: 0,
        thorough: 0,
        confidence: 0,
        helpful: 0,
      },
    },
  });

  const rating = watch('rating');
  const communicationSkill = watch('communicationSkill');
  const expertise = watch('expertise');

  const onSubmit = async (data: ReviewFormData): Promise<void> => {
    if (!doctorId || !reviewAppointmentId) {
      toast({
        title: 'Error',
        description: 'Missing required information (doctor or appointment ID)',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const reviewData: IReviewRequest = {
      ...data,
      doctorId,
      appointmentId: reviewAppointmentId,
    };

    const payload = await dispatch(createReview(reviewData)).unwrap();
    toast(payload);
    if (payload.title === ToastStatus.Success) {
      reset();
      onSuccess?.();
    }
    setIsLoading(false);
  };

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Leave a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Overall Rating */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Overall Rating *</Label>
            <StarRating
              rating={rating}
              onRatingChange={(value) => setValue('rating', value, { shouldValidate: true })}
            />
            {errors.rating && <p className="text-sm text-red-500">{errors.rating.message}</p>}
          </div>

          {/* Communication Skills */}
          <div className="space-y-4 rounded-lg border p-4">
            <Label className="text-base font-semibold">Communication Skills *</Label>
            <div className="mt-2 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Professional</Label>
                <StarRating
                  rating={communicationSkill.isProfessional}
                  onRatingChange={(value) =>
                    setValue('communicationSkill.isProfessional', value, { shouldValidate: true })
                  }
                />
              </div>
              {errors.communicationSkill?.isProfessional && (
                <p className="text-sm text-red-500">
                  {errors.communicationSkill.isProfessional.message}
                </p>
              )}

              <div className="flex items-center justify-between">
                <Label className="text-sm">Clear Communication</Label>
                <StarRating
                  rating={communicationSkill.isClear}
                  onRatingChange={(value) =>
                    setValue('communicationSkill.isClear', value, { shouldValidate: true })
                  }
                />
              </div>
              {errors.communicationSkill?.isClear && (
                <p className="text-sm text-red-500">{errors.communicationSkill.isClear.message}</p>
              )}

              <div className="flex items-center justify-between">
                <Label className="text-sm">Attentive</Label>
                <StarRating
                  rating={communicationSkill.isAttentive}
                  onRatingChange={(value) =>
                    setValue('communicationSkill.isAttentive', value, { shouldValidate: true })
                  }
                />
              </div>
              {errors.communicationSkill?.isAttentive && (
                <p className="text-sm text-red-500">
                  {errors.communicationSkill.isAttentive.message}
                </p>
              )}

              <div className="flex items-center justify-between">
                <Label className="text-sm">Comfortable</Label>
                <StarRating
                  rating={communicationSkill.isComfortable}
                  onRatingChange={(value) =>
                    setValue('communicationSkill.isComfortable', value, { shouldValidate: true })
                  }
                />
              </div>
              {errors.communicationSkill?.isComfortable && (
                <p className="text-sm text-red-500">
                  {errors.communicationSkill.isComfortable.message}
                </p>
              )}
            </div>
          </div>

          {/* Expertise */}
          <div className="space-y-4 rounded-lg border p-4">
            <Label className="text-base font-semibold">Expertise *</Label>
            <div className="mt-2 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Knowledge</Label>
                <StarRating
                  rating={expertise.knowledge}
                  onRatingChange={(value) =>
                    setValue('expertise.knowledge', value, { shouldValidate: true })
                  }
                />
              </div>
              {errors.expertise?.knowledge && (
                <p className="text-sm text-red-500">{errors.expertise.knowledge.message}</p>
              )}

              <div className="flex items-center justify-between">
                <Label className="text-sm">Thorough</Label>
                <StarRating
                  rating={expertise.thorough}
                  onRatingChange={(value) =>
                    setValue('expertise.thorough', value, { shouldValidate: true })
                  }
                />
              </div>
              {errors.expertise?.thorough && (
                <p className="text-sm text-red-500">{errors.expertise.thorough.message}</p>
              )}

              <div className="flex items-center justify-between">
                <Label className="text-sm">Confidence</Label>
                <StarRating
                  rating={expertise.confidence}
                  onRatingChange={(value) =>
                    setValue('expertise.confidence', value, { shouldValidate: true })
                  }
                />
              </div>
              {errors.expertise?.confidence && (
                <p className="text-sm text-red-500">{errors.expertise.confidence.message}</p>
              )}

              <div className="flex items-center justify-between">
                <Label className="text-sm">Helpful</Label>
                <StarRating
                  rating={expertise.helpful}
                  onRatingChange={(value) =>
                    setValue('expertise.helpful', value, { shouldValidate: true })
                  }
                />
              </div>
              {errors.expertise?.helpful && (
                <p className="text-sm text-red-500">{errors.expertise.helpful.message}</p>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Textarea
              placeholder="Share your experience..."
              className="min-h-[120px] resize-none"
              labelName="Comment *"
              error={errors.comment?.message || ''}
              {...register('comment')}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isLoading}
              child="Reset"
            />
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              isLoading={isLoading}
              child="Submit Review"
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default Review;
