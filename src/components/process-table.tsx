import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { DataTable } from './ui/data-table';
import { Process, processTableColumns } from './process-table-columns';
import { listen, Event } from '@tauri-apps/api/event';
import { useThrottle } from '@/hooks/use-throttle';

function ProcessDataTable() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [rate, setRate] = useState<number>(2000);

  const handleProcessUpdate = useThrottle((event: Event<any>) => {
    const updatedProcesses = event.payload as Process[];
    setProcesses((prev) => {
      const map = new Map(prev.map((p) => [p.pid, p]));
      for (const proc of updatedProcesses) {
        map.set(proc.pid, proc);
      }
      return Array.from(map.values());
    });
  }, rate);

  useEffect(() => {
    invoke('update_process_info');

    const unlistenProcessInfo = listen('process_update', handleProcessUpdate);
    const unlistenRate = listen('rate_update', (event) => {
      setRate(event.payload as number);
    });

    return () => {
      unlistenProcessInfo.then((fn) => fn());
      unlistenRate.then((fn) => fn());
    };
  }, []);

  return <DataTable columns={processTableColumns} data={processes} />;
}

export default ProcessDataTable;
