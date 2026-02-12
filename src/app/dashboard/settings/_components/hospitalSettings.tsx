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
import { positiveNumberSchema } from '@/schemas/zod.schemas';
import type { FieldErrors, Resolver } from 'react-hook-form';
import { GripVertical, Trash2 } from 'lucide-react';
import Image from 'next/image';
import React, { JSX, useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { MultiSelect } from '@/components/ui/multiSelect';
import {
  updateHospitalDetails,
  getHospitalBySlug,
} from '@/lib/features/hospitals/hospitalThunk';
import { selectExtra, selectUserRole } from '@/lib/features/auth/authSelector';
import { cn } from '@/lib/utils';
import { PLACEHOLDER_HOSPITAL_NAME } from '@/constants/branding.constant';
import { IHospital, IHospitalDetail, IHospitalImage } from '@/types/hospital.interface';
import { ApproveDeclineStatus } from '@/types/shared.enum';
import { Textarea } from '@/components/ui/textarea';
import { SelectInput } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Role } from '@/types/shared.enum';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TooltipComp } from '@/components/ui/tooltip';

const IMAGE_ITEM_TYPE = 'hospital-image';
const MAX_GALLERY_IMAGES = 10;

/** Hospital name: 2–200 characters, any content. */
const hospitalNameSchema = z
  .string()
  .min(2, 'Name should be at least 2 characters')
  .max(200, 'Name is too long');

/** Optional email: null, undefined, empty string, or valid email. */
const optionalEmailSchema = z.union([
  z.literal(''),
  z.literal(null),
  z.string().email('Invalid email format'),
]);
/** Optional URL: null, undefined, empty string, or valid URL. */
const optionalUrlSchema = z.union([
  z.literal(''),
  z.literal(null),
  z.string().url('Invalid URL format'),
]);

/** Optional phone/fax: null, undefined, empty string, or digits/spaces/+-() only. */
const optionalPhoneSchema = z.union([
  z.literal(''),
  z.literal(null),
  z.string().regex(/^[\d\s\-+()]*$/, 'Invalid phone number format'),
]);

/** Array of specialty/insurance names; allow empty array, null, undefined. */
const optionalNameArraySchema = z
  .array(z.string().min(1, 'Each entry must be at least 1 character'))
  .max(50)
  .optional()
  .nullable()
  .transform((val) => val ?? []);

/** GPS: empty/null allowed, or Ghana Post code or maps URL. */
const optionalGpsSchema = z.union([
  z.literal(''),
  z.literal(null),
  z.string().refine(
    (val) => {
      if (!val || val === '') return true;
      const ghanaPostPattern = /^[A-Z]{2}-[\d]{3}-[\d]{4,5}$/i;
      const urlPattern = /^https?:\/\/(www\.)?(google\.com\/maps|maps\.google\.com|openstreetmap\.org|waze\.com|maps\.apple\.com)/i;
      return ghanaPostPattern.test(val) || urlPattern.test(val);
    },
    { message: 'Must be a valid Ghana Post GPS code (e.g., GA-123-4567) or Maps link' },
  ),
]);

/** Optional string: null, undefined, or any string. */
const optionalString = z.string().optional().nullable();

/** Optional number or empty; null allowed. */
const optionalPositiveInt = z.union([
  z.literal(''),
  z.literal(null),
  z.coerce
    .number()
    .int('Must be a whole number')
    .positive('Must be greater than zero'),
]);

const hospitalSettingsSchema = z.object({
  image: z.union([z.instanceof(File), z.string(), z.null()]).optional().nullable(),
  images: z
    .array(z.union([z.instanceof(File), z.string()]))
    .max(MAX_GALLERY_IMAGES, { message: `Gallery can have at most ${MAX_GALLERY_IMAGES} images` })
    .optional()
    .nullable()
    .transform((val) => val ?? []),
  imageOrder: z.array(z.string()).optional().nullable(),
  name: hospitalNameSchema,
  specialties: optionalNameArraySchema,
  regularFee: z
    .union([z.literal(''), z.literal(null), positiveNumberSchema])
    .optional()
    .nullable(),
  supportedInsurance: optionalNameArraySchema,
  description: optionalString,
  organizationType: z.enum(['private', 'public', 'teaching', 'clinic']).optional().nullable(),
  mainPhone: optionalPhoneSchema,
  mainEmail: optionalEmailSchema,
  website: optionalUrlSchema,
  languages: z.array(z.string()).optional().nullable().transform((val) => val ?? []),
  bedCount: optionalPositiveInt,
  telemedicine: z.boolean().optional().nullable(),
  hasEmergency: z.boolean().optional().nullable(),
  street: optionalString,
  city: optionalString,
  state: optionalString,
  postalCode: optionalString,
  country: optionalString,
  phone: optionalPhoneSchema,
  fax: optionalPhoneSchema,
  gpsLink: optionalGpsSchema,
});

