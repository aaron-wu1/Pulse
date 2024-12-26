import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { DataTable } from './processes/data-table';
import { Process, columns } from './processes/columns';
import { usePolling } from './components/polling-provider';
import { systemMemoryStats, MemoryStats } from './components/memory-stats';
import './App.css';

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
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const { isPollingEnabled } = usePolling();
  async function getStats() {
    setStats(await invoke('get_stats'));
  }
  async function getProcesses() {
    setProcesses(await invoke('get_processes'));
  }

  useEffect(() => {
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
    </>
  );
}

export default App;
