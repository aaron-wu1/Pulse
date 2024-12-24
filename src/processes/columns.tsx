import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';

import { ChevronDown, ChevronUp } from 'lucide-react';

export interface Process {
  pid: number;
  name: string;
  memory: number;
  user: string;
}

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
      return <div className='text-left px-4'>{row.getValue('pid')}</div>;
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
      return <div className='text-left px-4'>{row.getValue('name')}</div>;
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
      return <div className='text-center'>{row.getValue('user')}</div>;
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
        <div className='text-right font-medium px-4'>
          {formatKBytes(row.getValue('memory'))}
        </div>
      );
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
