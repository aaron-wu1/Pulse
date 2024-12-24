import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { DataTable } from './processes/data-table';
import { Process, columns } from './processes/columns';
import { ThemeProvider } from './components/theme-provider';
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

  async function getStats() {
    setStats(await invoke('get_stats'));
  }
  async function getProcesses() {
    setProcesses(await invoke('get_processes'));
  }
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    async function pollStats() {
      pollingRef.current = setInterval(() => {
        getStats();
        getProcesses();
      }, 2000);
    }
    pollStats();
    console.log(stats);
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <DataTable columns={columns} data={processes} />
      <MemoryStats stats={stats} />
    </ThemeProvider>
  );
}

export default App;
