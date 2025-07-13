import { DialogContent, Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';
import { MessageCircleQuestion } from 'lucide-react';

export function Chat() {
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatResponse, setChatResponse] = useState<string>('');

  async function sendChatMessage() {
    console.log('Sent', chatMessage);
    console.log(
      'recived',
      setChatResponse(
        await invoke('send_chat_message', { prompt: chatMessage })
      )
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' size='icon'>
          <MessageCircleQuestion />
          <span className='sr-only'>Toggle Chat</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Input
          placeholder='Chat...'
          value={chatMessage}
          onChange={(event) => setChatMessage(event.target.value)}
          className='max-w-md'
        />
        <Button onClick={() => sendChatMessage()}></Button>
        <p>RESPONSE: {chatResponse}</p>
      </DialogContent>
    </Dialog>
  );
}
