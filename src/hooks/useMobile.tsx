import * as React from 'react';
import { useMemo } from 'react';

const DEFAULT_MOBILE_BREAKPOINT = 768;

export function useIsMobile(customBreakPoint?: number): boolean {
  const breakpoint = useMemo(
    () => customBreakPoint ?? DEFAULT_MOBILE_BREAKPOINT,
    [customBreakPoint],
  );
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = (): void => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < breakpoint);
    return (): void => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}
