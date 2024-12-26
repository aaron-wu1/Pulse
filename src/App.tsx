import { useState, useEffect, useRef, createContext } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { DataTable } from './processes/data-table';
import { Process, columns } from './processes/columns';

import { systemMemoryStats, MemoryStats } from './components/memory-stats';
import './App.css';
import { PollToggle } from './components/poll-toggle';
import { usePolling } from './components/polling-provider';

function App() {
  const [stats, setStats] = useState<systemMemoryStats>({
    active: 0,
    inactive: 0,
    free: 0,
    memsize: 0,
    wired: 0,
    app: 0,
    compressed: 0,
  });

  const [processes, setProcesses] = useState<Process[]>([]);
  // const [isPollingEnabled, setIsPollingEnabled] = useState(true);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  // interface PollingContextType {
  //   isPollingEnabled: boolean;
  //   setIsPollingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  // }

  // const PollingContext = createContext<PollingContextType | null>(null);
  const { isPollingEnabled, setIsPollingEnabled } = usePolling();
  async function getStats() {
    setStats(await invoke('get_stats'));
  }
  async function getProcesses() {
    setProcesses(await invoke('get_processes'));
  }

  useEffect(() => {
    // console.log('polling', isPollingEnabled);
    const pollStats = async () => {
      pollingRef.current = setInterval(() => {
        getStats();
        getProcesses();
      }, 2000);
    };

    const stopPolling = () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };

    if (isPollingEnabled) {
      pollStats();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [isPollingEnabled]);

  return (
    <>
      <DataTable columns={columns} data={processes} />
      <MemoryStats stats={stats} />
      <PollToggle />
    </>
  );
}

export default App;
