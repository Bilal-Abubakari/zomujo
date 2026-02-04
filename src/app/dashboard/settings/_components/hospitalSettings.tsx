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
import { GripVertical, Trash2 } from 'lucide-react';
import Image from 'next/image';
import React, { JSX, useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { MultiSelect } from '@/components/ui/multiSelect';
import { updateHospitalDetails } from '@/lib/features/hospitals/hospitalThunk';
import { selectExtra, selectUserRole } from '@/lib/features/auth/authSelector';
import { cn } from '@/lib/utils';
import { PLACEHOLDER_HOSPITAL_NAME } from '@/constants/branding.constant';
import { IHospital, IHospitalDetail } from '@/types/hospital.interface';
import { ApproveDeclineStatus } from '@/types/shared.enum';
import { Textarea } from '@/components/ui/textarea';
import { SelectInput } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Role } from '@/types/shared.enum';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const IMAGE_ITEM_TYPE = 'hospital-image';

const hospitalSettingsSchema = z.object({
  image: z.union([z.instanceof(File), z.url(), z.null()]).optional(),
  images: z.array(z.union([z.instanceof(File), z.string()])).optional(),
  name: nameSchema,
  specialties: nameArraySchema,
  regularFee: positiveNumberSchema,
  supportedInsurance: nameArraySchema,
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
  bedCount: z.union([
    z.literal(''),
    z.coerce
      .number()
      .int('Must be a whole number')
      .positive('Must be greater than zero'),
  ]).optional(),
  telemedicine: z.boolean().optional(),
  hasEmergency: z.boolean().optional(),
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
        const ghanaPostPattern = /^[A-Z]{2}-[\d]{3}-[\d]{4,5}$/i;
        const urlPattern = /^https?:\/\/(www\.)?(google\.com\/maps|maps\.google\.com|openstreetmap\.org|waze\.com|maps\.apple\.com)/i;
        return ghanaPostPattern.test(val) || urlPattern.test(val);
      },
      { message: 'Must be a valid Ghana Post GPS code (e.g., GA-123-4567) or Maps link' },
    )
    .optional()
    .or(z.literal('')),
});

type HospitalFormValues = z.infer<typeof hospitalSettingsSchema>;

type OrgSource = (IHospital & Partial<IHospitalDetail>) | undefined;

function getOrgFromExtra(extra: unknown, role: Role | undefined): OrgSource {
  if (!extra || !role) return undefined;
  if (role === Role.Admin && extra && typeof extra === 'object' && 'org' in extra) {
    return (extra as { org: IHospital }).org as OrgSource;
  }
  if (role === Role.Hospital && extra && typeof extra === 'object' && 'id' in extra) {
    return extra as OrgSource;
  }
  return undefined;
}

function getInitialFormValues(org: OrgSource): HospitalFormValues {
  const addr = org && 'primaryAddress' in org ? org.primaryAddress : undefined;
  const images =
    org && 'images' in org && Array.isArray(org.images)
      ? [...org.images]
          .sort((a, b) => {
            if (a.type === 'logo') return -1;
            if (b.type === 'logo') return 1;
            return 0;
          })
          .map((img) => img.url)
      : [];

  return {
    name: org?.name ?? PLACEHOLDER_HOSPITAL_NAME,
    specialties: org?.specialties ?? ['general practice'],
    supportedInsurance: org?.supportedInsurance ?? ['nhis'],
    regularFee: org?.regularFee ?? 100,
    description: (org as IHospitalDetail | undefined)?.description ?? '',
    organizationType: (org as IHospitalDetail | undefined)?.organizationType,
    mainPhone: (org as IHospitalDetail | undefined)?.mainPhone ?? '',
    mainEmail: (org as IHospitalDetail | undefined)?.mainEmail ?? '',
    website: (org as IHospitalDetail | undefined)?.website ?? '',
    languages: (org as IHospitalDetail | undefined)?.languages ?? [],
    bedCount: (org as IHospitalDetail | undefined)?.bedCount ?? '',
    telemedicine: (org as IHospitalDetail | undefined)?.telemedicine ?? false,
    hasEmergency: (org as IHospitalDetail | undefined)?.hasEmergency ?? false,
    street: addr?.street ?? '',
    city: addr?.city ?? '',
    state: addr?.state ?? '',
    postalCode: addr?.postalCode ?? '',
    country: addr?.country ?? '',
    phone: addr?.phone ?? '',
    fax: addr?.fax ?? '',
    gpsLink: (org as IHospital)?.gpsLink ?? '',
    images,
  };
}

