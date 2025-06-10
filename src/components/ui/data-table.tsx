import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from '@tanstack/react-table';

import { useState, memo, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/header';
import { ModeToggle } from '@/components/mode-toggle';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Info } from '@/components/info';
import { Row } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Process } from '../process-table-columns';

// interface DataTableProps<Process, TValue> {
//   columns: ColumnDef<Process, TValue>[];
//   data: Process[];
// }

// interface MemoTableRowProps<TData> {
//   row: Row<TData>;
// }

function MemoTableRowInner<Process>({
  row,
  style,
}: { row: Row<Process> } & {
  style: React.CSSProperties;
}) {
  return (
    <TableRow
      key={row.id}
      data-state={row.getIsSelected() && 'selected'}
      style={style}
    >
      {row.getVisibleCells().map((cell, idx) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
          {idx === 1 && <Info pName={String(cell.getValue())} depth={1} />}
          {idx === 1 && <Info pName={String(cell.getValue())} depth={0} />}
        </TableCell>
      ))}
    </TableRow>
  );
}
const MemoTableRow = memo(MemoTableRowInner) as typeof MemoTableRowInner;

export function DataTable<Process, TValue>({
  columns,
  data,
}: {
  columns: ColumnDef<Process, TValue>[];
  data: Process[];
}) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'memory', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.pid,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    enableMultiSort: false,
  });

  // const rows = useMemo(() => table.getRowModel().rows, [table]);
  const { rows } = table.getRowModel();
  // Virtualization of rows
  const parentRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 24,
    getItemKey: (index) => rows[index]?.id,
    overscan: 200,
  });
  return (
    <div className='w-full h-full flex flex-col'>
      <div className='h-24 flex items-center py-4 justify-between px-4'>
        <Header />
        <div className='flex justify-end gap-4 w-9/12'>
          <Input
            placeholder='Search...'
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className='max-w-md'
          />
          <ModeToggle />
        </div>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
      </Table>
      <ScrollArea className='h-full w-full rounded-md border' ref={parentRef}>
        <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
          <Table>
            <TableBody className='h-full w-full'>
              {rows.length ? (
                virtualizer.getVirtualItems().map((virtualRow, index) => {
                  const row = rows[virtualRow.index];
                  return (
                    <MemoTableRow
                      key={row.id}
                      row={row}
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${
                          virtualRow.start - index * virtualRow.size
                        }px)`,
                        width: '100%',
                      }}
                    />
                  );
                })
              ) : (
                // table.getRowModel().rows.map((row) => <MemoTableRow row={row} />)
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
}
