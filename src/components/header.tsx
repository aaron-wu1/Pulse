import { ActivityIcon } from 'lucide-react';
export function Header() {
  return (
    <div className='flex items-center justify-between gap-2'>
      <ActivityIcon /> <p className='text-xl'>Pulse</p>
    </div>
  );
}
