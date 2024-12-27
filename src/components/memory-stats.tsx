import { Separator } from './ui/separator';
export interface systemMemoryStats {
  active: number;
  inactive: number;
  free: number;
  memsize: number;
  wired: number;
  app: number;
  compressed: number;
}

export function MemoryStats({ stats }: { stats: systemMemoryStats }) {
  const roundedStats = {
    active: parseFloat(stats.active.toFixed(2)),
    inactive: parseFloat(stats.inactive.toFixed(2)),
    free: parseFloat(stats.free.toFixed(2)),
    memsize: parseFloat(stats.memsize.toFixed(2)),
    wired: parseFloat(stats.wired.toFixed(2)),
    app: parseFloat(stats.app.toFixed(2)),
    compressed: parseFloat(stats.compressed.toFixed(2)),
  };
  return (
    <div className='flex h-5 items-center justify-around space-x-4 text-sm p-4'>
      {/* <Separator className='my-4' /> */}
      <div className='p-2 text-center flex justify-center'>
        Memory Avaliable: {roundedStats.memsize} GB
      </div>
      <Separator className='h-5' orientation='vertical' />
      <div className='p-2 text-center flex justify-center'>
        Memory Used:{' '}
        {parseFloat(
          (
            roundedStats.wired +
            roundedStats.app +
            roundedStats.compressed
          ).toFixed(2)
        )}{' '}
        GB
      </div>
      <Separator className='h-5' orientation='vertical' />
      <div className='p-2 text-center flex justify-center'>
        App Memory: {roundedStats.app} GB
      </div>
      <Separator className='h-5' orientation='vertical' />
      <div className='p-2 text-center flex justify-center'>
        Wired Memory: {roundedStats.wired} GB
      </div>
      <Separator className='h-5' orientation='vertical' />
      <div className='p-2 text-center flex justify-center'>
        Compressed Memory: {roundedStats.compressed} GB
      </div>
      {/* <Accordion type='single' collapsible className='w-1/2'>
        <AccordionItem value='item-1'>
          <AccordionTrigger>
            Memory Used:{' '}
            {parseFloat(
              (
                roundedStats.wired +
                roundedStats.app +
                roundedStats.compressed
              ).toFixed(2)
            )}
          </AccordionTrigger>
          <AccordionContent>
            <AccordionContent>Wired: {roundedStats.wired}</AccordionContent>
            <AccordionContent>App: {roundedStats.app}</AccordionContent>
            <AccordionContent>
              Compressed: {roundedStats.compressed}
            </AccordionContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion> */}
    </div>
  );
}
