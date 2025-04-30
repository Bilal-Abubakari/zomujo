import { Loader2 } from 'lucide-react';
import React, { JSX } from 'react';

type LoadingProps = {
  message?: string;
};
const Loading = ({ message }: LoadingProps): JSX.Element => (
  <div className="flex h-36 w-full flex-col items-center justify-center gap-4">
    <Loader2 className="animate-spin" />
    <span>{message ?? 'Loading...'}</span>
  </div>
);

export default Loading;
