import { CustomCellRendererProps } from 'ag-grid-react';
import { Info } from './info';

export function ProcessName(params: CustomCellRendererProps) {
  return (
    <div className='flex flex-row gap-2'>
      <span>{params.value}</span>
      <Info rowData={params.data} depth={0} />
      <Info rowData={params.data} depth={1} />
    </div>
  );
}
