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
  Clock,
  Stethoscope,
  Shield,
  Tag,
  ChevronLeft,
  Calendar,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import SkeletonDoctorPatientCard from '@/components/skeleton/skeletonDoctorPatientCard';
import { MedicalAppointmentType } from '@/hooks/useQueryParam';

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
    departments,
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

  return (
    <div className="flex flex-col gap-6">
      <Button
        onClick={() => router.back()}
        variant="ghost"
        child={
          <>
            <ChevronLeft size={16} />
            Back
          </>
        }
        className="w-fit"
      />

      {/* Header Section */}
      <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row">
          {logoImage && (
            <div className="relative h-32 w-32 shrink-0">
              <Image src={logoImage.url} alt={name} fill className="rounded-lg object-cover" />
            </div>
          )}
          <div className="flex flex-1 flex-col gap-2">
            <h1 className="text-3xl font-bold">{name}</h1>
            {description && <p className="text-gray-600">{description}</p>}
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                {organizationType}
              </span>
              {hasEmergency && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                  Emergency Services
                </span>
              )}
              {telemedicine && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  Telemedicine Available
                </span>
              )}
              {bedCount && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
                  {bedCount} Beds
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 md:grid-cols-3">
          {mainPhone && (
            <div className="flex items-center gap-2">
              <Phone size={18} className="text-gray-400" />
              <span className="text-sm">{mainPhone}</span>
            </div>
          )}
          {mainEmail && (
            <div className="flex items-center gap-2">
              <Mail size={18} className="text-gray-400" />
              <span className="text-sm">{mainEmail}</span>
            </div>
          )}
          {/* website removed per UI requirements */}
        </div>
      </div>

      {/* Images Gallery */}
      {photoImages.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold">Photos</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {photoImages.map((img) => (
              <div key={img.id} className="relative aspect-square">
                <Image src={img.url} alt={name} fill className="rounded-lg object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Addresses */}
      {addresses && addresses.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <MapPin size={20} />
            Locations
          </h2>
          <div className="flex flex-col gap-4">
            {addresses.map((address) => (
              <div key={address.id} className="rounded-lg border border-gray-100 p-4">
                {address.label && <h3 className="mb-2 font-semibold">{address.label}</h3>}
                <div className="flex flex-col gap-1 text-sm text-gray-600">
                  {address.street && <p>{address.street}</p>}
                  <p>
                    {[address.city, address.state, address.postalCode].filter(Boolean).join(', ')}
                  </p>
                  {address.country && <p>{address.country}</p>}
                  {address.phone && (
                    <p className="mt-2 flex items-center gap-2">
                      <Phone size={14} />
                      {address.phone}
                    </p>
                  )}
                </div>
                {address.city && (
                  <Button
                    onClick={() =>
                      router.push(
                        `/dashboard/book-appointment/${hospital?.id}?appointmentType=${MedicalAppointmentType.Hospital}`,
                      )
                    }
                    variant="outline"
                    child="Book Appointment"
                    className="mt-2 w-fit"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opening Hours */}
      {openingHours && openingHours.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Clock size={20} />
            Opening Hours
          </h2>
          <div className="flex flex-col gap-2">
            {openingHours.map((hour) => (
              <div
                key={hour.id}
                className="flex items-center justify-between border-b border-gray-100 py-2"
              >
                <span className="font-medium capitalize">{hour.weekday}</span>
                <span className="text-gray-600">
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
      )}

      {/* Services */}
      {services && services.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Stethoscope size={20} />
            Services
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {services.map((service) => (
              <div key={service.id} className="rounded-lg border border-gray-100 p-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{service.service.name}</h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      service.availability === 'available'
                        ? 'bg-green-100 text-green-800'
                        : service.availability === 'limited'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {service.availability}
                  </span>
                </div>
                {service.service.description && (
                  <p className="mt-1 text-sm text-gray-600">{service.service.description}</p>
                )}
                {service.notes && <p className="mt-2 text-xs text-gray-500">{service.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Departments */}
      {departments && departments.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold">Departments</h2>
          <div className="flex flex-wrap gap-2">
            {departments.map((dept) => (
              <span
                key={dept.id}
                className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
              >
                {dept.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Amenities */}
      {amenities && amenities.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold">Amenities</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {amenities.map((amenity) => (
              <div key={amenity.id} className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-600" />
                <span className="text-sm">{amenity.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insurance Networks */}
      {insuranceNetworks && insuranceNetworks.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Shield size={20} />
            Accepted Insurance
          </h2>
          <div className="flex flex-wrap gap-3">
            {insuranceNetworks.map((network) => (
              <div
                key={network.id}
                className="flex items-center gap-2 rounded-lg border border-gray-100 p-3"
              >
                {network.insuranceCompany.logo && (
                  <Image
                    src={network.insuranceCompany.logo}
                    alt={network.insuranceCompany.name}
                    width={40}
                    height={40}
                    className="rounded"
                  />
                )}
                <div className="flex flex-col">
                  <span className="font-medium">{network.insuranceCompany.name}</span>
                  {network.planNotes && (
                    <span className="text-xs text-gray-500">{network.planNotes}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold">Languages Spoken</h2>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang, index) => (
              <span
                key={index}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Tag size={20} />
            Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Accreditations */}
      {accreditations && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold">Accreditations</h2>
          <div className="text-sm text-gray-600">
            {Array.isArray(accreditations) ? (
              <ul className="list-inside list-disc space-y-1">
                {accreditations.map((acc: any, index: number) => (
                  <li key={index}>
                    {typeof acc === 'string' ? acc : acc.name || JSON.stringify(acc)}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{JSON.stringify(accreditations)}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalDetail;
