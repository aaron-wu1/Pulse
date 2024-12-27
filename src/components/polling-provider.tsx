import { createContext, useContext, useState } from 'react';

// type Theme = 'dark' | 'light' | 'system';

type PollingProviderProps = {
  children: React.ReactNode;
  defaultPolling?: boolean;
  storageKey?: string;
};

type PollingProviderState = {
  isPollingEnabled: boolean;
  setIsPollingEnabled: (isPollingEnabled: boolean) => void;
};

const initialState: PollingProviderState = {
  isPollingEnabled: true,
  setIsPollingEnabled: () => null,
};

const PollingProviderContext =
  createContext<PollingProviderState>(initialState);

export function PollingProvider({
  children,
  defaultPolling = true,
  storageKey = 'pulse-polling',
  ...props
}: PollingProviderProps) {
  const [isPollingEnabled, setIsPollingEnabled] =
    useState<boolean>(defaultPolling);
  const value = {
    isPollingEnabled,
    setIsPollingEnabled: (isPollingEnabled: boolean) => {
      setIsPollingEnabled(isPollingEnabled);
    },
  };

  return (
    <PollingProviderContext.Provider {...props} value={value}>
      {children}
    </PollingProviderContext.Provider>
  );
}

export const usePolling = () => {
  const context = useContext(PollingProviderContext);

  if (context === undefined)
    throw new Error('usePolling must be used within a PollingProvider');

  return context;
};
