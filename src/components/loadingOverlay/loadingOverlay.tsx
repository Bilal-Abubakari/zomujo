import { Loader2 } from 'lucide-react';
import React, { JSX } from 'react';

const LoadingOverlay = (): JSX.Element => (
  <div className="absolute inset-0 z-100 flex flex-col items-center justify-center bg-white/75 backdrop-blur-[3px]">
    <div className="loader">Loading...</div>
    <div>
      <Loader2 className="animate-spin" />
    </div>
  </div>
);

export default LoadingOverlay;