const dummyOrg: OrgSource = {
  id: 'demo-hospital-id',
  name: PLACEHOLDER_HOSPITAL_NAME,
  email: 'admin@hospital.com',
  location: 'Liberation Road, Accra',
  status: ApproveDeclineStatus.Approved,
  distance: 0,
  gpsLink: 'https://maps.google.com/?q=Liberation+Road+Accra',
  image: null,
  supportedInsurance: ['nhis'],
  specialties: ['general practice'],
  regularFee: 100,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const SET_VALUE_OPTS = {
  shouldTouch: true,
  shouldValidate: true,
  shouldDirty: true,
} as const;

/** Extract only dirty (changed) field values for API payload */
function buildDirtyPayload(
  dirtyFields: Partial<Record<keyof HospitalFormValues, boolean | object>>,
  data: HospitalFormValues,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const key of Object.keys(dirtyFields) as (keyof HospitalFormValues)[]) {
    const isDirty = dirtyFields[key];
    if (!isDirty) continue;

    let value = data[key];

    if (key === 'images' && Array.isArray(value)) {
      const newFiles = value.filter((img) => img instanceof File);
      if (newFiles.length === 0) continue;
      payload[key] = newFiles;
      continue;
    }
    if (key === 'image' && typeof value === 'string') continue;
    if (key === 'bedCount' && value === '') value = undefined;
    if (value !== undefined) {
      payload[key] = value;
    }
  }

  return payload;
}

type DraggableImageCardProps = {
  image: File | string;
  index: number;
  isLogo: boolean;
  imageUrl: string;
  onRemove: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
};

