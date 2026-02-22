'use client';

import React, { JSX, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FieldErrors, useForm, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MODE } from '@/constants/constants';
import { IReviewRequest } from '@/types/review.interface';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { createReview } from '@/lib/features/reviews/reviewsThunk';
import { toast } from '@/hooks/use-toast';
import { Role, ToastStatus } from '@/types/shared.enum';
import { StarRating } from '@/components/ui/starRating';
import {
  selectReviewAppointmentId,
  selectAppointmentDoctorId,
} from '@/lib/features/appointments/appointmentSelector';
import { selectUserRole } from '@/lib/features/auth/authSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const patientReviewSchema = z.object({
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

const doctorReviewSchema = z.object({
  rating: z.number().min(1, 'Overall rating is required').max(5),
  comment: z.string().min(1, 'Comment is required'),
});

type PatientReviewFormData = z.infer<typeof patientReviewSchema>;
type DoctorReviewFormData = z.infer<typeof doctorReviewSchema>;
type ReviewFormData = PatientReviewFormData | DoctorReviewFormData;

interface ReviewProps {
  onSuccess?: () => void;
}

const Review = ({ onSuccess }: ReviewProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const reviewAppointmentId = useAppSelector(selectReviewAppointmentId);
  const doctorId = useAppSelector(selectAppointmentDoctorId);
  const userRole = useAppSelector(selectUserRole);

  const isDoctor = userRole === Role.Doctor;
  const schema = isDoctor ? doctorReviewSchema : patientReviewSchema;

  const {
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
    register,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(schema),
    mode: MODE.ON_TOUCH,
    defaultValues: isDoctor
      ? { rating: 0, comment: '' }
      : {
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

  const onSubmit = async (data: ReviewFormData): Promise<void> => {
    if (!doctorId || (!isDoctor && !reviewAppointmentId)) {
      toast({
        title: 'Error',
        description: 'Missing required information',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const reviewData: IReviewRequest = {
      ...data,
      doctorId,
      ...(isDoctor ? {} : { appointmentId: reviewAppointmentId }),
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
        <CardTitle className="text-2xl font-bold">
          {isDoctor ? 'Platform Feedback' : 'Leave a Review'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Overall Rating *</Label>
            <StarRating
              rating={rating}
              onRatingChange={(value) => setValue('rating', value, { shouldValidate: true })}
            />
            {errors.rating && <p className="text-sm text-red-500">{errors.rating.message}</p>}
          </div>

          {!isDoctor && (
            <PatientDetailedRatings
              setValue={setValue as UseFormSetValue<PatientReviewFormData>}
              watch={watch as UseFormWatch<PatientReviewFormData>}
              errors={errors as FieldErrors<PatientReviewFormData>}
            />
          )}

          <div className="space-y-2">
            <Textarea
              placeholder={isDoctor ? 'Share your feedback about the platform...' : 'Share your experience...'}
              className="min-h-[120px] resize-none"
              labelName="Comment *"
              error={errors.comment?.message || ''}
              {...register('comment')}
            />
          </div>

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
              child={isDoctor ? 'Submit Feedback' : 'Submit Review'}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

interface PatientDetailedRatingsProps {
  setValue: UseFormSetValue<PatientReviewFormData>;
  watch: UseFormWatch<PatientReviewFormData>;
  errors: FieldErrors<PatientReviewFormData>;
}

const PatientDetailedRatings = ({ setValue, watch, errors }: PatientDetailedRatingsProps): JSX.Element => {
  const communicationSkill = watch('communicationSkill');
  const expertise = watch('expertise');

  return (
    <>
      <div className="space-y-4 rounded-lg border p-4">
        <Label className="text-base font-semibold">Communication Skills *</Label>
        <div className="mt-2 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Professional</Label>
            <StarRating
              rating={communicationSkill.isProfessional}
              onRatingChange={(value: number) =>
                setValue('communicationSkill.isProfessional', value, { shouldValidate: true })
              }
            />
          </div>
          {errors?.communicationSkill?.isProfessional && (
            <p className="text-sm text-red-500">
              {errors.communicationSkill.isProfessional.message}
            </p>
          )}

          <div className="flex items-center justify-between">
            <Label className="text-sm">Clear Communication</Label>
            <StarRating
              rating={communicationSkill.isClear}
              onRatingChange={(value: number) =>
                setValue('communicationSkill.isClear', value, { shouldValidate: true })
              }
            />
          </div>
          {errors?.communicationSkill?.isClear && (
            <p className="text-sm text-red-500">{errors.communicationSkill.isClear.message}</p>
          )}

          <div className="flex items-center justify-between">
            <Label className="text-sm">Attentive</Label>
            <StarRating
              rating={communicationSkill.isAttentive}
              onRatingChange={(value: number) =>
                setValue('communicationSkill.isAttentive', value, { shouldValidate: true })
              }
            />
          </div>
          {errors?.communicationSkill?.isAttentive && (
            <p className="text-sm text-red-500">
              {errors.communicationSkill.isAttentive.message}
            </p>
          )}

          <div className="flex items-center justify-between">
            <Label className="text-sm">Comfortable</Label>
            <StarRating
              rating={communicationSkill.isComfortable}
              onRatingChange={(value: number) =>
                setValue('communicationSkill.isComfortable', value, { shouldValidate: true })
              }
            />
          </div>
          {errors?.communicationSkill?.isComfortable && (
            <p className="text-sm text-red-500">
              {errors.communicationSkill.isComfortable.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <Label className="text-base font-semibold">Expertise *</Label>
        <div className="mt-2 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Knowledge</Label>
            <StarRating
              rating={expertise.knowledge}
              onRatingChange={(value: number) =>
                setValue('expertise.knowledge', value, { shouldValidate: true })
              }
            />
          </div>
          {errors?.expertise?.knowledge && (
            <p className="text-sm text-red-500">{errors.expertise.knowledge.message}</p>
          )}

          <div className="flex items-center justify-between">
            <Label className="text-sm">Thorough</Label>
            <StarRating
              rating={expertise.thorough}
              onRatingChange={(value: number) =>
                setValue('expertise.thorough', value, { shouldValidate: true })
              }
            />
          </div>
          {errors?.expertise?.thorough && (
            <p className="text-sm text-red-500">{errors.expertise.thorough.message}</p>
          )}

          <div className="flex items-center justify-between">
            <Label className="text-sm">Confidence</Label>
            <StarRating
              rating={expertise.confidence}
              onRatingChange={(value: number) =>
                setValue('expertise.confidence', value, { shouldValidate: true })
              }
            />
          </div>
          {errors?.expertise?.confidence && (
            <p className="text-sm text-red-500">{errors.expertise.confidence.message}</p>
          )}

          <div className="flex items-center justify-between">
            <Label className="text-sm">Helpful</Label>
            <StarRating
              rating={expertise.helpful}
              onRatingChange={(value: number) =>
                setValue('expertise.helpful', value, { shouldValidate: true })
              }
            />
          </div>
          {errors?.expertise?.helpful && (
            <p className="text-sm text-red-500">{errors.expertise.helpful.message}</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Review;
