import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { usePolling } from '@/components/polling-provider';
import { invoke } from '@tauri-apps/api/core';

export function RowDropdown({ pid }: { pid: unknown }) {
  const { setIsPollingEnabled } = usePolling();
  return (
    <DropdownMenu
      onOpenChange={(isOpen) => {
        console.log('set is polling', !isOpen);
        setIsPollingEnabled(!isOpen);
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Open menu</span>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(String(pid))}
        >
          Copy PID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='text-red-500'
          onSelect={() => invoke('kill_process', { pid: pid })}
        >
          Kill
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
