'use client';
import { useRef, ReactNode, JSX } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/lib/store';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import { Loader } from '@/components/ui/loader';
import { ConnectivityBanner } from '@/components/connectivity/ConnectivityBanner';

export default function StoreProvider({ children }: { children: ReactNode }): JSX.Element {
  const storeRef = useRef<AppStore>(undefined);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }
  const persistor = persistStore(storeRef.current);

  return (
    <Provider store={storeRef.current}>
      <ConnectivityBanner />
      <PersistGate loading={<Loader />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
