import AuthenticationFrame, { ImagePosition } from '../_components/authenticationFrame';
import Text from '@/components/text/text';
import Image from 'next/image';
import { Logo, ForgotPasswordSlide } from '@/assets/images';
import ForgetPasswordForm from '../_components/forgetPasswordForm';
import { JSX } from 'react';

const ForgetPassword = (): JSX.Element => (
  <AuthenticationFrame
    imageSlide={ForgotPasswordSlide}
    imageAlt="forgot-password"
    imagePosition={ImagePosition.Right}
  >
    <div>
      <Image src={Logo} width={44} height={44} alt="Zyptyk-logo" className="m-auto" />
      <div className="mt-5 flex w-full flex-col items-center space-y-3 2xl:space-y-3.5">
        <div className="flex flex-col items-center">
          <Text variantStyle="h4" variant="h4">
            Forgot Password
          </Text>
          <Text variantStyle="body-small" className="text-grayscale-500">
            Reset your password - just enter your email to get started!
          </Text>
        </div>
      </div>

      <ForgetPasswordForm />
    </div>
  </AuthenticationFrame>
);

export default ForgetPassword;
