import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { DataTable } from './processes/data-table';
import { Process, columns } from './processes/columns';
import { usePolling } from './components/polling-provider';
import { systemMemoryStats, MemoryStats } from './components/memory-stats';
import { listen } from '@tauri-apps/api/event';
import { useToast } from '@/hooks/use-toast';
import { Input } from './components/ui/input';

import './App.css';
import { Toaster } from './components/ui/toaster';
import { Button } from './components/ui/button';

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
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatResponse, setChatResponse] = useState<string>('');

  async function getStats() {
    setStats(await invoke('get_stats'));
  }
  async function getProcesses() {
    setProcesses(await invoke('get_processes'));
  }

  async function sendChatMessage() {
    console.log('Sent', chatMessage);
    console.log(
      'recived',
      await invoke('send_chat_message', { prompt: chatMessage })
    );
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
      <Input
        placeholder='Chat...'
        value={chatMessage}
        onChange={(event) => setChatMessage(event.target.value)}
        className='max-w-md'
      />
      <Button onClick={() => sendChatMessage()}></Button>
      <p>RESPONSE: {chatResponse}</p>
      <div className='h-[92vh] w-[100vw]'>
        <DataTable columns={columns} data={processes} />
      </div>
      <div className='h-[8vh] w-[100vw] p-4'>
        <MemoryStats stats={stats} />
      </div>
    </>
  );
}

export default App;
