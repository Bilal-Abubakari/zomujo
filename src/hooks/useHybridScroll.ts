import { useEffect, useRef } from 'react';
import { useScrollContainer } from '@/context/scroll-context';

type Options = {
  showScrollTopAfter?: number;
  onScrollTopVisibilityChange?: (visible: boolean) => void;
};

// TODO: Let's make this hook more open
export const useHybridScroll = ({
  showScrollTopAfter = 300,
  onScrollTopVisibilityChange,
}: Options): { scrollToTop: () => void } => {
  const scrollContainerRef = useScrollContainer();
  const previousScrollY = useRef(0);

  const scrollToTop = (): void => {
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
    onScrollTopVisibilityChange?.(false);
  };

  useEffect(() => {
    const getScrollY = (): number =>
      scrollContainerRef?.current ? scrollContainerRef.current.scrollTop : window.scrollY;

    const handleScroll = (): void => {
      const scrollY = getScrollY();
      console.log('Scroll here', scrollY);

      onScrollTopVisibilityChange?.(scrollY > showScrollTopAfter);

      previousScrollY.current = scrollY;
    };

    const container = scrollContainerRef?.current;

    handleScroll();

    window.addEventListener('scroll', handleScroll);
    container?.addEventListener('scroll', handleScroll);

    return (): void => {
      window.removeEventListener('scroll', handleScroll);
      container?.removeEventListener('scroll', handleScroll);
    };
  }, [scrollContainerRef]);

  return {
    scrollToTop,
  };
};
