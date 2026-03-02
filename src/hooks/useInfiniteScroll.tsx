import { useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

/**
 * Custom hook for implementing infinite scroll using Intersection Observer
 * @param isLoading - Whether data is currently being loaded
 * @param hasMore - Whether there are more items to load
 * @param onLoadMore - Callback function to load more items
 * @returns Ref callback to attach to the last element
 */
export const useInfiniteScroll = <T extends HTMLElement = HTMLDivElement>({
  isLoading,
  hasMore,
  onLoadMore,
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
}: UseInfiniteScrollOptions) => {
  const observer = useRef<IntersectionObserver | null>(null);

  return useCallback(
    (node: T | null) => {
      if (isLoading) {
        return;
      }
      if (observer.current) {
        observer.current.disconnect();
      }
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });
      if (node) {
        observer.current.observe(node);
      }
    },
    [isLoading, hasMore, onLoadMore],
  );
};
