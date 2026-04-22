import { LoginSlide } from '@/assets/images';
import AuthenticationFrame, { ImagePosition } from '@/app/(auth)/_components/authenticationFrame';
import LoginForm from '../_components/loginForm';
import { JSX } from 'react';
import type { Metadata } from 'next';
import { NOINDEX } from '@/lib/seo';

export const metadata: Metadata = NOINDEX;

function Login(): JSX.Element {
  return (
    <AuthenticationFrame
      imageSlide={LoginSlide}
      imageAlt="Login"
      imagePosition={ImagePosition.Left}
    >
      <LoginForm />
    </AuthenticationFrame>
  );
}

export default Login;
