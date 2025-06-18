import { useState, useEffect, useRef, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ValueFormatterParams } from 'ag-grid-community';
import { invoke } from '@tauri-apps/api/core';
import { listen, Event } from '@tauri-apps/api/event';
import { useThrottle } from '@/hooks/use-throttle';
import { Process } from './process-table-columns';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/header';
import { ModeToggle } from './mode-toggle';
import { themeBalham } from 'ag-grid-community';
import { useTheme } from '@/components/theme-provider';
import { RowDropdown } from './row-dropdown';

function formatKBytes(kBytes: number): string {
  if (kBytes < 1024) return `${kBytes} B`;
  else if (kBytes < 1024 * 1024) return `${(kBytes / 1024).toFixed(1)} KB`;
  else if (kBytes < 1024 * 1024 * 1024)
    return `${(kBytes / (1024 * 1024)).toFixed(2)} MB`;
  else return `${(kBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function ProcessDataTable() {
  const [rowData, setRowData] = useState<Process[]>([]);
  const [rate, setRate] = useState<number>(2000);
  const gridRef = useRef<AgGridReact<Process>>(null);
  const { theme } = useTheme();
  const resolvedTheme =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme;

  const agTheme = themeBalham
    .withParams(
      {
        backgroundColor: 'var(--background)',
        foregroundColor: 'var(--foreground)',
        headerBackgroundColor: 'var(--primary-foreground)',
        browserColorScheme: 'light',
      },
      'light'
    )
    .withParams(
      {
        backgroundColor: 'var(--background)',
        foregroundColor: 'var(--foreground)',
        headerBackgroundColor: 'var(--primary-foreground)',
        browserColorScheme: 'dark',
      },
      'dark'
    );
  document.body.dataset.agThemeMode = resolvedTheme;

  function onFilterTextBoxChanged(value: string) {
    gridRef.current?.api.setGridOption('quickFilterText', value);
  }

  const columnDefs: ColDef<Process>[] = useMemo(
    () => [
      { field: 'pid', headerName: 'PID', flex: 1 },
      { field: 'name', headerName: 'Name', flex: 2 },
      {
        field: 'memory',
        headerName: 'Memory',
        cellRenderer: (param: ValueFormatterParams<Process>) => {
          return formatKBytes(param.value);
        },
        sort: 'desc',
        flex: 1,
      },
      { field: 'user', headerName: 'User', flex: 1 },
      { field: 'status', headerName: 'Status', flex: 1 },
      { cellRenderer: RowDropdown, type: 'fitCellContents', flex: 0.35 },
    ],
    []
  );

  const handleProcessUpdate = useThrottle((event: Event<any>) => {
    const updatedProcesses = event.payload as Process[];

    setRowData((prev) => {
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
  }, [handleProcessUpdate]);

  return (
    <div className='p-4 h-full w-full flex flex-col'>
      <div className='h-24 flex items-center py-4 justify-between px-4'>
        <Header />
        <div className='flex justify-end gap-4 w-9/12'>
          <Input
            placeholder='Search...'
            onChange={(event) => onFilterTextBoxChanged(event.target.value)}
            className='max-w-md'
          />
          <ModeToggle />
        </div>
      </div>
      <div className='rounded-2xl shadow-md border border-muted bg-background h-full w-full'>
        <AgGridReact
          theme={agTheme}
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          getRowId={(params) => params.data.pid.toString()}
          animateRows={true}
          domLayout='normal'
          enableRowPinning={true}
        />
      </div>
    </div>
  );
}

export default ProcessDataTable;
