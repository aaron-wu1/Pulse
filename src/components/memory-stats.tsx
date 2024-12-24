import {
  Accordion,
  AccordionTrigger,
  AccordionContent,
  AccordionItem,
} from './ui/accordion';
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
    <div className='flex justify-center'>
      <Accordion type='single' collapsible className='w-1/2'>
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
      </Accordion>
    </div>
  );
}