type HospitalFormValues = z.infer<typeof hospitalSettingsSchema>;

/**
 * Resolver that only validates fields that have been changed (dirty).
 * Unchanged fields are skipped so pre-loaded/invalid data does not block save.
 */
function createDirtyOnlyResolver(
  schema: z.ZodObject<z.ZodRawShape>,
  dirtyFieldsRef: React.MutableRefObject<Partial<Record<keyof HospitalFormValues, boolean | object>>>,
): (values: HospitalFormValues) => { values: HospitalFormValues; errors: FieldErrors<HospitalFormValues> } {
  return (values: HospitalFormValues) => {
    const dirty = dirtyFieldsRef.current;
    const dirtyKeys = (Object.keys(dirty) as (keyof HospitalFormValues)[]).filter(
      (k) => dirty[k] !== undefined && dirty[k] !== false,
    );
    if (dirtyKeys.length === 0) {
      return { values, errors: {} as FieldErrors<HospitalFormValues> };
    }
    const pickObj = Object.fromEntries(dirtyKeys.map((k) => [k, true])) as Record<string, true>;
    const partialSchema = schema.pick(pickObj);
    const toValidate = Object.fromEntries(dirtyKeys.map((k) => [k, values[k]]));
    const result = partialSchema.safeParse(toValidate);
    if (result.success) {
      return { values, errors: {} as FieldErrors<HospitalFormValues> };
    }
    const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
    const errors: FieldErrors<HospitalFormValues> = {};
    for (const [path, messages] of Object.entries(fieldErrors)) {
      const msg = Array.isArray(messages) ? messages[0] : messages;
      if (msg) (errors as Record<string, { message: string }>)[path] = { message: msg };
    }
    return { values: {} as HospitalFormValues, errors };
  };
}

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

/** Map API hospital detail to the org shape expected by getInitialFormValues */
function hospitalDetailToOrgSource(hospital: IHospitalDetail): OrgSource {
  const accreditations = hospital.accreditations as { specialties?: string[]; regularFee?: number } | undefined;
  const geom = (hospital.primaryAddress as { geom?: { gpsLink?: string } } | undefined)?.geom;
  return {
    ...hospital,
    specialties: accreditations?.specialties ?? [],
    supportedInsurance:
      hospital.insuranceNetworks?.map((n) => n.insuranceCompany.name) ?? [],
    regularFee: accreditations?.regularFee ?? 100,
    gpsLink: geom?.gpsLink ?? '',
    image: hospital.images?.find((img) => img.type === 'logo')?.url ?? null,
  } as OrgSource;
}

function getInitialFormValues(org: OrgSource): HospitalFormValues {
  const addr = org && 'primaryAddress' in org ? org.primaryAddress : undefined;
  const rawImages = org && 'images' in org && Array.isArray(org.images) ? org.images : [];
  const orgImages = rawImages as IHospitalImage[];
  const logoImage = orgImages.find((img) => img.type === 'logo');
  
  // Filter gallery images and sort by displayOrder if available
  const photoImages = orgImages.filter((img) => img.type !== 'logo');
  const sortedPhotos = photoImages.sort((a, b) => {
    const orderA = (a.meta as { displayOrder?: number })?.displayOrder ?? 999;
    const orderB = (b.meta as { displayOrder?: number })?.displayOrder ?? 999;
    return orderA - orderB;
  });
  const galleryImages = sortedPhotos.map((img) => img.url);

  return {
    name: org?.name ?? PLACEHOLDER_HOSPITAL_NAME,
    image: logoImage?.url ?? null,
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
    images: galleryImages,
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

/** Optional string fields where empty string means "clear" (send null to backend) */
const OPTIONAL_STRING_KEYS: (keyof HospitalFormValues)[] = [
  'description',
  'mainPhone',
  'mainEmail',
  'website',
  'street',
  'city',
  'state',
  'postalCode',
  'country',
  'phone',
  'fax',
  'gpsLink',
];

/**
 * Build PATCH payload: only keys that have changed.
 * - Key not in payload = backend must not change that field.
 * - Key with value null = backend must set that field to null.
 * - Empty string for optional string fields is sent as null (clear field).
 */
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
      if (newFiles.length > 0) payload[key] = newFiles;
      continue;
    }
    if (key === 'imageOrder' && Array.isArray(value)) {
      // Send the ordered list of image URLs to backend
      payload[key] = value;
      continue;
    }
    if (key === 'image') {
      payload[key] = value instanceof File ? value : value === null ? null : undefined;
      if (payload[key] === undefined) delete payload[key];
      continue;
    }
    if (key === 'bedCount' && (value === '' || value === undefined)) {
      payload[key] = null;
      continue;
    }
    if (key === 'regularFee' && (value === '' || value === undefined)) {
      payload[key] = null;
      continue;
    }
    if (OPTIONAL_STRING_KEYS.includes(key) && value === '') {
      payload[key] = null;
      continue;
    }
    if (value !== undefined) {
      payload[key] = value;
    }
  }

  return payload;
}

