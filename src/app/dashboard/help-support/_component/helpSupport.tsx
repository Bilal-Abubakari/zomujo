'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
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
import { selectUserId } from '@/lib/features/auth/authSelector';

export default function HelpSupport() {
    const [activeTab, setActiveTab] = useState<'issue' | 'feedback'>('issue');
  const userId = useAppSelector(selectUserId)
  const supportSchema = z.object({
      message: requiredStringSchema(),
      id: requiredStringSchema(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ISupport>({defaultValues:{id: userId}, resolver: zodResolver(supportSchema), mode: MODE.ON_TOUCH });

  const dispatch = useAppDispatch();

  const onSubmit = async (support: ISupport): Promise<void> => {
    const payload = await dispatch(reportIssue(support)).unwrap();
    toast(payload);
  };

  const feedbackSchema = z.object({
    feedbackType: requiredStringSchema(),
      message: requiredStringSchema(),
    id:requiredStringSchema()
  });

  const {
    register: feedbackRegister,
    handleSubmit: feedbackHandleSubmit,
    formState: { errors: feedbackErrors, isValid: feedbackIsValid },
  } = useForm<IFeedback>({ defaultValues: {id: userId},resolver: zodResolver(feedbackSchema), mode: MODE.ON_TOUCH });

  const onFeedbackSubmit = async (feedback: IFeedback): Promise<void> => {
    const payload = await dispatch(provideFeedback(feedback)).unwrap();
    toast(payload);
  };

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
                  error={errors.message?.message || ''}
                  {...register('message')}
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
                  disabled={!isValid}
                />
              </div>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={feedbackHandleSubmit(onFeedbackSubmit)}>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  What kind of feedback is it?
                </label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ui">UI Feedback</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="bug">Bug Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Comment</label>
                <Textarea
                  placeholder="Please describe in details ..."
                  className="mt-2 h-36 resize-none"
                  {...feedbackRegister('message')}
                  error={feedbackErrors.message?.message || ''}
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
                  disabled={feedbackIsValid}
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
