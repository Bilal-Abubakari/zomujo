import { createContext, useContext, RefObject } from 'react';

export const ScrollContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

export const useScrollContainer = (): RefObject<HTMLDivElement | null> | null =>
  useContext(ScrollContext);
