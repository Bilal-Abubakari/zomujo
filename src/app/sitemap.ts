import type { MetadataRoute } from 'next';
import { BRANDING } from '@/constants/branding.constant';
import { IDoctor } from '@/types/doctor.interface';
import { IPagination } from '@/types/shared.interface';
const BASE_URL = BRANDING.APP_URL;
interface DoctorSitemapData {
  id: string;
  updatedAt: Date;
}

function safeDate(value: Date | string | undefined): Date {
  const parsed = new Date(value as string);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

async function fetchPublicDoctors(): Promise<DoctorSitemapData[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/doctors?pageSize=500&page=1`, {
      next: { revalidate: 86400 },
    });
    if (!response.ok) {
      return [];
    }
    const json = (await response.json()) as { data: IPagination<IDoctor> };
    return json.data.rows.map((doctor) => ({
      id: doctor.id,
      updatedAt: safeDate(doctor.updatedAt),
    }));
  } catch {
    return [];
  }
}
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms-conditions`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cookie-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
  const doctors = await fetchPublicDoctors();
  const doctorRoutes: MetadataRoute.Sitemap = doctors.map((doctor) => ({
    url: `${BASE_URL}/doctor/${doctor.id}`,
    lastModified: doctor.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  return [...staticRoutes, ...doctorRoutes];
}
