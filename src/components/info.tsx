import { DialogContent, Dialog, DialogTrigger } from '@/components/ui/dialog';
import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useProcessUpdateState } from '@/hooks/use-process-update-state';
import { useDebounce } from '@/hooks/use-debounce';

interface InfoProps {
  pName: string;
  depth: number;
}

export function Info({ pName, depth }: InfoProps) {
  const [chatResponse, setChatResponse] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);

  const debounceOnOpenChange = useDebounce((isOpen) => {
    if (isOpen != open) {
      setOpen(isOpen);
    }
  }, 300);
  useProcessUpdateState(open);

  async function sendChatMessage(depth: number) {
    if (depth == 1) {
      setChatResponse(await invoke('get_process_info', { prompt: pName }));
    }
    if (depth == 0) {
      setChatResponse(await invoke('get_dumb_process_info', { prompt: pName }));
    }
  }

  return (
    <Dialog open={open} onOpenChange={debounceOnOpenChange}>
      <DialogTrigger onClick={() => sendChatMessage(depth)}>
        {depth == 0 ? <p>nerd</p> : <p>(i)</p>}
      </DialogTrigger>
      <DialogContent>
        {chatResponse == '' ? (
          <Skeleton className='h-[125px] w-full rounded-xl' />
        ) : (
          <p>RESPONSE: {chatResponse}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
