import { createContext, useContext, useEffect, useState } from 'react';

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
  const parseBool = (value: string | null) => {
    return value === 'true';
  };

  const [isPollingEnabled, setIsPollingEnabled] = useState<boolean>(
    () => parseBool(localStorage.getItem(storageKey)) || defaultPolling
  );

  // const [theme, setTheme] = useState<Theme>(
  //   () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  // );

  useEffect(() => {
    // const root = window.document.documentElement;
    // root.classList.remove('light', 'dark');
    // if (theme === 'system') {
    //   const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
    //     .matches
    //     ? 'dark'
    //     : 'light';
    //   root.classList.add(systemTheme);
    //   return;
    // }
    // root.classList.add(theme);
  }, [isPollingEnabled]);

  // useEffect(() => {
  //   const root = window.document.documentElement;

  //   root.classList.remove('light', 'dark');

  //   if (theme === 'system') {
  //     const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
  //       .matches
  //       ? 'dark'
  //       : 'light';

  //     root.classList.add(systemTheme);
  //     return;
  //   }

  //   root.classList.add(theme);
  // }, [theme]);

  const value = {
    isPollingEnabled,
    setIsPollingEnabled: (isPollingEnabled: boolean) => {
      localStorage.setItem(storageKey, isPollingEnabled.toString());
      console.log('Setting isPollingEnabled to', isPollingEnabled);
      // localStorage.setItem(storageKey, isPollingEnabled.toString());
      setIsPollingEnabled(isPollingEnabled);
    },
  };
  // console.log('PollingProvider', value);

  return (
    <PollingProviderContext.Provider {...props} value={value}>
      {children}
    </PollingProviderContext.Provider>
  );
}

export const usePolling = () => {
  const context = useContext(PollingProviderContext);
  // console.log('usePolling', context);

  if (context === undefined)
    throw new Error('usePolling must be used within a PollingProvider');

  return context;
};
