import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  // getPaginationRowModel,
} from '@tanstack/react-table';

import { useState } from 'react';
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
// import { Button } from '@/components/ui/button';
// import InfiniteScroll from '@/components/ui/infinite-scroll';
// import { Loader2 } from 'lucide-react';
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'pid', desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  // const [loading, setLoading] = useState(false);
  // const [hasMore, setHasMore] = useState(true);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    enableMultiSort: false,
  });
  // useEffect(() => {
  //   table.setPageSize(200);
  // }, []);

  // const next = async () => {
  //   setLoading(true);

  //   /**
  //    * Intentionally delay the search by 800ms before execution so that you can see the loading spinner.
  //    * In your app, you can remove this setTimeout.
  //    **/

  //   setTimeout(async () => {
  //     // const res = await fetch(
  //     //   `https://dummyjson.com/products?limit=3&skip=${3 * page}&select=title,price`,
  //     // );
  //     // const data = (await res.json()) as DummyProductResponse;
  //     // setProducts((prev) => [...prev, ...data.products]);
  //     // setPage((prev) => prev + 1);
  //     table.nextPage();

  //     // Usually your response will tell you if there is no more data.
  //     console.log('has next', table.getCanNextPage(), hasMore);
  //     if (!table.getCanNextPage()) {
  //       setHasMore(false);
  //     }
  //     setLoading(false);
  //   }, 800);
  // };

  return (
    <div>
      <div className='flex items-center py-4 justify-between px-4'>
        <Header />
        <ModeToggle />
        <Input
          placeholder='Search...'
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className='max-w-sm'
        />
      </div>
      <div className='rounded-md border'>
        {/* <InfiniteScroll
          hasMore={hasMore}
          isLoading={loading}
          next={next}
          threshold={1}
        > */}
        <ScrollArea className='h-[80vh] w-[100vw] rounded-md border'>
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
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
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
          {/* {hasMore && <Loader2 className='my-4 h-8 w-8 animate-spin' />}
        </InfiniteScroll> */}
        </ScrollArea>
        {/* <div className='flex items-center justify-end space-x-2 py-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div> */}
      </div>
    </div>
  );
}
