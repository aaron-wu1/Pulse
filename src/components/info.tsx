import { DialogContent, Dialog, DialogTrigger } from '@/components/ui/dialog';
import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useProcessUpdateState } from '@/hooks/use-process-update-state';
import { useDebounce } from '@/hooks/use-debounce';
import { Info as InfoIcon } from 'lucide-react';

interface InfoProps {
  rowData: any;
  depth: number;
}

export function Info({ rowData, depth }: InfoProps) {
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
      console.log(rowData);
      setChatResponse(
        await invoke('get_process_info', {
          prompt: `<${rowData['name']}> ["PID"=${rowData.pid}, "name"=${rowData.name}, "memory"=${rowData.memory}bytes, "status"=${rowData.status}, "user"=${rowData.user}]`,
        })
      );
    }
    if (depth == 0) {
      setChatResponse(
        await invoke('get_dumb_process_info', { prompt: rowData['name'] })
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={debounceOnOpenChange}>
      <DialogTrigger onClick={() => sendChatMessage(depth)}>
        {/* {depth == 0 ? <p>nerd</p> : <p>(i)</p>} */}
        <InfoIcon className='w-4 h-4' />
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
