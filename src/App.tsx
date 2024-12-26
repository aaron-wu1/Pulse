import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { DataTable } from './processes/data-table';
import { Process, columns } from './processes/columns';
import { usePolling } from './components/polling-provider';
import { systemMemoryStats, MemoryStats } from './components/memory-stats';
import { listen } from '@tauri-apps/api/event';
import { useToast } from '@/hooks/use-toast';

import './App.css';
import { Toaster } from './components/ui/toaster';

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
  const { toast } = useToast();

  async function getStats() {
    setStats(await invoke('get_stats'));
  }
  async function getProcesses() {
    setProcesses(await invoke('get_processes'));
  }

  type ProcessKilledInfo = {
    pid: number;
    name: string;
    sucess: boolean;
  };

  listen<ProcessKilledInfo>('process-killed', (event) => {
    console.log(`Killed Pid: ${event.payload}`);
    console.log(event.payload);
    toast({
      title: `${event.payload.name} was killed`,
      description: `Process ID killed: ${event.payload.pid}`,
    });
  });

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
      <Toaster />
      <DataTable columns={columns} data={processes} />
      <MemoryStats stats={stats} />
    </>
  );
}

export default App;
