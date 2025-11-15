import AuthenticationFrame, { ImagePosition } from '../../_components/authenticationFrame';
import Text from '@/components/text/text';
import Image from 'next/image';
import { Logo, ResetPasswordSlide } from '@/assets/images';
import ResetPasswordForm from '../../_components/resetPasswordForm';
import { JSX } from 'react';

const ForgetPassword = (): JSX.Element => (
  <AuthenticationFrame
    imageSlide={ResetPasswordSlide}
    imageAlt="reset-password"
    imagePosition={ImagePosition.Right}
  >
    <div>
      <Image src={Logo} width={44} height={44} alt="Fornix Link-logo" className="m-auto" />
      <div className="mt-5 flex w-full flex-col items-center justify-center space-y-3 2xl:space-y-3.5">
        <div className="flex flex-col items-center">
          <Text variantStyle="h4" variant="h4">
            Reset Password
          </Text>
          <Text variantStyle="body-small" className="text-grayscale-500">
            Set your new password to finish the process and secure your account.
          </Text>
        </div>
      </div>

      <ResetPasswordForm />
    </div>
  </AuthenticationFrame>
);

export default ForgetPassword;
