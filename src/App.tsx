import { useState, useEffect, useRef } from 'react';
import reactLogo from './assets/react.svg';
import { invoke } from '@tauri-apps/api/core';
import './App.css';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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

  interface systemMemoryStats {
    active: number;
    inactive: number;
    free: number;
    memsize: number;
    wired: number;
    app: number;
    compressed: number;
  }
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
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    async function pollStats() {
      pollingRef.current = setInterval(() => {
        getStats();
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
    <main className='container'>
      <h1>Welcome to Tauri + React</h1>
      <form
        className='row'
        onSubmit={(e) => {
          e.preventDefault();
          greet();
          getStats();
        }}
      >
        <input
          id='greet-input'
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder='Enter a name...'
        />
        <button type='submit'>Greet</button>
      </form>
      <p>{greetMsg}</p>
      <p>Stats</p>
      <p>Memory Avaliable: {stats.memsize}</p>
      <p>Memory Used: {stats.wired + stats.app + stats.compressed}</p>
      <p>Wired: {stats.wired}</p>
      <p>App: {stats.app}</p>
      <p>Compressed: {stats.compressed}</p>
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
    </main>
  );
}

export default App;
