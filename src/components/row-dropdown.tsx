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
import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';
import { useProcessUpdateState } from '@/hooks/useProcessUpdateState';
import { useDebounce } from '@/hooks/use-debounce';

export function RowDropdown({ pid }: { pid: unknown }) {
  const [open, setOpen] = useState<boolean>(false);
  const debounceOnOpenChange = useDebounce((isOpen) => {
    if (isOpen !== open) {
      setOpen(isOpen);
    }
  }, 300);
  useProcessUpdateState(open);
  return (
    <DropdownMenu open={open} onOpenChange={debounceOnOpenChange}>
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