type DraggableImageCardProps = {
  image: File | string;
  index: number;
  isPrimaryDisplay: boolean;
  imageUrl: string;
  onRemove: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
};

function DraggableImageCard({
  image,
  index,
  isPrimaryDisplay,
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

  const imageCard = (
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
        {isPrimaryDisplay && (
          <div className="absolute top-1 left-1 bg-primary text-white text-xs px-2 py-1 rounded">
            PRIMARY ⭐
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

  if (isPrimaryDisplay) {
    return (
      <TooltipComp tip="This is the main image shown when the hospital is viewed">
        {imageCard}
      </TooltipComp>
    );
  }

  return imageCard;
}

const HospitalSettings = (): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHospital, setIsFetchingHospital] = useState(true);
  const selectRef = useRef<HTMLButtonElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const extra = useAppSelector(selectExtra);
  const role = useAppSelector(selectUserRole);
  const org = getOrgFromExtra(extra, role ?? undefined);
  const initialOrg = org ?? dummyOrg;
  const initialValues = getInitialFormValues(initialOrg);

  const dispatch = useAppDispatch();
  const dirtyFieldsRef = React.useRef<Partial<Record<keyof HospitalFormValues, boolean | object>>>({});
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<HospitalFormValues>({
    resolver: createDirtyOnlyResolver(
      hospitalSettingsSchema as z.ZodObject<z.ZodRawShape>,
      dirtyFieldsRef,
    ) as unknown as Resolver<HospitalFormValues>,
    mode: MODE.ON_TOUCH,
    defaultValues: initialValues,
  });
  dirtyFieldsRef.current = dirtyFields;

  // Fetch full hospital data (including images) when user opens settings
  useEffect(() => {
    const slug =
      role === Role.Hospital
        ? (extra as { slug?: string } | undefined)?.slug
        : (extra as { org?: { slug?: string } } | undefined)?.org?.slug;
    if (!slug) {
      setIsFetchingHospital(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const result = await dispatch(getHospitalBySlug(slug));
      if (cancelled) return;
      setIsFetchingHospital(false);
      const payload = result.payload as IHospitalDetail | { title?: string; description?: string };
      if (payload && 'slug' in payload && 'images' in payload) {
        const orgSource = hospitalDetailToOrgSource(payload as IHospitalDetail);
        reset(getInitialFormValues(orgSource));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch, role, extra, reset]);

  const hospitalLogo = watch('image');
  const hospitalImages = watch('images') ?? [];

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    setValue('image', file ?? null, SET_VALUE_OPTS);
    event.target.value = '';
  };

  const clearLogo = (): void => {
    setValue('image', null, SET_VALUE_OPTS);
  };

  const getLogoUrl = (): string => {
    if (!hospitalLogo) return '';
    if (typeof hospitalLogo === 'string') return hospitalLogo;
    const key = `logo-${hospitalLogo.name}-${hospitalLogo.size}`;
    if (!imageObjectUrls.has(key)) {
      const url = URL.createObjectURL(hospitalLogo);
      imageObjectUrls.set(key, url);
    }
    return imageObjectUrls.get(key) ?? '';
  };

  const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) {
      const currentImages = watch('images') ?? [];
      const remaining = Math.max(0, MAX_GALLERY_IMAGES - currentImages.length);
      const toAdd = files.slice(0, remaining);
      if (toAdd.length < files.length) {
        toast({
          title: 'Gallery limit reached',
          description: `Only ${MAX_GALLERY_IMAGES} images allowed. ${files.length - toAdd.length} image(s) not added.`,
          variant: 'destructive',
        });
      }
      if (toAdd.length > 0) {
        setValue('images', [...currentImages, ...toAdd], SET_VALUE_OPTS);
      }
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
    
    // Track the order of existing image URLs (not new File uploads)
    const imageUrls = reordered.filter((img): img is string => typeof img === 'string');
    if (imageUrls.length > 0) {
      setValue('imageOrder', imageUrls, SET_VALUE_OPTS);
    }
  };

  useEffect(() => {
    return () => {
      imageObjectUrls.forEach((url) => URL.revokeObjectURL(url));
      imageObjectUrls.clear();
    };
  }, []);

  const logoUrl = getLogoUrl();

  const onInvalid = (): void => {
    toast({
      title: 'Validation errors',
      description: 'Please fix the highlighted errors before saving.',
      variant: 'destructive',
    });
    // After re-render, scroll to first invalid field so the user sees which one failed
    setTimeout(() => {
      const firstInvalid = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

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

  const canSave = isDirty && !isLoading;

  const saveButtonRef = useRef<HTMLDivElement>(null);
  const [isSaveButtonInView, setIsSaveButtonInView] = useState(true);

  useEffect(() => {
    if (isFetchingHospital) return;
    const el = saveButtonRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSaveButtonInView(entry.isIntersecting),
      { root: null, rootMargin: '0px 0px -80px 0px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isFetchingHospital]);

  const showFloatingSave = !isSaveButtonInView && isDirty;

  if (isFetchingHospital) {
    return (
      <section>
        <div>
          <h2 className="text-2xl font-bold">Hospital Settings</h2>
          <p className="text-gray-500">Loading hospital data…</p>
        </div>
        <div className="mt-6 flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 py-12">
          <p className="text-gray-500">Loading hospital details and images…</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section>
        <div>
          <h2 className="text-2xl font-bold">Hospital Settings</h2>
          <p className="text-gray-500">Update hospital details</p>
        </div>
        <hr className="my-7 gap-4" />
        <div>
          <p className="font-medium">Hospital Logo</p>
          <span className="text-sm text-gray-500">One logo only (separate from the gallery). Click to upload or replace.</span>
        </div>
        <div className="mt-4">
          <div
            role="button"
            tabIndex={0}
            onClick={() => logoInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                logoInputRef.current?.click();
              }
            }}
            className="group relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-primary hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {logoUrl ? (
              <>
                <Image
                  src={logoUrl}
                  alt="Hospital logo"
                  fill
                  className="object-contain p-1"
                  sizes="112px"
                  draggable={false}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-sm font-medium text-white transition-colors group-hover:bg-black/40">
                  <span className="opacity-0 transition-opacity group-hover:opacity-100">Replace</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearLogo();
                  }}
                  className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Remove logo"
                >
                  <Trash2 size={12} />
                </button>
              </>
            ) : (
              <span className="text-center text-sm text-gray-500">Upload logo</span>
            )}
            <input
              accept="image/*"
              className="hidden"
              ref={logoInputRef}
              type="file"
              onChange={handleLogoChange}
            />
          </div>
        </div>

        <div className="mt-8">
          <p className="font-medium">Hospital Image Gallery</p>
          <span className="text-sm text-gray-500">
            Upload up to {MAX_GALLERY_IMAGES} images for the hospital gallery. The first image is the primary display image. Drag to reorder.
          </span>
          {hospitalImages.length >= MAX_GALLERY_IMAGES && (
            <p className="mt-1 text-sm text-amber-600">
              Maximum of {MAX_GALLERY_IMAGES} images reached. Remove one to add another.
            </p>
          )}
          {errors.images?.message && (
            <p className="mt-1 text-sm text-red-600">{errors.images.message}</p>
          )}
        </div>
        <div className="mt-4">
          <DndProvider backend={HTML5Backend}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {hospitalImages.map((image, index) => {
                const imageUrl = getImageUrl(image, index);
                const isPrimaryDisplay = index === 0;
                return (
                  <DraggableImageCard
                    key={`${index}-${typeof image === 'string' ? image : image.name}`}
                    image={image}
                    index={index}
                    isPrimaryDisplay={isPrimaryDisplay}
                    imageUrl={imageUrl}
                    onRemove={() => removeImage(index)}
                    onReorder={reorderImages}
                  />
                );
              })}
              {hospitalImages.length < MAX_GALLERY_IMAGES && (
                <div className="relative aspect-square">
                  <button
                    type="button"
                    onClick={() => imagesInputRef.current?.click()}
                    className="flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-primary transition-colors"
                  >
                    <span className="text-sm text-gray-500">
                      Add Image ({hospitalImages.length}/{MAX_GALLERY_IMAGES})
                    </span>
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
              )}
            </div>
          </DndProvider>
        </div>
      </section>
      <hr className="my-[30px]" />
      <form id="hospital-settings-form" onSubmit={handleSubmit(onSubmit, onInvalid)}>
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
                <Checkbox
                  checked={field.value ?? false}
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
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                  labelName="Telemedicine Available"
                />
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

        <div ref={saveButtonRef}>
          <Button child="Save Changes" className="me:mb-0 my-[15px] mb-24 ml-auto flex" isLoading={isLoading} disabled={!canSave} />
        </div>
      </form>
      {showFloatingSave && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Button
            type="submit"
            form="hospital-settings-form"
            child="Save Changes"
            isLoading={isLoading}
            disabled={!canSave}
            className="shadow-lg"
          />
        </div>
      )}
    </>
  );
};

export default HospitalSettings;
