'use client';

import { ContentProfile } from '@/assets/images';
import { Shield, Zap, BarChart, Star, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { JSX, useEffect, useState } from 'react';
import { ILandingPageReview } from '@/types/review.interface';
import { useAppDispatch } from '@/lib/hooks';
import { getLandingPageReviews } from '@/lib/features/reviews/reviewsThunk';
import { showErrorToast } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const SolutionsOffered = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const [reviews, setReviews] = useState<ILandingPageReview[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  const solutions = [
    {
      icon: Shield,
      title: 'Own Your Medical Records',
      description: 'Connect with top healthcare providers and access your health data anytime',
    },
    {
      icon: Zap,
      title: 'Go Independent, Go Digital',
      description:
        'Integrated scheduling, billing, and video consultations. Streamline your patient care experience.',
    },
    {
      icon: BarChart,
      title: 'Seamless Operations Management',
      description:
        'Simplify scheduling, track patient visits, and keep your operations running smoothly.',
    },
  ];

  useEffect(() => {
    const fetchLandingPageReviews = async (): Promise<void> => {
      setIsLoadingReviews(true);
      const { payload } = await dispatch(getLandingPageReviews());
      if (payload && showErrorToast(payload)) {
        toast(payload);
        setIsLoadingReviews(false);
        return;
      }
      if (payload && Array.isArray(payload) && payload.length > 0) {
        setReviews(payload);
      }
      setIsLoadingReviews(false);
    };

    void fetchLandingPageReviews();
  }, [dispatch]);

  useEffect(() => {
    if (reviews.length > 1) {
      const interval = setInterval(() => {
        setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
      }, 5000);
      return (): void => clearInterval(interval);
    }
  }, [reviews.length]);

  const currentReview = reviews[currentReviewIndex];

  const getReviewUser = (review: ILandingPageReview): { name: string; role: string } => {
    if (review.patient) {
      return {
        name: `${review.patient.firstName} ${review.patient.lastName}`.trim(),
        role: 'Patient',
      };
    }
    if (review.doctor) {
      return {
        name: `${review.doctor.firstName} ${review.doctor.lastName}`.trim(),
        role: 'Doctor',
      };
    }
    return { name: 'Anonymous', role: 'User' };
  };

  const getInitials = (name: string): string => {
    if (!name) {
      return 'U';
    }
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <p className="text-primary mb-2 font-semibold">Features</p>
          <h2 className="text-foreground mb-8 text-4xl font-bold">Solutions for Everyone</h2>
          <p className="text-muted-foreground mx-auto mb-12 max-w-2xl">
            Whether you&apos;re a patient seeking care or a healthcare provider, our platform has
            the tools you need to succeed.
          </p>
        </div>

        <div className="mb-16 flex flex-col items-center gap-12">
          <div className="lg:w-3/4">
            <Image src={ContentProfile} alt="Healthcare app mockup" className="h-auto w-full" />
          </div>
          <div className="flex flex-col space-y-8 xl:flex-row">
            {solutions.map(({ title, description, icon }) => {
              const IconComponent = icon;
              return (
                <div key={title} className="flex items-start space-x-4">
                  <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                    <IconComponent className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold">{title}</h3>
                    <p className="text-muted-foreground">{description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="mx-auto max-w-4xl text-center">
            {isLoadingReviews ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin" size={32} />
              </div>
            ) : (
              <>
                {currentReview && (() => {
                  const { name, role } = getReviewUser(currentReview);
                  return (
                    <>
                      <blockquote className="text-foreground mb-8 text-2xl font-medium transition-opacity duration-500 md:text-3xl">
                        &quot;{currentReview.comment || 'No review available'}&quot;
                      </blockquote>
                      <div className="flex items-center justify-center space-x-4">
                        <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
                          <span className="text-lg font-semibold">
                            {getInitials(name)}
                          </span>
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">{name}</div>
                            {currentReview.rating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{currentReview.rating}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-muted-foreground">{role}</div>
                        </div>
                      </div>
                    </>
                  );
                })()}
                {reviews.length > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-2">
                    {reviews.map((review, index) => {
                      const uniqueKey = `${review.comment.substring(0, 20)}-${review.rating}`;
                      return (
                        <button
                          key={uniqueKey}
                          onClick={() => setCurrentReviewIndex(index)}
                          className={`h-2 rounded-full transition-all ${
                            index === currentReviewIndex
                              ? 'bg-primary w-8'
                              : 'bg-muted-foreground/30 w-2'
                          }`}
                          aria-label={`Go to review ${index + 1}`}
                        />
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default SolutionsOffered;
