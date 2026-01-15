'use client';
import { MapPin, ExternalLink, Building2, X, Phone, Globe, Mail, MoreVertical, Clock, BedDouble } from 'lucide-react';
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

interface HospitalCardProps {
  hospital: IHospitalListItem;
}

const HospitalCard = ({ hospital }: HospitalCardProps): JSX.Element => {
  const [showPreview, setShowPreview] = useState(false);
  const router = useRouter();
  const { name, slug, description, organizationType, hasEmergency, telemedicine, primaryAddress, images, mainPhone, website, mainEmail, bedCount } = hospital;

  const primaryImage = images && images.length > 0 ? images[0] : null;

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

      <div className="group relative flex w-[300px] flex-shrink-0 flex-col overflow-hidden rounded-3xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] sm:w-[350px] md:w-[380px]">
        {/* Image Section with Frosted Glass Overlay */}
        <div className="relative h-[280px] w-full overflow-hidden">
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
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100">
              <Building2 size={80} className="text-purple-400" />
            </div>
          )}

          {/* Ellipsis Menu Button - Top Right */}
          <div className="absolute top-4 right-4 z-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 backdrop-blur-md shadow-lg transition-all hover:bg-white hover:scale-110 hover:shadow-xl">
                  <MoreVertical size={20} className="text-gray-800" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleViewDetails}>
                  View Details
                </DropdownMenuItem>
                {website && (
                  <DropdownMenuItem
                    onClick={() => window.open(website, '_blank')}
                  >
                    Visit Website
                  </DropdownMenuItem>
                )}
                {mainPhone && (
                  <DropdownMenuItem
                    onClick={() => window.open(`tel:${mainPhone}`, '_self')}
                  >
                    Call Hospital
                  </DropdownMenuItem>
                )}
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

          {/* Frosted Glass Overlay with Content - Bottom Portion */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            {/* Frosted Glass Background with stronger blur */}
            <div 
              className="relative overflow-hidden"
              style={{
                background: 'linear-gradient(to top, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 40%, rgba(255, 255, 255, 0.85) 70%, rgba(255, 255, 255, 0.75) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              }}
            >
              {/* Content on Frosted Glass */}
              <div className="p-6">
                {/* Title */}
                <h3 className="mb-2.5 text-2xl font-bold text-gray-900 line-clamp-2 leading-tight">
                  {name}
                </h3>

                {/* Description */}
                {description && (
                  <p className="mb-5 text-sm leading-relaxed text-gray-700 line-clamp-2">
                    {description}
                  </p>
                )}

                {/* Action Button and Metadata Row */}
                <div className="flex items-center justify-between gap-3">
                  {/* Purple/Lavender Button */}
                  <button
                    onClick={handleViewDetails}
                    className="rounded-xl border-2 border-purple-300 bg-purple-50 px-5 py-2.5 text-sm font-semibold text-purple-700 shadow-sm transition-all hover:border-purple-400 hover:bg-purple-100 hover:shadow-md active:scale-95"
                  >
                    {getOrganizationTypeLabel(organizationType)}
                  </button>

                  {/* Metadata - Location and Features */}
                  <div className="flex flex-col items-end gap-1.5">
                    {primaryAddress && (primaryAddress.city || primaryAddress.state) && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={12} />
                        <span>{primaryAddress.city || primaryAddress.state}</span>
                      </div>
                    )}
                    {(hasEmergency || telemedicine || bedCount) && (
                      <div className="flex items-center gap-1.5">
                        {hasEmergency && (
                          <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-700">
                            <Clock size={9} />
                            24/7
                          </span>
                        )}
                        {telemedicine && (
                          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[10px] font-semibold text-green-700">
                            <Globe size={9} />
                            Virtual
                          </span>
                        )}
                        {bedCount && (
                          <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold text-blue-700">
                            <BedDouble size={9} />
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

