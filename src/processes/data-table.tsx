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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Info } from '@/components/info';
import { Row } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

interface MemoTableRowProps<TData> {
  row: Row<TData>;
}

interface MemoTableRowProps<TData> {
  row: Row<TData>;
}

function MemoTableRowInner<TData>({ row }: MemoTableRowProps<TData>) {
  return (
    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
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

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'memory', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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

  const { rows } = table.getRowModel();
  // Virtualization of rows
  const parentRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 24,
    overscan: 50,
  });
  return (
    <div className='w-full h-full flex flex-col'>
      <div className='flex items-center py-4 justify-between px-4'>
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
      {/* <div className='w-full h-full rounded-md border'> */}
      <ScrollArea className='rounded-md border' ref={parentRef}>
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
          <TableBody>
            {table.getRowModel().rows?.length ? (
              virtualizer.getVirtualItems().map((virtualRow, index) => {
                const row = rows[virtualRow.index];
                return <MemoTableRow row={row} />;
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
      </ScrollArea>
    </div>
    // </div>
  );
}
