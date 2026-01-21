import { z, ZodCoercedNumber, ZodNumber, ZodOptional, ZodPipe, ZodString, ZodTransform } from 'zod';

export const passwordSchema = z
  .string()
  .nonempty('Field is required')
  .min(8, 'Password is too short')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  .max(20, 'Password is too long');

export const emailSchema = z
  .email('Invalid email format')
  .min(5, 'Email is too short')
  .nonempty('Field is required');

export const requiredStringSchema = (isRequired = true): ZodString => {
  const schema = z.string();
  return isRequired ? schema.nonempty('Field is required') : schema;
};

export const fileSchema = z.instanceof(File);

export const nameSchema = z
  .string()
  .nonempty('Field is required')
  .min(2, 'Input should be more than 2 characters')
  .regex(/^[A-Za-z\s-]+$/, 'Field should only contain alphabets');

export const nameArraySchema = z.array(nameSchema).min(1, 'Must have at least one entry');
export const mdcNumberSchema = requiredStringSchema().regex(
  /^MDC\/(RN|PN)\/\d{5}$/,
  'Invalid MDC Registration Number',
);

export const phoneNumberSchema = requiredStringSchema().regex(/^\d{10}$/, 'Invalid phone number');

export const cardNumberSchema = z
  .string()
  .min(13, 'Credit card number must be at least 13 digits')
  .max(19, 'Credit card number must be at most 19 digits')
  .regex(/^\d{13,19}$/, 'Credit card number must contain only digits');

export const phoneOrCardNumberSchema = requiredStringSchema().refine(
  (value) => /^\d{10}$/.test(value) || /^\d{13,19}$/.test(value),
  {
    message: 'Invalid phone or credit card number',
  },
);

export const textAreaSchema = z
  .string()
  .nonempty('Field is required')
  .min(10, 'Field should have at least 10 characters')
  .max(500, 'Field should not exceed 500 characters');

export const positiveNumberSchema = z.coerce
  .number()
  .positive('Value must be greater than zero') as ZodCoercedNumber<number>;

export const stringInputOptionalNumberSchema = z
  .preprocess(
    (val) => (val === null || String(val) === '' ? undefined : Number(val)),
    z.number().positive().optional(),
  )
  .optional() as ZodOptional<
  ZodPipe<ZodTransform<undefined | number, number>, ZodOptional<ZodNumber>>
>;

export const booleanSchema = z.boolean();

export const optionalStringSchema = z.string().optional();

export const optionalEmailSchema = z.string().email('Invalid email format').optional().or(z.literal(''));

export const optionalUrlSchema = z.string().url('Invalid URL format').optional().or(z.literal(''));

export const optionalPhoneSchema = z
  .string()
  .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
  .optional()
  .or(z.literal(''));

export const optionalStringArraySchema = z.array(z.string()).optional();

export const optionalPositiveIntegerSchema = z.coerce
  .number()
  .int('Must be a whole number')
  .positive('Must be greater than zero')
  .optional();

export const organizationTypeSchema = z.enum(['private', 'public', 'teaching', 'clinic']).optional();
