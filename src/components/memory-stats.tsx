import { Separator } from './ui/separator';
import { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useThrottle } from '@/hooks/use-throttle';
export interface systemMemoryStats {
  active: number;
  inactive: number;
  free: number;
  memsize: number;
  wired: number;
  app: number;
  compressed: number;
}

export function MemoryStats() {
  const [stats, setStats] = useState<systemMemoryStats>({
    active: 0,
    inactive: 0,
    free: 0,
    memsize: 0,
    wired: 0,
    app: 0,
    compressed: 0,
  });
  const [rate, setRate] = useState<number>(2000);

  const handleSysMemStatsUpdate = useThrottle((event) => {
    setStats(event.payload as systemMemoryStats);
  }, rate);

  useEffect(() => {
    const unlistenSysMemStats = listen(
      'sys_mem_update',
      handleSysMemStatsUpdate
    );
    const unlistenRate = listen('rate_update', (event) => {
      setRate(event.payload as number);
    });

    return () => {
      unlistenSysMemStats.then((fn) => fn());
      unlistenRate.then((fn) => fn());
    };
  }, []);

  const roundedStats = {
    active: parseFloat(stats.active.toFixed(2)),
    inactive: parseFloat(stats.inactive.toFixed(2)),
    free: parseFloat(stats.free.toFixed(2)),
    memsize: parseFloat(stats.memsize.toFixed(2)),
    wired: parseFloat(stats.wired.toFixed(2)),
    app: parseFloat(stats.app.toFixed(2)),
    compressed: parseFloat(stats.compressed.toFixed(2)),
  };
  return (
    <div className='flex h-5 items-center justify-around space-x-4 text-sm p-4'>
      <div className='p-2 text-center flex justify-center'>
        Memory Avaliable: {roundedStats.memsize} GB
      </div>
      <Separator className='h-5' orientation='vertical' />
      <div className='p-2 text-center flex justify-center'>
        Memory Used:{' '}
        {parseFloat(
          (
            roundedStats.wired +
            roundedStats.app +
            roundedStats.compressed
          ).toFixed(2)
        )}{' '}
        GB
      </div>
      <Separator className='h-5' orientation='vertical' />
      <div className='p-2 text-center flex justify-center'>
        App Memory: {roundedStats.app} GB
      </div>
      <Separator className='h-5' orientation='vertical' />
      <div className='p-2 text-center flex justify-center'>
        Wired Memory: {roundedStats.wired} GB
      </div>
      <Separator className='h-5' orientation='vertical' />
      <div className='p-2 text-center flex justify-center'>
        Compressed Memory: {roundedStats.compressed} GB
      </div>
    </div>
  );
}
