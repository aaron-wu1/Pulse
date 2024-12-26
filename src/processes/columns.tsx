import { menuItem, RowMenu } from '@/components/row-menu';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';

import { ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { RowDropdown } from '@/components/row-dropdown';
export interface Process {
  pid: number;
  name: string;
  memory: number;
  user: string;
  status: string;
  responsive: boolean;
}

const items: menuItem[] = [
  {
    name: 'Kill',
    action: (pid) => {
      let parsedPid = parseInt(pid);
      console.log('Killing process FRONTEND', pid, 'parsed', parsedPid);
      invoke('kill_process', { pid: pid });
    },
  },
];

export const columns: ColumnDef<Process>[] = [
  {
    accessorKey: 'pid',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          className='w-full  flex justify-start'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          PID
          {column.getIsSorted() === 'desc' ? (
            <ChevronDown className='ml-2 h-4 w-4' />
          ) : column.getIsSorted() === 'asc' ? (
            <ChevronUp className='ml-2 h-4 w-4' />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => {
      const pid = row.getValue('pid');
      return <div className='text-left px-6 py-2'>{String(pid)}</div>;
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          className='w-full flex justify-start'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          {column.getIsSorted() === 'desc' ? (
            <ChevronDown className='ml-2 h-4 w-4' />
          ) : column.getIsSorted() === 'asc' ? (
            <ChevronUp className='ml-2 h-4 w-4' />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        // <RowMenu
        //   items={items.map((item) => ({
        //     ...item,
        //     action: () => item.action(parseInt(row.getValue('pid'))),
        //   }))}
        // >
        <div className='text-left px-6 py-2'>{row.getValue('name')}</div>
        // </RowMenu>
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          className='w-full flex justify-start'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          {column.getIsSorted() === 'desc' ? (
            <ChevronDown className='ml-2 h-4 w-4' />
          ) : column.getIsSorted() === 'asc' ? (
            <ChevronUp className='ml-2 h-4 w-4' />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        // <RowMenu items={items}>
        <div className='text-left px-6 py-2'>{row.getValue('status')}</div>
        // </RowMenu>
      );
    },
  },
  {
    accessorKey: 'responsive',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          className='w-full flex justify-start'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Responsive
          {column.getIsSorted() === 'desc' ? (
            <ChevronDown className='ml-2 h-4 w-4' />
          ) : column.getIsSorted() === 'asc' ? (
            <ChevronUp className='ml-2 h-4 w-4' />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        // <RowMenu items={items}>
        <div className='text-left px-6 py-2'>{row.getValue('responsive')}</div>
        // </RowMenu>
      );
    },
  },
  {
    accessorKey: 'user',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          className='w-full'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          User
          {column.getIsSorted() === 'desc' ? (
            <ChevronDown className='ml-2 h-4 w-4' />
          ) : column.getIsSorted() === 'asc' ? (
            <ChevronUp className='ml-2 h-4 w-4' />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        // <RowMenu items={items}>
        <div className='text-left px-6 py-2'>{row.getValue('user')}</div>
        // {/* </RowMenu> */}
      );
    },
  },
  {
    accessorKey: 'memory',
    header: ({ column }) => (
      <div className='flex justify-end'>
        <Button
          variant='ghost'
          className='w-full flex justify-end'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Memory
          {column.getIsSorted() === 'desc' ? (
            <ChevronDown className='ml-2 h-4 w-4' />
          ) : column.getIsSorted() === 'asc' ? (
            <ChevronUp className='ml-2 h-4 w-4' />
          ) : null}
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      return (
        // <RowMenu items={items}>
        <div className='text-right font-medium px-4'>
          {formatKBytes(row.getValue('memory'))}
        </div>
        // </RowMenu>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const pid = row.getValue('pid');
      return <RowDropdown pid={pid} />;
    },
  },
];

function formatKBytes(kBytes: number): string {
  if (kBytes < 1024) return `${kBytes} B`;
  else if (kBytes < 1024 * 1024) return `${(kBytes / 1024).toFixed(1)} KB`;
  else if (kBytes < 1024 * 1024 * 1024)
    return `${(kBytes / (1024 * 1024)).toFixed(2)} MB`;
  else return `${(kBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
