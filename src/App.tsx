import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './App.css';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { DataTable } from './processes/data-table';
import { Process, columns } from './processes/columns';

function App() {
  const [greetMsg, setGreetMsg] = useState('');
  const [name, setName] = useState('');
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

  interface systemMemoryStats {
    active: number;
    inactive: number;
    free: number;
    memsize: number;
    wired: number;
    app: number;
    compressed: number;
  }

  // interface process {
  //   pid: number;
  //   name: string;
  //   memory: number;
  //   user: string;
  // }

  const roundedStats = {
    active: parseFloat(stats.active.toFixed(2)),
    inactive: parseFloat(stats.inactive.toFixed(2)),
    free: parseFloat(stats.free.toFixed(2)),
    memsize: parseFloat(stats.memsize.toFixed(2)),
    wired: parseFloat(stats.wired.toFixed(2)),
    app: parseFloat(stats.app.toFixed(2)),
    compressed: parseFloat(stats.compressed.toFixed(2)),
  };

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke('greet', { name }));
  }

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
    <div className='app-container bg-zinc-100 w-full h-full min-h-screen'>
      {/* <p>Stats</p>
      <p>Memory Avaliable: {stats.memsize}</p>
      <p>Memory Used: {stats.wired + stats.app + stats.compressed}</p>
      <p>Wired: {stats.wired}</p>
      <p>App: {stats.app}</p>
      <p>Compressed: {stats.compressed}</p> */}
      <div className='flex justify-center'>
        <Accordion type='single' collapsible className='w-1/2'>
          <AccordionItem value='item-1'>
            <AccordionTrigger>
              Memory Used:{' '}
              {parseFloat(
                (
                  roundedStats.wired +
                  roundedStats.app +
                  roundedStats.compressed
                ).toFixed(2)
              )}
            </AccordionTrigger>
            <AccordionContent>
              <AccordionContent>Wired: {roundedStats.wired}</AccordionContent>
              <AccordionContent>App: {roundedStats.app}</AccordionContent>
              <AccordionContent>
                Compressed: {roundedStats.compressed}
              </AccordionContent>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <DataTable columns={columns} data={processes} />
    </div>
  );
}

export default App;