function DraggableImageCard({
  image,
  index,
  isLogo,
  imageUrl,
  onRemove,
  onReorder,
}: DraggableImageCardProps): JSX.Element {
  const [{ isDragging }, dragRef] = useDrag({
    type: IMAGE_ITEM_TYPE,
    item: { index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [{ isOver }, dropRef] = useDrop({
    accept: IMAGE_ITEM_TYPE,
    drop: (item: { index: number }) => {
      if (item.index !== index) {
        onReorder(item.index, index);
      }
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  const ref = (node: HTMLDivElement | null) => {
    dragRef(node);
    dropRef(node);
  };

  return (
    <div
      ref={ref}
      className={cn(
        'relative group cursor-grab active:cursor-grabbing transition-opacity',
        isDragging && 'opacity-50',
        isOver && 'ring-2 ring-primary ring-offset-2 rounded-lg',
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200">
        <div className="absolute left-1 top-1/2 z-10 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-gray-600 bg-white/90 rounded p-0.5" />
        </div>
        <Image
          src={imageUrl}
          alt={`Hospital image ${index + 1}`}
          fill
          className="object-cover pointer-events-none"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          draggable={false}
        />
        {isLogo && (
          <div className="absolute top-1 left-1 bg-primary text-white text-xs px-2 py-1 rounded">
            Logo
          </div>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

const HospitalSettings = (): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const selectRef = useRef<HTMLButtonElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const extra = useAppSelector(selectExtra);
  const role = useAppSelector(selectUserRole);
  const org = getOrgFromExtra(extra, role ?? undefined);
  const initialOrg = org ?? dummyOrg;
  const initialValues = getInitialFormValues(initialOrg);

  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors, isValid, isDirty, dirtyFields },
  } = useForm<HospitalFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(hospitalSettingsSchema) as any,
    mode: MODE.ON_TOUCH,
    defaultValues: initialValues,
  });

  const hospitalImages = watch('images') ?? [];

  const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) {
      const currentImages = watch('images') ?? [];
      const newImages = [...currentImages, ...files];
      setValue('images', newImages, SET_VALUE_OPTS);
    }
    event.target.value = '';
  };

  const [imageObjectUrls] = useState<Map<string, string>>(new Map());

  const getImageUrl = (image: File | string, index: number): string => {
    if (typeof image === 'string') return image;
    const key = `${index}-${image.name}-${image.size}`;
    if (!imageObjectUrls.has(key)) {
      const url = URL.createObjectURL(image);
      imageObjectUrls.set(key, url);
    }
    return imageObjectUrls.get(key) ?? '';
  };

  const removeImage = (index: number): void => {
    const currentImages = watch('images') ?? [];
    const imageToRemove = currentImages[index];
    if (imageToRemove instanceof File) {
      const key = `${index}-${imageToRemove.name}-${imageToRemove.size}`;
      const url = imageObjectUrls.get(key);
      if (url) {
        URL.revokeObjectURL(url);
        imageObjectUrls.delete(key);
      }
    }
    const updatedImages = currentImages.filter((_, i) => i !== index);
    setValue('images', updatedImages, SET_VALUE_OPTS);
  };

  const reorderImages = (fromIndex: number, toIndex: number): void => {
    const currentImages = watch('images') ?? [];
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= currentImages.length || toIndex >= currentImages.length) return;
    const reordered = [...currentImages];
    const [removed] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, removed);
    setValue('images', reordered, SET_VALUE_OPTS);
  };

  useEffect(() => {
    return () => {
      imageObjectUrls.forEach((url) => URL.revokeObjectURL(url));
      imageObjectUrls.clear();
    };
  }, []);

  const onSubmit = async (data: HospitalFormValues): Promise<void> => {
    setIsLoading(true);

    // Build payload with only changed fields
    const payload = buildDirtyPayload(dirtyFields, data);

    const result = await dispatch(
      updateHospitalDetails(payload as Parameters<typeof updateHospitalDetails>[0]),
    );
    if (result.payload) {
      toast(result.payload as { title: string; description?: string });
      reset(data);
    }
    setIsLoading(false);
  };

  const canSave = isDirty && isValid && !isLoading;

  return (
    <>
      <section>
        <div>
          <h2 className="text-2xl font-bold">Hospital Settings</h2>
          <p className="text-gray-500">Update hospital details</p>
        </div>
        <hr className="my-7 gap-4" />
        <div>
          <p className="font-medium">Hospital Image Gallery</p>
          <span className="text-sm text-gray-500">
            Upload multiple images for the hospital gallery. Drag images to reorder (first image is the logo).
          </span>
        </div>
        <div className="mt-4">
          <DndProvider backend={HTML5Backend}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {hospitalImages.map((image, index) => {
                const imageUrl = getImageUrl(image, index);
                const isLogo = index === 0;
                return (
                  <DraggableImageCard
                    key={`${index}-${typeof image === 'string' ? image : image.name}`}
                    image={image}
                    index={index}
                    isLogo={isLogo}
                    imageUrl={imageUrl}
                    onRemove={() => removeImage(index)}
                    onReorder={reorderImages}
                  />
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
          </DndProvider>
        </div>
      </section>
      <hr className="my-[30px]" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold">Basic Information</h3>
          <div className="flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
            <Input
              labelName="Name of Hospital"
              className="bg-transparent"
              placeholder={PLACEHOLDER_HOSPITAL_NAME}
              error={errors.name?.message ?? ''}
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
              error={errors.description?.message ?? ''}
              {...register('description')}
              rows={6}
              maxLength={500}
            />
          </div>
        </div>

        <hr className="my-[30px]" />

        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold">Contact Information</h3>
          <div className="flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
            <Input
              labelName="Main Phone"
              className="bg-transparent"
              placeholder="Enter main phone number"
              type="tel"
              error={errors.mainPhone?.message ?? ''}
              {...register('mainPhone')}
            />
            <Input
              labelName="Main Email"
              className="bg-transparent"
              placeholder="Enter main email address"
              type="email"
              error={errors.mainEmail?.message ?? ''}
              {...register('mainEmail')}
            />
          </div>
          <div className="mt-4">
            <Input
              labelName="Website"
              className="bg-transparent"
              placeholder="https://example.com"
              type="url"
              error={errors.website?.message ?? ''}
              {...register('website')}
            />
          </div>
        </div>

        <hr className="my-[30px]" />

        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold">Location & Address</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              labelName="Street Address"
              className="bg-transparent"
              placeholder="Enter street address"
              error={errors.street?.message ?? ''}
              {...register('street')}
            />
            <Input labelName="City" className="bg-transparent" placeholder="Enter city" error={errors.city?.message ?? ''} {...register('city')} />
            <Input
              labelName="State/Region"
              className="bg-transparent"
              placeholder="Enter state or region"
              error={errors.state?.message ?? ''}
              {...register('state')}
            />
            <Input
              labelName="Postal Code"
              className="bg-transparent"
              placeholder="Enter postal code"
              error={errors.postalCode?.message ?? ''}
              {...register('postalCode')}
            />
            <Input
              labelName="Country"
              className="bg-transparent"
              placeholder="Enter country"
              error={errors.country?.message ?? ''}
              {...register('country')}
            />
            <Input
              labelName="Phone"
              className="bg-transparent"
              placeholder="Enter phone number"
              type="tel"
              error={errors.phone?.message ?? ''}
              {...register('phone')}
            />
            <Input
              labelName="Fax"
              className="bg-transparent"
              placeholder="Enter fax number"
              type="tel"
              error={errors.fax?.message ?? ''}
              {...register('fax')}
            />
            <Input
              labelName="GPS / Map Link"
              className="bg-transparent"
              placeholder="GA-123-4567 or https://maps.google.com/..."
              error={errors.gpsLink?.message ?? ''}
              {...register('gpsLink')}
            />
          </div>
        </div>

        <hr className="my-[30px]" />

        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold">Services & Facilities</h3>
          <div className="flex flex-wrap items-baseline gap-8 sm:flex-nowrap">
            <MultiSelect
              labelName="Select Specialties"
              options={specialties}
              onValueChange={(value) => setValue('specialties', value, SET_VALUE_OPTS)}
              defaultValue={watch('specialties')}
              placeholder="Select specialties"
              variant="inverted"
              animation={2}
            />
            <MultiSelect
              labelName="Select Supported Insurance"
              options={healthInsurances}
              onValueChange={(value) => setValue('supportedInsurance', value, SET_VALUE_OPTS)}
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
              onValueChange={(value) => setValue('languages', value, SET_VALUE_OPTS)}
              defaultValue={watch('languages') ?? []}
              placeholder="Select languages"
              variant="inverted"
              animation={2}
            />
            <Input
              labelName="Bed Count"
              className="bg-transparent"
              placeholder="Enter number of beds"
              type="number"
              error={errors.bedCount?.message ?? ''}
              {...register('bedCount')}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <Controller
              control={control}
              name="hasEmergency"
              render={({ field }) => (
                <Checkbox checked={field.value} onCheckedChange={field.onChange} labelName="Has Emergency Services" />
              )}
            />
            <Controller
              control={control}
              name="telemedicine"
              render={({ field }) => (
                <Checkbox checked={field.value} onCheckedChange={field.onChange} labelName="Telemedicine Available" />
              )}
            />
          </div>
        </div>

        <hr className="my-[30px]" />

        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold">Pricing</h3>
          <div className="max-w-md">
            <Input
              labelName="Consultation Fees (Starting Price)"
              className="bg-transparent"
              placeholder="Enter starting consultation fee"
              type="number"
              error={errors.regularFee?.message ?? ''}
              {...register('regularFee')}
            />
          </div>
        </div>

        <Button child="Save Changes" className="me:mb-0 my-[15px] mb-24 ml-auto flex" isLoading={isLoading} disabled={!canSave} />
      </form>
    </>
  );
};

export default HospitalSettings;
