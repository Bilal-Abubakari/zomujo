import { Loader2 } from 'lucide-react';
import React, { JSX } from 'react';

type LoadingOverlayProps = {
  message?: string;
};
const LoadingOverlay = ({ message = 'Loading...' }: LoadingOverlayProps): JSX.Element => (
  <div className="absolute inset-0 z-100 flex flex-col items-center justify-center gap-3 rounded-lg bg-white/90 backdrop-blur-[3px]">
    <Loader2 className="h-8 w-8 animate-spin text-black" />
    <div className="text-sm font-semibold text-black">{message}</div>
  </div>
);

export default LoadingOverlay;
