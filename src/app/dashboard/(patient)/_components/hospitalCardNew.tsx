'use client';
import { MapPin, X, MoreVertical, Clock, Globe, BedDouble } from 'lucide-react';
import Image from 'next/image';
import React, { JSX, useState } from 'react';
import { IHospitalListItem } from '@/types/hospital.interface';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Logo } from '@/assets/images';

interface HospitalCardProps {
  hospital: IHospitalListItem;
}

const HospitalCard = ({ hospital }: HospitalCardProps): JSX.Element => {
  const [showPreview, setShowPreview] = useState(false);
  const router = useRouter();
  const {
    name,
    slug,
    organizationType,
    hasEmergency,
    telemedicine,
    primaryAddress,
    images,
    bedCount,
  } = hospital;

  // Primary display = first gallery image (type 'photo') sorted by displayOrder; logo = type 'logo'
  const galleryImages = (images?.filter((img) => img.type === 'photo') ?? []).sort((a, b) => {
    const orderA = (a.meta as { displayOrder?: number })?.displayOrder ?? 999;
    const orderB = (b.meta as { displayOrder?: number })?.displayOrder ?? 999;
    return orderA - orderB;
  });
  const primaryImage = galleryImages.length > 0 ? galleryImages[0] : null;
  const logoImage = images?.find((img) => img.type === 'logo') ?? null;

  const handleViewDetails = () => {
    if (!slug) {
      console.error('Hospital slug is missing');
      return;
    }
    router.push(`/dashboard/find-hospitals/${slug}`);
  };

  const getOrganizationTypeLabel = (type?: string) => {
    switch (type) {
      case 'private':
        return 'Private Hospital';
      case 'public':
        return 'Public Hospital';
      case 'teaching':
        return 'Teaching Hospital';
      case 'clinic':
        return 'Clinic';
      default:
        return 'Hospital';
    }
  };

  return (
    <>
      {showPreview && primaryImage && (
        <button
          type="button"
          className="fixed inset-0 z-50 flex cursor-default items-center justify-center border-0 bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setShowPreview(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Escape') {
              e.preventDefault();
              setShowPreview(false);
            }
          }}
          aria-label="Close preview"
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="absolute -top-4 -right-4 z-10 rounded-full bg-white p-2 shadow-lg transition-all hover:scale-110"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <Image
              src={primaryImage.url}
              alt={name}
              width={800}
              height={600}
              className="rounded-lg object-contain shadow-2xl"
            />
          </div>
        </button>
      )}

      <div className="group relative flex w-full max-w-full flex-shrink-0 flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 select-none hover:-translate-y-1 hover:shadow-xl sm:max-w-[350px] sm:rounded-3xl md:max-w-[380px]">
        {/* Image Section with Frosted Glass Overlay */}
        <div className="relative h-[240px] w-full overflow-hidden sm:h-[290px] md:h-[350px]">
          {primaryImage ? (
            <button
              type="button"
              className="relative h-full w-full cursor-pointer border-0 bg-transparent p-0 text-left"
              onClick={() => setShowPreview(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowPreview(true);
                }
              }}
            >
              <Image
                src={primaryImage.url}
                alt={name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </button>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 p-8">
              <Image
                src={Logo}
                alt="Fornix Link"
                className="h-auto w-full max-w-[180px] object-contain"
              />
            </div>
          )}

          {/* Logo - Top Left of primary image */}
          {logoImage && (
            <div className="absolute top-4 left-4 z-20">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-white shadow-lg sm:h-11 sm:w-11 md:h-12 md:w-12">
                <Image
                  src={logoImage.url}
                  alt={`${name} logo`}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            </div>
          )}

          {/* Ellipsis Menu - Top Right */}
          <div className="absolute top-4 right-4 z-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/95 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:bg-white hover:shadow-xl">
                  <MoreVertical size={20} className="text-gray-800" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleViewDetails}>View Details</DropdownMenuItem>
                {primaryAddress?.city && (
                  <DropdownMenuItem
                    onClick={() => {
                      const query = encodeURIComponent(
                        `${name} ${primaryAddress.city} ${primaryAddress.state || ''}`,
                      );
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${query}`,
                        '_blank',
                      );
                    }}
                  >
                    Open in Maps
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Frosted Glass Overlay with Content - Bottom 55% */}
          <div className="absolute right-0 bottom-0 left-0 z-10 h-[55%] overflow-hidden">
            {/* Solid white background layer extending slightly beyond to cover rounded corners */}
            <div className="absolute top-0 -right-1 -bottom-1 -left-1 rounded-b-2xl bg-white sm:rounded-b-3xl"></div>

            {/* Frosted Glass Background with gradient overlay */}
            <div
              className="relative h-full rounded-b-2xl sm:rounded-b-3xl"
              style={{
                background:
                  'linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) 30%, rgba(255, 255, 255, 0.95) 60%, rgba(255, 255, 255, 0.85) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              }}
            >
              {/* Content on Frosted Glass */}
              <div className="relative z-20 flex h-full flex-col justify-between px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4">
                {/* Top Section - Hospital name */}
                <div className="flex min-h-[3em] min-w-0 flex-1 flex-col justify-center">
                  <h3 className="line-clamp-2 text-base leading-snug font-bold break-words text-gray-900 sm:text-lg">
                    {name}
                  </h3>
                </div>

                {/* Bottom Section - Location, Button, and Badges */}
                <div className="flex-shrink-0 space-y-1.5 pt-1.5 sm:space-y-2">
                  {/* Location Row */}
                  {primaryAddress && (primaryAddress.city || primaryAddress.state) && (
                    <div className="flex min-w-0 items-center gap-1.5 text-xs text-gray-700 sm:text-sm">
                      <MapPin
                        size={12}
                        className="flex-shrink-0 text-gray-500 sm:h-[14px] sm:w-[14px]"
                      />
                      <span className="truncate font-medium">
                        {primaryAddress.city || primaryAddress.state}
                      </span>
                    </div>
                  )}

                  {/* Bottom Row - Organization Type Button and Feature Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {/* Organization Type Tag */}
                    <span className="flex-shrink-0 rounded-xl border-2 border-green-300 bg-green-50 px-2.5 py-1.5 text-[10px] font-semibold whitespace-nowrap text-green-700 shadow-sm sm:px-3 sm:py-2 sm:text-xs">
                      {getOrganizationTypeLabel(organizationType)}
                    </span>

                    {/* Feature Badges */}
                    {(hasEmergency || telemedicine || bedCount) && (
                      <div className="flex flex-1 flex-wrap items-center justify-end gap-1 overflow-visible sm:gap-1.5">
                        {hasEmergency && (
                          <span className="flex flex-shrink-0 items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-semibold whitespace-nowrap text-red-700 sm:gap-1 sm:px-2 sm:py-1 sm:text-[10px]">
                            <Clock size={9} className="sm:h-[10px] sm:w-[10px]" />
                            24/7
                          </span>
                        )}
                        {telemedicine && (
                          <span className="flex flex-shrink-0 items-center gap-0.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] font-semibold whitespace-nowrap text-green-700 sm:gap-1 sm:px-2 sm:py-1 sm:text-[10px]">
                            <Globe size={9} className="sm:h-[10px] sm:w-[10px]" />
                            Virtual
                          </span>
                        )}
                        {bedCount && (
                          <span className="flex flex-shrink-0 items-center gap-0.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-semibold whitespace-nowrap text-blue-700 sm:gap-1 sm:px-2 sm:py-1 sm:text-[10px]">
                            <BedDouble size={9} className="sm:h-[10px] sm:w-[10px]" />
                            {bedCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HospitalCard;
