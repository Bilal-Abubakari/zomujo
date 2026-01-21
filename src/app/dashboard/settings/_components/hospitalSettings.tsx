'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  healthInsurances,
  MODE,
  specialties,
  organizationTypes,
  languages as languageOptions,
} from '@/constants/constants';
import { toast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { nameArraySchema, nameSchema, positiveNumberSchema } from '@/schemas/zod.schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import React, { JSX, useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { IHospitalProfile } from '@/types/hospital.interface';
import { MultiSelect } from '@/components/ui/multiSelect';
import { updateHospitalDetails } from '@/lib/features/hospitals/hospitalThunk';
import { selectExtra } from '@/lib/features/auth/authSelector';
import { IAdmin } from '@/types/admin.interface';
import useImageUpload from '@/hooks/useImageUpload';
import { PLACEHOLDER_HOSPITAL_NAME } from '@/constants/branding.constant';
import { IHospital, IHospitalDetail } from '@/types/hospital.interface';
import { ApproveDeclineStatus } from '@/types/shared.enum';
import { Textarea } from '@/components/ui/textarea';
import { SelectInput } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const hospitalSettingsSchema = z.object({
  image: z.union([z.instanceof(File), z.url(), z.null()]).optional(),
  images: z.array(z.union([z.instanceof(File), z.string()])).optional(),
  name: nameSchema,
  specialties: nameArraySchema,
  regularFee: positiveNumberSchema,
  supportedInsurance: nameArraySchema,
  // New fields
  description: z.string().optional(),
  organizationType: z.enum(['private', 'public', 'teaching', 'clinic']).optional(),
  mainPhone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  mainEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
  website: z.string().url('Invalid URL format').optional().or(z.literal('')),
  languages: z.array(z.string()).optional(),
  bedCount: z.coerce
    .number()
    .int('Must be a whole number')
    .positive('Must be greater than zero')
    .optional()
    .or(z.literal('')),
  telemedicine: z.boolean().optional(),
  hasEmergency: z.boolean().optional(),
  // Address fields
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  fax: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid fax number format')
    .optional()
    .or(z.literal('')),
  gpsLink: z
    .string()
    .refine(
      (val) => {
        if (!val || val === '') return true;
        // Accept Ghana Post GPS format (GA-123-4567 or similar), Google Maps links, or other map URLs
        const ghanaPostPattern = /^[A-Z]{2}-[\d]{3}-[\d]{4,5}$/i;
        const urlPattern = /^https?:\/\/(www\.)?(google\.com\/maps|maps\.google\.com|openstreetmap\.org|waze\.com|maps\.apple\.com)/i;
        return ghanaPostPattern.test(val) || urlPattern.test(val);
      },
      { message: 'Must be a valid Ghana Post GPS code (e.g., GA-123-4567) or Maps link' },
    )
    .optional()
    .or(z.literal('')),
});

const HospitalSettings = (): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const selectRef = useRef<HTMLButtonElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const extra = useAppSelector(selectExtra);
  const org = ((extra as IAdmin | null)?.org ?? (extra as IHospital | null)) as
    | IHospital
    | undefined;

  const dummyOrg: IHospital = {
    id: 'demo-hospital-id',
    name: PLACEHOLDER_HOSPITAL_NAME,
    email: 'admin@hospital.com',
    location: 'Liberation Road, Accra',
    status: ApproveDeclineStatus.Approved,
    distance: 0,
    gpsLink: 'https://maps.google.com/?q=Liberation+Road+Accra',
    image: null,
    supportedInsurance: ['NHIS'],
    specialties: ['General Practice'],
    regularFee: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const initialOrg = org ?? dummyOrg;
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm<IHospitalProfile>({
    resolver: zodResolver(hospitalSettingsSchema),
    mode: MODE.ON_TOUCH,
    defaultValues: {
      ...initialOrg,
      description: (initialOrg as IHospitalDetail)?.description || '',
      organizationType: (initialOrg as IHospitalDetail)?.organizationType,
      mainPhone: (initialOrg as IHospitalDetail)?.mainPhone || '',
      mainEmail: (initialOrg as IHospitalDetail)?.mainEmail || '',
      website: (initialOrg as IHospitalDetail)?.website || '',
      languages: (initialOrg as IHospitalDetail)?.languages || [],
      bedCount: (initialOrg as IHospitalDetail)?.bedCount,
      telemedicine: (initialOrg as IHospitalDetail)?.telemedicine || false,
      hasEmergency: (initialOrg as IHospitalDetail)?.hasEmergency || false,
      street: (initialOrg as IHospitalDetail)?.primaryAddress?.street || '',
      city: (initialOrg as IHospitalDetail)?.primaryAddress?.city || '',
      state: (initialOrg as IHospitalDetail)?.primaryAddress?.state || '',
      postalCode: (initialOrg as IHospitalDetail)?.primaryAddress?.postalCode || '',
      country: (initialOrg as IHospitalDetail)?.primaryAddress?.country || '',
      phone: (initialOrg as IHospitalDetail)?.primaryAddress?.phone || '',
      fax: (initialOrg as IHospitalDetail)?.primaryAddress?.fax || '',
      gpsLink: (initialOrg as IHospital)?.gpsLink || '',
      images: (initialOrg as IHospitalDetail)?.images
        ?.sort((a, b) => {
          // Sort: logo first, then photos
          if (a.type === 'logo') return -1;
          if (b.type === 'logo') return 1;
          return 0;
        })
        .map((img) => img.url) || [],
    },
  });
  
  const hospitalImages = watch('images') || [];
  
  const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const currentImages = watch('images') || [];
      const newImages = [...currentImages, ...files];
      setValue('images', newImages, { shouldTouch: true, shouldValidate: true });
    }
  };

  const [imageObjectUrls] = useState<Map<string, string>>(new Map());

  const getImageUrl = (image: File | string, index: number): string => {
    if (typeof image === 'string') {
      return image;
    }
    // Create and cache object URL
    const key = `${index}-${image.name}-${image.size}`;
    if (!imageObjectUrls.has(key)) {
      const url = URL.createObjectURL(image);
      imageObjectUrls.set(key, url);
    }
    return imageObjectUrls.get(key) || '';
  };

  const removeImage = (index: number): void => {
    const currentImages = watch('images') || [];
    const imageToRemove = currentImages[index];
    
    // Cleanup object URL if it's a File
    if (imageToRemove instanceof File) {
      const key = `${index}-${imageToRemove.name}-${imageToRemove.size}`;
      const url = imageObjectUrls.get(key);
      if (url) {
        URL.revokeObjectURL(url);
        imageObjectUrls.delete(key);
      }
    }
    
    const updatedImages = currentImages.filter((_, i) => i !== index);
    setValue('images', updatedImages, { shouldTouch: true, shouldValidate: true });
  };

  // Cleanup all object URLs on unmount
  useEffect(() => {
    return () => {
      imageObjectUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      imageObjectUrls.clear();
    };
  }, []);

  async function onSubmit(hospitalProfile: Partial<IHospitalProfile>): Promise<void> {
    setIsLoading(true);
    // Filter to only send new File objects (not existing URLs)
    // Backend will handle adding new images to existing gallery
    if (hospitalProfile.images) {
      hospitalProfile.images = hospitalProfile.images.filter(
        (img) => img instanceof File,
      ) as File[];
      
      // If no new images, remove the field
      if (hospitalProfile.images.length === 0) {
        delete hospitalProfile.images;
      }
    }
    // Remove old single image field if it's a string
    if (typeof hospitalProfile.image === 'string') {
      delete hospitalProfile.image;
    }
    const { payload } = await dispatch(updateHospitalDetails(hospitalProfile));
    if (payload) {
      toast(payload);
    }
    setIsLoading(false);
  }

  return (
    <>
      <section>
        <div>
          <h2 className="text-2xl font-bold">Hospital Settings</h2>
          <p className="text-gray-500"> Update hospital details</p>
        </div>
        <hr className="my-7 gap-4" />
        <div>
          <p className="font-medium">Hospital Image Gallery</p>
          <span className="text-sm text-gray-500">Upload multiple images for the hospital gallery</span>
        </div>
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {hospitalImages.map((image, index) => {
              const imageUrl = getImageUrl(image, index);
              const isLogo = index === 0; // First image is considered the logo
              return (
                <div key={index} className="relative group">
                  <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200">
                    <Image
                      src={imageUrl}
                      alt={`Hospital image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />
                    {isLogo && (
                      <div className="absolute top-1 left-1 bg-primary text-white text-xs px-2 py-1 rounded">
                        Logo
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
            <div className="relative aspect-square">
              <button
                type="button"
                onClick={() => imagesInputRef.current?.click()}
                className="flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-primary transition-colors"
              >
                <span className="text-sm text-gray-500">Add Image</span>
              </button>
              <input
                accept="image/*"
                className="hidden"
                ref={imagesInputRef}
                type="file"
                multiple
                onChange={handleImagesChange}
              />
            </div>
          </div>
        </div>
      </section>
      <hr className="my-[30px]" />
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Section 1: Basic Information */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold">Basic Information</h3>
          <div className="flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
            <Input
              labelName="Name of Hospital"
              className="bg-transparent"
              placeholder={PLACEHOLDER_HOSPITAL_NAME}
              error={errors.name?.message || ''}
              {...register('name')}
            />
            <div className="w-full sm:w-auto">
              <SelectInput
                control={control}
                name="organizationType"
                options={organizationTypes}
                label="Organization Type"
                placeholder="Select organization type"
                error={errors.organizationType?.message}
                ref={selectRef}
              />
            </div>
          </div>
          <div className="mt-4">
            <Textarea
              labelName="Description"
              className="w-full resize-none bg-transparent"
              placeholder="Enter hospital description"
              error={errors.description?.message || ''}
              {...register('description')}
              rows={6}
              maxLength={500}
            />
          </div>
        </div>

        <hr className="my-[30px]" />

        {/* Section 2: Contact Information */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold">Contact Information</h3>
          <div className="flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
            <Input
              labelName="Main Phone"
              className="bg-transparent"
              placeholder="Enter main phone number"
              type="tel"
              error={errors.mainPhone?.message || ''}
              {...register('mainPhone')}
            />
            <Input
              labelName="Main Email"
              className="bg-transparent"
              placeholder="Enter main email address"
              type="email"
              error={errors.mainEmail?.message || ''}
              {...register('mainEmail')}
            />
          </div>
          <div className="mt-4">
            <Input
              labelName="Website"
              className="bg-transparent"
              placeholder="https://example.com"
              type="url"
              error={errors.website?.message || ''}
              {...register('website')}
            />
          </div>
        </div>

        <hr className="my-[30px]" />

        {/* Section 3: Location & Address */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold">Location & Address</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              labelName="Street Address"
              className="bg-transparent"
              placeholder="Enter street address"
              error={errors.street?.message || ''}
              {...register('street')}
            />
            <Input
              labelName="City"
              className="bg-transparent"
              placeholder="Enter city"
              error={errors.city?.message || ''}
              {...register('city')}
            />
            <Input
              labelName="State/Region"
              className="bg-transparent"
              placeholder="Enter state or region"
              error={errors.state?.message || ''}
              {...register('state')}
            />
            <Input
              labelName="Postal Code"
              className="bg-transparent"
              placeholder="Enter postal code"
              error={errors.postalCode?.message || ''}
              {...register('postalCode')}
            />
            <Input
              labelName="Country"
              className="bg-transparent"
              placeholder="Enter country"
              error={errors.country?.message || ''}
              {...register('country')}
            />
            <Input
              labelName="Phone"
              className="bg-transparent"
              placeholder="Enter phone number"
              type="tel"
              error={errors.phone?.message || ''}
              {...register('phone')}
            />
            <Input
              labelName="Fax"
              className="bg-transparent"
              placeholder="Enter fax number"
              type="tel"
              error={errors.fax?.message || ''}
              {...register('fax')}
            />
            <Input
              labelName="GPS / Map Link"
              className="bg-transparent"
              placeholder="GA-123-4567 or https://maps.google.com/..."
              error={errors.gpsLink?.message || ''}
              {...register('gpsLink')}
            />
          </div>
        </div>

        <hr className="my-[30px]" />

        {/* Section 4: Services & Facilities */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold">Services & Facilities</h3>
          <div className="flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
            <MultiSelect
              labelName="Select Specialties"
              options={specialties}
              onValueChange={(value) => {
                setValue('specialties', value, { shouldTouch: true, shouldValidate: true });
              }}
              defaultValue={watch('specialties')}
              placeholder="Select specialties"
              variant="inverted"
              animation={2}
            />
            <MultiSelect
              labelName="Select Supported Insurance"
              options={healthInsurances}
              onValueChange={(value) => {
                setValue('supportedInsurance', value, { shouldTouch: true, shouldValidate: true });
              }}
              defaultValue={watch('supportedInsurance')}
              placeholder="Select insurance plans"
              variant="inverted"
              animation={2}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
            <MultiSelect
              labelName="Languages Spoken"
              options={languageOptions}
              onValueChange={(value) => {
                setValue('languages', value, { shouldTouch: true, shouldValidate: true });
              }}
              defaultValue={watch('languages')}
              placeholder="Select languages"
              variant="inverted"
              animation={2}
            />
            <Input
              labelName="Bed Count"
              className="bg-transparent"
              placeholder="Enter number of beds"
              type="number"
              error={errors.bedCount?.message || ''}
              {...register('bedCount')}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <Controller
              control={control}
              name="hasEmergency"
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  labelName="Has Emergency Services"
                />
              )}
            />
            <Controller
              control={control}
              name="telemedicine"
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  labelName="Telemedicine Available"
                />
              )}
            />
          </div>
        </div>

        <hr className="my-[30px]" />

        {/* Section 5: Pricing */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold">Pricing</h3>
          <div className="max-w-md">
            <Input
              labelName="Consultation Fees (Starting Price)"
              className="bg-transparent"
              placeholder="Enter starting consultation fee"
              type="number"
              error={errors.regularFee?.message || ''}
              {...register('regularFee')}
            />
          </div>
        </div>

        <Button
          child="Save Changes"
          className="me:mb-0 my-[15px] mb-24 ml-auto flex"
          isLoading={isLoading}
          disabled={!isValid || isLoading}
        />
      </form>
    </>
  );
};

export default HospitalSettings;
