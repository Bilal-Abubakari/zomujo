import React, { JSX } from 'react';
import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadiologyForm } from '@/schemas/radiology.schema';

type QuestionsSectionProps = {
  questions: string[];
  register: UseFormRegister<RadiologyForm>;
  setValue: UseFormSetValue<RadiologyForm>;
  errors: FieldErrors<RadiologyForm>;
};

export const QuestionsSection = ({
  questions,
  register,
  setValue,
  errors,
}: QuestionsSectionProps): JSX.Element => (
  <div>
    <Label>Clinical Questions</Label>
    <div className="space-y-2">
      {questions.map((question, index) => (
        <div key={index} className="flex gap-2">
          <Input
            placeholder={`Question ${index + 1}`}
            {...register(`questions.${index}` as const)}
          />
          {questions.length > 1 && (
            <button
              type="button"
              onClick={() =>
                setValue(
                  'questions',
                  questions.filter((_, i) => i !== index),
                )
              }
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      ))}
      {questions.length < 3 && (
        <button
          type="button"
          onClick={() => setValue('questions', [...questions, ''])}
          className="text-sm text-blue-600 hover:underline"
        >
          + Add Question
        </button>
      )}
    </div>
    {errors.questions && <p className="text-sm text-red-500">{errors.questions?.message}</p>}
  </div>
);
