'use client';

import { JSX, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SelectInput, SelectOption } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { requiredStringSchema } from '@/schemas/zod.schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { MODE } from '@/constants/constants';
import { IFeedback, ISupport } from '@/types/support.interface';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { provideFeedback, reportIssue } from '@/lib/features/support/supportThunk';
import { toast } from '@/hooks/use-toast';
import { selectUserId, selectUserName } from '@/lib/features/auth/authSelector';
import { ToastStatus } from '@/types/shared.enum';

export default function HelpSupport(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'issue' | 'feedback'>('issue');
  const [isIssueLoading, setIsIssueLoading] = useState(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const userId = useAppSelector(selectUserId);
  const userName = useAppSelector(selectUserName);
  const supportSchema = z.object({
    description: requiredStringSchema(),
    doctorId: requiredStringSchema(false),
    patientId: requiredStringSchema(),
    name: requiredStringSchema(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<Required<ISupport>>({
    defaultValues: { doctorId: userId, patientId: userId, name: userName },
    resolver: zodResolver(supportSchema),
    mode: MODE.ON_TOUCH,
  });

  const dispatch = useAppDispatch();

  const onSubmit = async (support: ISupport): Promise<void> => {
    setIsIssueLoading(true);
    const payload = await dispatch(reportIssue(support)).unwrap();
    toast(payload);
    if (payload.title === ToastStatus.Success) {
      reset();
    }
    setIsIssueLoading(false);
  };

  const feedbackSchema = z.object({
    type: requiredStringSchema(),
    comment: requiredStringSchema(),
  });

  const {
    register: feedbackRegister,
    handleSubmit: feedbackHandleSubmit,
    control: feedbackControl,
    reset: feedbackReset,
    formState: { errors: feedbackErrors, isValid: feedbackIsValid },
  } = useForm<IFeedback>({ resolver: zodResolver(feedbackSchema), mode: MODE.ON_TOUCH });

  const onFeedbackSubmit = async (feedback: IFeedback): Promise<void> => {
    setIsFeedbackLoading(true);
    const payload = await dispatch(provideFeedback(feedback)).unwrap();
    toast(payload);
    if (payload.title === ToastStatus.Success) {
      feedbackReset();
    }
    setIsFeedbackLoading(false);
  };

  const feedbackTypeOptions: SelectOption[] = [
    { label: 'UI Feedback', value: 'ui' },
    { label: 'Feature Request', value: 'feature' },
    { label: 'Bug Report', value: 'bug' },
  ];

  return (
    <div className="bg-gray-50">
      <h3 className="p-6 pb-0 text-left text-2xl font-semibold">Help & Support </h3>
      <div className="flex min-h-screen justify-center p-6">
        <div className="mt-8 h-fit w-full max-w-3xl rounded-2xl bg-white p-8 shadow-md">
          <div className="mb-6 flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('issue')}
              className={cn(
                'rounded-t-md px-6 py-3 text-sm font-medium transition-colors',
                activeTab === 'issue'
                  ? 'border-b-2 border-gray-900 bg-white text-gray-900'
                  : 'text-gray-500 hover:text-gray-800',
              )}
            >
              Lodge an Issue
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={cn(
                'rounded-t-md px-6 py-3 text-sm font-medium transition-colors',
                activeTab === 'feedback'
                  ? 'border-b-2 border-gray-900 bg-white text-gray-900'
                  : 'text-gray-500 hover:text-gray-800',
              )}
            >
              Drop Feedback
            </button>
          </div>

          {activeTab === 'issue' ? (
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <Textarea
                  placeholder="Lodge issue"
                  className="mt-2 h-36 resize-none"
                  labelName="                   What issue are you experiencing?
"
                  error={errors.description?.message || ''}
                  {...register('description')}
                />
              </div>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full sm:w-1/2"
                  child={'Contact support'}
                />
                <Button
                  type="submit"
                  className="w-full sm:w-1/2"
                  child={'Submit issue'}
                  disabled={!isValid || isIssueLoading}
                  isLoading={isIssueLoading}
                />
              </div>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={feedbackHandleSubmit(onFeedbackSubmit)}>
              <div>
                <SelectInput
                  ref={feedbackRegister('type').ref}
                  control={feedbackControl}
                  options={feedbackTypeOptions}
                  label="What kind of feedback is it?"
                  error={feedbackErrors.type?.message}
                  name="type"
                  placeholder="Select option"
                  className="mt-2 w-full max-w-none"
                />
              </div>

              <div>
                <label htmlFor="comments" className="text-sm font-medium text-gray-700">
                  Comment
                </label>
                <Textarea
                  placeholder="Please describe in details ..."
                  className="mt-2 h-36 resize-none"
                  {...feedbackRegister('comment')}
                  error={feedbackErrors.comment?.message || ''}
                  id="comments"
                />
              </div>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full sm:w-1/2"
                  child={'Contact support'}
                />
                <Button
                  type="submit"
                  className="w-full sm:w-1/2"
                  child={'Submit Feedback'}
                  disabled={!feedbackIsValid || isFeedbackLoading}
                  isLoading={isFeedbackLoading}
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
