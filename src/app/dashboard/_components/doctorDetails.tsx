'use client';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { GraduationCap } from 'lucide-react';
import { IDoctor } from '@/types/doctor.interface';
import { JSX } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Bookmark extends IDoctor {
  showBookmark?: boolean;
}

const DoctorDetails = ({
  profilePicture,
  firstName,
  lastName,
  MDCRegistration,
  experience,
  specializations,
  bio,
  education,
  rate,
  languages,
  awards,
  IDs: { back, front },
  showBookmark = false,
  fee,
  id,
}: Bookmark): JSX.Element => {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-[30px] md:flex-row">
      <section className="max-w-[284px]">
        <Image
          src={profilePicture}
          alt="DoctorImage"
          className="h-[258px] w-[284px] rounded-[32px] object-cover"
          width={400}
          height={400}
        />

        <div className="mt-[38px] flex items-center justify-between">
          <p className="font-medium"> Consultation</p>

          {rate && (
            <p className="text-xl font-bold text-primary">
              GHs {fee?.amount} <span className="text-base text-gray-400">Fee</span>
            </p>
          )}
        </div>
      </section>
      <section className="w-full">
        <div>
          <p className="text-2xl font-bold">
            Dr. {firstName} {lastName}
          </p>
          <div className="flex justify-between">
            <p className="mt-4 font-medium text-gray-500"> {MDCRegistration}</p>
            {showBookmark && (
              <Button
                child="Book Appointment"
                onClick={() => router.push(`/dashboard/book-appointment/${id}`)}
              />
            )}
          </div>
          {experience > 0 && (
            <div className="mt-8 flex gap-6 font-semibold">
              <p> 💼 {experience} years of experience</p>
              <p>🤩 200+ Consultations</p>
            </div>
          )}
        </div>
        <div className="mt-6 flex-wrap">
          {specializations.map((specialization) => (
            <Badge variant={'gray'} key={specialization} className="mb-2 mr-2">
              {specialization}
            </Badge>
          ))}
        </div>

        <div>
          <hr className="my-8" />
          {bio && (
            <div>
              <h3 className="text-xl font-bold">Bio</h3>
              <p className="mt-6 text-gray-500">{bio}</p>
            </div>
          )}
          {education && (
            <div>
              <h3 className="mt-12 text-xl font-bold">Education</h3>
              <EducationCard {...education} />
            </div>
          )}

          {languages.length > 0 && (
            <div>
              <h3 className="mt-12 text-xl font-bold">Language</h3>
              <div className="mt-5 flex gap-2">
                {languages.map((language) => (
                  <Badge variant={'blue'} key={language}>
                    {language}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {awards.length > 0 && (
            <div>
              <h3 className="mb-5 mt-12 text-xl font-bold">Awards</h3>
              {awards.map((award) => (
                <Badge variant={'destructive'} key={award}>
                  {award}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="mt-5">
          <h3 className="mb-5 mt-12 text-xl font-bold">Identification Card</h3>
          <div className="flex flex-wrap gap-4">
            <Image
              src={front}
              alt="front Id"
              width={409}
              height={244}
              className="h-[244px] w-[409px] rounded-lg object-cover"
            />
            <Image
              src={back}
              alt="back Id"
              width={409}
              height={244}
              className="h-[244px] w-[409px] rounded-lg object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default DoctorDetails;

const EducationCard = ({ school, degree }: { school: string; degree: string }): JSX.Element => (
  <div className="mt-6 flex items-center justify-start gap-3">
    <div className="flex h-[35px] w-[35px] items-center justify-center rounded-[6.74px] bg-lightOrange">
      <GraduationCap className="text-deepOrange" />
    </div>
    <div>
      <h4 className="font-medium text-gray-600">Bachelor of Science - {degree}</h4>
      <p className="flex text-sm text-gray-500">{school}</p>
    </div>
  </div>
);
