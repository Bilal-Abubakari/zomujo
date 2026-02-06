'use client';
import React, { JSX, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { getHospitalBySlug } from '@/lib/features/hospitals/hospitalThunk';
import { useAppDispatch } from '@/lib/hooks';
import { showErrorToast } from '@/lib/utils';
import { IHospitalDetail } from '@/types/hospital.interface';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Stethoscope,
  Shield,
  Tag,
  ChevronLeft,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import SkeletonDoctorPatientCard from '@/components/skeleton/skeletonDoctorPatientCard';
import ReviewSection from './reviewSection';

interface HospitalDetailProps {
  slug: string;
}

const HospitalDetail = ({ slug }: HospitalDetailProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [hospital, setHospital] = useState<IHospitalDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHospital(): Promise<void> {
      setIsLoading(true);
      const { payload } = await dispatch(getHospitalBySlug(slug));

      if (payload && showErrorToast(payload)) {
        toast(payload);
        setIsLoading(false);
        return;
      }
      setHospital(payload as IHospitalDetail);
      setIsLoading(false);
    }

    void fetchHospital();
  }, [slug, dispatch]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <SkeletonDoctorPatientCard />
        <SkeletonDoctorPatientCard />
        <SkeletonDoctorPatientCard />
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-gray-600">Hospital not found</p>
        <Button onClick={() => router.back()} child="Go Back" className="mt-4" />
      </div>
    );
  }

  const {
    name,
    description,
    organizationType,
    hasEmergency,
    telemedicine,
    bedCount,
    languages,
    accreditations,
    primaryAddress,
    addresses,
    images,
    services,
    amenities,
    tags,
    openingHours,
    insuranceNetworks,
    mainPhone,
    mainEmail,
    website,
  } = hospital;

  const logoImage = images?.find((img) => img.type === 'logo');
  const photoImages = images?.filter((img) => img.type === 'photo') || [];

  // Map known insurance companies to their static logo assets in /public/images/insurance
  const insuranceLogoMap: Record<string, string> = {
    nhis: '/images/insurance/nhis.jpeg',
    acacia: '/images/insurance/acacia.jpeg',
    ace: '/images/insurance/ace.png',
    apex: '/images/insurance/apex.png',
    cosmopolitan: '/images/insurance/cosmopolitan.jpeg',
    dosh: '/images/insurance/dosh.jpeg',
    equity: '/images/insurance/equity.jpeg',
    glico: '/images/insurance/glico.png',
  };

  // Map known accreditation bodies to their logo assets
  const accreditationLogoMap: Record<string, string> = {
    'ministry of health': '/images/insurance/moh.jpeg',
    'medical council': '/images/insurance/medicalcouncil.jpeg',
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Back Button - Positioned at top left of content */}
      <div className="mb-2">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          child={
            <>
              <ChevronLeft size={18} />
              <span>Back</span>
            </>
          }
          className="w-fit text-gray-600 hover:text-gray-900"
        />
      </div>

      {/* Header Section */}
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
        {/* Hero Section with Gradient Background - Inspired by Card */}
        <div className="relative bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 px-4 py-6 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {logoImage && (
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border-4 border-white">
                <Image
                  src={logoImage.url}
                  alt={name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col gap-4">
              <div>
                <h1 className="mb-3 text-4xl font-bold text-gray-900">{name}</h1>
                {description && (
                  <p className="text-lg leading-relaxed text-gray-700 max-w-3xl">
                    {description}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-xl border-2 border-purple-300 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 capitalize">
                  {organizationType}
                </span>
                {hasEmergency && (
                  <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm border border-red-200">
                    <Clock size={14} />
                    24/7
                  </span>
                )}
                {telemedicine && (
                  <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 shadow-sm border border-green-200">
                    <Globe size={14} />
                    Virtual
                  </span>
                )}
                {bedCount && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm border border-blue-200">
                    <Building2 size={14} />
                    {bedCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information - Enhanced */}
        <div className="grid grid-cols-1 gap-6 border-t border-gray-100 bg-white px-8 py-6 md:grid-cols-3">
          {mainPhone && (
            <a
              href={`tel:${mainPhone}`}
              className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-200">
                <Phone size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-500">Phone</span>
                <span className="text-sm font-semibold text-gray-900">{mainPhone}</span>
              </div>
            </a>
          )}
          {mainEmail && (
            <a
              href={`mailto:${mainEmail}`}
              className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 transition-colors group-hover:bg-green-200">
                <Mail size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-500">Email</span>
                <span className="text-sm font-semibold text-gray-900 truncate">{mainEmail}</span>
              </div>
            </a>
          )}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 transition-colors group-hover:bg-purple-200">
                <Globe size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-500">Website</span>
                <span className="text-sm font-semibold text-purple-600 group-hover:underline">
                  Visit Website
                </span>
              </div>
            </a>
          )}
        </div>
      </div>

      {/* Images Gallery */}
      {photoImages.length > 0 && (
        <div className="rounded-3xl border border-gray-200 bg-white p-8 pr-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Tag size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Photos</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {photoImages.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square overflow-hidden rounded-3xl"
              >
                <Image
                  src={img.url}
                  alt={name}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Addresses */}
      {addresses && addresses.length > 0 && (
        <div className="rounded-3xl border border-gray-200 bg-white p-8 pr-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <MapPin size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Locations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6"
              >
                {address.label && (
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">{address.label}</h3>
                )}
                <div className="mb-4 flex flex-col gap-2 text-sm text-gray-700">
                  {address.street && (
                    <p className="flex items-start gap-2">
                      <MapPin size={16} className="mt-0.5 text-gray-400" />
                      <span>{address.street}</span>
                    </p>
                  )}
                  <p className="flex items-start gap-2">
                    <span className="w-4"></span>
                    {[address.city, address.state, address.postalCode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {address.country && (
                    <p className="flex items-start gap-2">
                      <span className="w-4"></span>
                      {address.country}
                    </p>
                  )}
                  {address.phone && (
                    <p className="mt-2 flex items-center gap-2 text-gray-600">
                      <Phone size={16} className="text-gray-400" />
                      {address.phone}
                    </p>
                  )}
                </div>
                {address.city && (
                  <button
                    onClick={() => {
                      const query = encodeURIComponent(
                        `${name} ${address.street || ''} ${address.city} ${address.state || ''}`,
                      );
                      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                    }}
                    className="rounded-xl border-2 border-purple-300 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm transition-all hover:border-purple-400 hover:bg-purple-100 hover:shadow-md active:scale-95 flex items-center gap-2 w-fit"
                  >
                    <MapPin size={16} />
                    <span>Open in Maps</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opening Hours */}
      {openingHours && openingHours.length > 0 && (
        <div className="rounded-3xl border border-gray-200 bg-white p-8 pr-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Clock size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Opening Hours</h2>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-col gap-3">
              {openingHours.map((hour) => (
                <div
                  key={hour.id}
                  className="flex items-center justify-between rounded-lg bg-white px-4 py-3"
                >
                  <span className="capitalize font-semibold text-gray-900">{hour.weekday}</span>
                  <span
                    className={`font-medium ${
                      hour.isClosed
                        ? 'text-red-600'
                        : hour.is24Hours
                          ? 'text-green-600'
                          : 'text-gray-700'
                    }`}
                  >
                    {hour.isClosed
                      ? 'Closed'
                      : hour.is24Hours
                        ? '24 Hours'
                        : hour.openTime && hour.closeTime
                          ? `${hour.openTime} - ${hour.closeTime}`
                          : 'Hours vary'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Services */}
      {services && services.length > 0 && (
        <div className="rounded-3xl border border-gray-200 bg-white p-8 pr-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <Stethoscope size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Services</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {services.map((service) => (
              <div
                key={service.id}
                className="rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{service.service.name}</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      service.availability === 'available'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : service.availability === 'limited'
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {service.availability}
                  </span>
                </div>
                {service.service.description && (
                  <p className="mb-2 text-sm leading-relaxed text-gray-600">
                    {service.service.description}
                  </p>
                )}
                {service.notes && (
                  <p className="mt-3 rounded-lg bg-blue-50 p-2 text-xs text-blue-700 border border-blue-100">
                    {service.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amenities */}
      {amenities && amenities.length > 0 && (
        <div className="rounded-3xl border border-gray-200 bg-white p-8 pr-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Amenities</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {amenities.map((amenity) => (
              <div
                key={amenity.id}
                className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white px-4 py-3"
              >
                <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insurance Networks */}
      {insuranceNetworks && insuranceNetworks.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Shield size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Accepted Insurance</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {insuranceNetworks.map((network) => {
              const codeKey = network.insuranceCompany.code?.toLowerCase() || '';
              const nameKey = network.insuranceCompany.name?.toLowerCase() || '';
              const mappedLogo =
                insuranceLogoMap[codeKey] || insuranceLogoMap[nameKey];
              const logoSrc = mappedLogo || network.insuranceCompany.logo;
              const isPrivateGroup =
                nameKey === 'private health insurance' || codeKey === 'private';

              // Special handling: for the generic "Private Health Insurance" entry,
              // show all the specific private insurance logos so users see the exact insurers.
              if (isPrivateGroup) {
                const privateInsurers = [
                  { key: 'acacia', label: 'Acacia Health Insurance Limited' },
                  { key: 'ace', label: 'Ace Medical Insurance' },
                  { key: 'apex', label: 'Apex Health Insurance Limited' },
                  { key: 'cosmopolitan', label: 'Cosmopolitan Health Insurance Limited' },
                  { key: 'dosh', label: 'Dosh Health Insurance Company Ltd' },
                  { key: 'equity', label: 'Equity Health Insurance Limited' },
                  { key: 'glico', label: 'GLICO Healthcare Limited' },
                ];

                return (
                  <div
                    key={network.id}
                    className="flex flex-col gap-3 rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4"
                  >
                    <span className="font-semibold text-gray-900">
                      Private Health Insurance
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {privateInsurers.map((insurer) => {
                        const src = insuranceLogoMap[insurer.key];
                        return (
                          <div
                            key={insurer.key}
                            className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2"
                          >
                            {src && (
                              <div className="relative h-8 w-8 overflow-hidden rounded-md bg-white">
                                <Image
                                  src={src}
                                  alt={insurer.label}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            )}
                            <span className="text-xs font-medium text-gray-700">
                              {insurer.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {network.planNotes && (
                      <span className="mt-1 text-xs text-gray-500">
                        {network.planNotes}
                      </span>
                    )}
                  </div>
                );
              }

              // Default: show the single insurer with its logo
              return (
                <div
                  key={network.id}
                  className="flex items-center gap-4 rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4"
                >
                  {logoSrc && (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 border-gray-200 bg-white p-1">
                      <Image
                        src={logoSrc}
                        alt={network.insuranceCompany.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col">
                    <span className="font-semibold text-gray-900">
                      {network.insuranceCompany.name}
                    </span>
                    {network.planNotes && (
                      <span className="mt-1 text-xs text-gray-500">
                        {network.planNotes}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Accreditations */}
      {accreditations && (() => {
        // Parse accreditations - handle both object with accreditations array and direct array
        let accreditationsList: any[] = [];
        
        if (Array.isArray(accreditations)) {
          accreditationsList = accreditations;
        } else if (typeof accreditations === 'object' && accreditations !== null) {
          // Check if it's an object with an accreditations property
          if ('accreditations' in accreditations && Array.isArray((accreditations as any).accreditations)) {
            accreditationsList = (accreditations as any).accreditations;
          } else {
            // Try to parse as JSON string if it's a string
            try {
              const parsed = typeof accreditations === 'string' ? JSON.parse(accreditations) : accreditations;
              if (parsed && parsed.accreditations && Array.isArray(parsed.accreditations)) {
                accreditationsList = parsed.accreditations;
              } else if (Array.isArray(parsed)) {
                accreditationsList = parsed;
              }
            } catch {
              // If parsing fails, treat as single item
              accreditationsList = [accreditations];
            }
          }
        }

        if (accreditationsList.length === 0) return null;

        return (
          <div className="rounded-3xl border border-gray-200 bg-white p-8 pr-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                <Shield size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Accreditations</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {accreditationsList.map((acc: any, index: number) => {
                const body =
                  acc.body ||
                  acc.name ||
                  acc.title ||
                  (typeof acc === 'string' ? acc : 'Accreditation');
                const date = acc.date || acc.issuedDate || acc.year;
                const bodyKey = typeof body === 'string' ? body.toLowerCase() : '';
                const logoSrc = accreditationLogoMap[bodyKey];
                
                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-teal-50 p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-600 transition-colors group-hover:bg-teal-200 overflow-hidden">
                        {logoSrc ? (
                          <Image
                            src={logoSrc}
                            alt={body}
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        ) : (
                          <CheckCircle2 size={20} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{body}</h3>
                        {date && (
                          <p className="mt-1 text-sm text-gray-600">
                            {new Date(date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Review Section */}
      <ReviewSection hospitalName={name} />
    </div>
  );
};

export default HospitalDetail;

