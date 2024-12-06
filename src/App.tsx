import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import { invoke } from '@tauri-apps/api/core';
import './App.css';

function App() {
  const [greetMsg, setGreetMsg] = useState('');
  const [name, setName] = useState('');
  const [stats, setStats] = useState<systemMemoryStats>({
    active: 0,
    inactive: 0,
    free: 0,
    memsize: 0,
    wired: 0,
  });

  interface systemMemoryStats {
    active: number;
    inactive: number;
    free: number;
    memsize: number;
    wired: number;
  }

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke('greet', { name }));
  }

  async function getStats() {
    setStats(await invoke('get_stats'));
  }

  useEffect(() => {
    console.log(stats);
  }, [stats]);

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
      <p>{stats.memsize}</p>
    </main>
  );
}

export default App;
