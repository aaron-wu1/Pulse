import { DialogContent, Dialog, DialogTrigger } from '@/components/ui/dialog';
import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface InfoProps {
  pName: string;
  depth: number;
}

export function Info({ pName, depth }: InfoProps) {
  // const [chatMessage, setChatMessage] = useState<string>(pName);
  const [chatResponse, setChatResponse] = useState<string>('');

  async function sendChatMessage(depth: number) {
    console.log('Sent', pName);
    if (depth == 1) {
      console.log(
        'recived',
        setChatResponse(await invoke('get_process_info', { prompt: pName }))
      );
    }
    if (depth == 0) {
      console.log(
        'recived',
        setChatResponse(
          await invoke('get_dumb_process_info', { prompt: pName })
        )
      );
    }
  }

  return (
    <Dialog>
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
