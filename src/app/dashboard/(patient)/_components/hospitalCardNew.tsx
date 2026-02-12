'use client';
import { MapPin, X, MoreVertical, Clock, Globe, BedDouble } from 'lucide-react';
import Image from 'next/image';
import React, { JSX, useState } from 'react';
import { Button } from '@/components/ui/button';
import { IHospitalListItem } from '@/types/hospital.interface';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
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
  const { name, slug, organizationType, hasEmergency, telemedicine, primaryAddress, images, bedCount } = hospital;

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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute -top-4 -right-4 z-10 rounded-full bg-white p-2 shadow-lg transition-all hover:scale-110"
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
        </div>
      )}

      <div className="group relative flex w-full max-w-full sm:max-w-[350px] md:max-w-[380px] flex-shrink-0 flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 select-none">
        {/* Image Section with Frosted Glass Overlay */}
        <div className="relative h-[240px] sm:h-[290px] md:h-[350px] w-full overflow-hidden">
          {primaryImage ? (
            <div className="relative h-full w-full cursor-pointer" onClick={() => setShowPreview(true)}>
              <Image
                src={primaryImage.url}
                alt={name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 p-8">
              <Image src={Logo} alt="Fornix Link" className="h-auto w-full max-w-[180px] object-contain" />
            </div>
          )}

          {/* Ellipsis Menu Button - Top Right */}
          <div className="absolute top-4 right-4 z-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 backdrop-blur-md shadow-lg transition-all hover:bg-white hover:scale-110 hover:shadow-xl cursor-pointer">
                  <MoreVertical size={20} className="text-gray-800" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleViewDetails}>
                  View Details
                </DropdownMenuItem>
                {primaryAddress && primaryAddress.city && (
                  <DropdownMenuItem
                    onClick={() => {
                      const query = encodeURIComponent(`${name} ${primaryAddress.city} ${primaryAddress.state || ''}`);
                      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                    }}
                  >
                    Open in Maps
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Frosted Glass Overlay with Content - Bottom 55% */}
          <div className="absolute bottom-0 left-0 right-0 z-10 h-[55%] overflow-hidden">
            {/* Solid white background layer extending slightly beyond to cover rounded corners */}
            <div className="absolute -bottom-1 -left-1 -right-1 top-0 bg-white rounded-b-2xl sm:rounded-b-3xl"></div>
            
            {/* Frosted Glass Background with gradient overlay */}
            <div 
              className="relative h-full rounded-b-2xl sm:rounded-b-3xl"
              style={{
                background: 'linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) 30%, rgba(255, 255, 255, 0.95) 60%, rgba(255, 255, 255, 0.85) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              }}
            >
              {/* Content on Frosted Glass */}
              <div className="flex h-full flex-col justify-between px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 relative z-20">
                {/* Top Section - Hospital name (left) and logo (right) */}
                <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0 min-h-[3em]">
                  <h3 className="flex-1 min-w-0 text-base sm:text-lg font-bold text-gray-900 line-clamp-2 leading-snug break-words pt-0.5">
                    {name}
                  </h3>
                  {logoImage && (
                    <div className="relative h-12 w-12 sm:h-14 sm:w-14 md:h-[56px] md:w-[56px] rounded-full overflow-hidden border-2 border-white shadow-lg bg-white flex-shrink-0">
                      <Image
                        src={logoImage.url}
                        alt={`${name} logo`}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                  )}
                </div>

                {/* Bottom Section - Location, Button, and Badges */}
                <div className="space-y-1.5 sm:space-y-2 pt-1.5 flex-shrink-0">
                  {/* Location Row */}
                  {primaryAddress && (primaryAddress.city || primaryAddress.state) && (
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-700 min-w-0">
                      <MapPin size={12} className="text-gray-500 flex-shrink-0 sm:w-[14px] sm:h-[14px]" />
                      <span className="font-medium truncate">{primaryAddress.city || primaryAddress.state}</span>
                    </div>
                  )}

                  {/* Bottom Row - Organization Type Button and Feature Badges */}
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    {/* Organization Type Tag */}
                    <span className="rounded-xl border-2 border-green-300 bg-green-50 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-semibold text-green-700 shadow-sm whitespace-nowrap flex-shrink-0">
                      {getOrganizationTypeLabel(organizationType)}
                    </span>

                    {/* Feature Badges */}
                    {(hasEmergency || telemedicine || bedCount) && (
                      <div className="flex items-center gap-1 sm:gap-1.5 flex-1 justify-end overflow-visible flex-wrap">
                        {hasEmergency && (
                          <span className="flex items-center gap-0.5 sm:gap-1 rounded-full bg-red-100 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-semibold text-red-700 whitespace-nowrap flex-shrink-0">
                            <Clock size={9} className="sm:w-[10px] sm:h-[10px]" />
                            24/7
                          </span>
                        )}
                        {telemedicine && (
                          <span className="flex items-center gap-0.5 sm:gap-1 rounded-full bg-green-100 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-semibold text-green-700 whitespace-nowrap flex-shrink-0">
                            <Globe size={9} className="sm:w-[10px] sm:h-[10px]" />
                            Virtual
                          </span>
                        )}
                        {bedCount && (
                          <span className="flex items-center gap-0.5 sm:gap-1 rounded-full bg-blue-100 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-semibold text-blue-700 whitespace-nowrap flex-shrink-0">
                            <BedDouble size={9} className="sm:w-[10px] sm:h-[10px]" />
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

