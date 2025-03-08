import { z, ZodString } from 'zod';

export const passwordSchema = z
  .string()
  .nonempty('Field is required')
  .min(8, 'Password is too short')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  .max(20, 'Password is too long');

export const emailSchema = (isRequired = true): ZodString =>
  requiredStringSchema(isRequired).email('Invalid email format').min(5, 'Email is too short');

export const requiredStringSchema = (isRequired = true): ZodString => {
  const schema = z.string();
  return isRequired ? schema.nonempty('Field is required') : schema;
};

export const fileSchema = z.instanceof(File);

export const nameSchema = z
  .string()
  .nonempty('Field is required')
  .min(3, 'Field should be more than 3 characters')
  .regex(/^[A-Za-z\s]+$/, 'Field should only contain alphabets');

export const nameArraySchema = z
  .array(nameSchema)
  .nonempty('Must have at least one item')
  .max(10, 'Must not exceed 10 items');

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
export const coordinatesSchema = z.number().optional();

export const textAreaSchema = z
  .string()
  .nonempty('Field is required')
  .min(10, 'Field should have at least 10 characters')
  .max(500, 'Field should not exceed 500 characters')
  .regex(/^[A-Za-z0-9\s.,!?'"-]+$/, 'Field contains invalid characters');

export const positiveNumberSchema = z.preprocess(
  (val) => Number(val),
  z.number().positive('Value must be greater than zero'),
);

export const booleanSchema = z.boolean();
