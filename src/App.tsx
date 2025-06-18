import ProcessDataTable from './components/process-table';
import { MemoryStats } from './components/memory-stats';
import { listen } from '@tauri-apps/api/event';
import { useToast } from '@/hooks/use-toast';
import './App.css';
import { Toaster } from './components/ui/toaster';
import menu from './components/menu';
import { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

function App() {
  const { toast } = useToast();

  // Inital listeners
  useEffect(() => {
    invoke('update_process_info');
    invoke('update_sys_mem_stats');
  }, []);

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

  menu.setAsAppMenu();

  return (
    <div className='w-screen h-screen'>
      <Toaster />
      <div className='h-[92vh] w-[100vw]'>
        <ProcessDataTable />
      </div>
      <div className='h-[8vh] w-[100vw] p-4'>
        <MemoryStats />
      </div>
    </div>
  );
}

export default App;
