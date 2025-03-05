import AuthenticationFrame, { ImagePosition } from '../_components/authenticationFrame';
import Text from '@/components/text/text';
import Image from 'next/image';
import { Logo, SignUpSlide } from '@/assets/images';
import SignUpForm from '../_components/signUpForm';
import { JSX } from 'react';

const SignUp = (): JSX.Element => (
  <AuthenticationFrame
    imageSlide={SignUpSlide}
    imageAlt="sign-up"
    imagePosition={ImagePosition.Left}
  >
    <div>
      <Image src={Logo} width={44} height={44} alt="Zyptyk-logo" className="m-auto" />
      <div className="mt-5 flex w-full flex-col items-center space-y-3 2xl:space-y-3.5">
        <div className="flex flex-col items-center">
          <Text variantStyle="h4" variant="h4">
            Get started with Zyptyk
          </Text>
          <Text variantStyle="body-small" className="text-grayscale-500">
            Create new account by providing your details below
          </Text>
        </div>
      </div>
    </div>

    <SignUpForm />
  </AuthenticationFrame>
);

export default SignUp;
