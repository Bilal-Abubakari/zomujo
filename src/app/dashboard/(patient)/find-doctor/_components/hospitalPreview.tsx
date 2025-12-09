'use client';

import React, { JSX } from 'react';
import Image from 'next/image';
import {
  Building2,
  Mail,
  MapPin,
  Navigation,
  CheckCircle,
  Shield,
  CircleDollarSign,
  CalendarCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IHospital } from '@/types/hospital.interface';
import { METERS_TO_KM_FACTOR } from '@/constants/constants';
import { useRouter } from 'next/navigation';
import { MedicalAppointmentType } from '@/hooks/useQueryParam';

const HospitalPreview = (hospital: IHospital): JSX.Element => {
  const {
    name,
    id,
    location,
    email,
    specialties,
    distance,
    gpsLink,
    supportedInsurance,
    regularFee,
    image,
  } = hospital;
  const router = useRouter();

  return (
    <Card className="w-full bg-white">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {image ? (
              <Image
                src={image}
                alt={name}
                width={80}
                height={80}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="bg-primary/10 flex h-20 w-20 items-center justify-center rounded-lg">
                <Building2 size={40} className="text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-2xl font-bold">{name}</CardTitle>
              <div className="mt-2 flex items-center gap-8">
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin size={16} />
                  <span>{location}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Navigation size={16} />
                  <span>{(distance / METERS_TO_KM_FACTOR).toFixed(1)} km away</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-500" size={20} />
            <span className="font-medium text-green-500">Approved</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 font-semibold">Contact Information</h3>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail size={16} />
              <a href={`mailto:${email}`} className="text-primary hover:underline">
                {email}
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {specialties?.map((specialty, index) => (
                <Badge key={index} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Regular Fee</h3>
            <div className="flex items-center gap-2 text-gray-600">
              <CircleDollarSign size={16} />
              <span>GHC {regularFee}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-3 font-semibold">Supported Insurance</h3>
            <div className="flex flex-wrap gap-2">
              {supportedInsurance?.map((insurance, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1"
                >
                  <Shield size={14} />
                  <span className="text-sm">{insurance}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() =>
                router.push(
                  `/dashboard/book-appointment/${id}?appointmentType=${MedicalAppointmentType.Hospital}`,
                )
              }
              child={
                <>
                  <CalendarCheck size={14} />
                  Book Appointment
                </>
              }
            />
          </div>
        </div>
        <div className="mt-8 flex">
          <Button
            onClick={() => {
              router.push(
                `/dashboard/book-appointment/${id}?appointmentType=${MedicalAppointmentType.Hospital}`,
              );
            }}
            child={
              <>
                <CalendarCheck size={14} />
                Book Appointment
              </>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default HospitalPreview;
