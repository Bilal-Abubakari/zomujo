import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';
import { JSX, ReactNode } from 'react';
import { getCurrentYear } from '@/lib/date';
import Text from '@/components/text/text';
import { cn } from '@/lib/utils';

export enum ImagePosition {
  Left = 'left',
  Right = 'right',
}

type AuthenticationFrameProps = Readonly<{
  children: ReactNode;
  imageSlide: StaticImageData;
  imagePosition?: ImagePosition;
  imageAlt: string;
}>;
export default function AuthenticationFrame({
  children,
  imageSlide,
  imagePosition = ImagePosition.Right,
  imageAlt,
}: AuthenticationFrameProps): JSX.Element {
  const flexDirection = imagePosition === ImagePosition.Right ? 'flex-row-reverse' : 'flex-row';
  return (
    <main className={`flex h-screen w-full ${flexDirection} overflow-hidden py-2 sm:py-5`}>
      <div
        className={cn(
          'relative hidden h-full w-1/2 flex-col justify-end overflow-clip rounded-[22px] bg-gray-400 lg:flex',
          imagePosition !== ImagePosition.Right ? 'ml-[2.9rem]' : 'mr-[1.5rem]',
        )}
      >
        <Image
          src={imageSlide}
          className="absolute z-0 h-full w-full object-cover object-center"
          alt={imageAlt}
        />
        <div className="absolute inset-0 z-10 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.7),transparent,transparent,rgba(0,0,0,0.7))]" />

        <div className="bg-transparentPrimaryGradient z-10 w-full space-y-4 px-5 py-10 text-white sm:px-7 sm:py-20 2xl:px-10 2xl:py-24">
          <Text variant="h3" variantStyle="h3">
            Elevate patient care with seamless access to their health data.
          </Text>
          <Text variantStyle="body-small" variant="p">
            Effortlessly manage patient data, appointments, and communications online, giving you
            control and convenience.
          </Text>
        </div>
      </div>
      <div className="flex h-full w-full flex-1 flex-col overflow-y-auto">
        <div className="flex flex-1 flex-col items-center justify-center max-sm:m-5">
          {children}
        </div>
        <div className="mt-5 flex flex-col justify-center px-4 text-center text-xs sm:flex-row sm:gap-6 sm:text-sm">
          <p className="">© {getCurrentYear()} Zyptyk. All rights reserved.</p>

          <div className="text-primary space-x-1">
            <Link href="/terms-conditions" className="text-xs sm:text-sm">
              Terms & Conditions
            </Link>
            <span className="text-black">|</span>
            <Link href="/privacy-policy" className="text-xs sm:text-sm">
              Privacy & Policy
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
