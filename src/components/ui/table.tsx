'use client';
import { cn } from '@/lib/utils';
import {
  ColumnDef,
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { Button } from './button';
import {
  forwardRef,
  HTMLAttributes,
  JSX,
  TdHTMLAttributes,
  ThHTMLAttributes,
  useEffect,
  useState,
} from 'react';
import { IPagination } from '@/types/shared.interface';
import { Skeleton } from '@/components/ui/skeleton';

export type PaginationData = Omit<IPagination<unknown>, 'rows'>;
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  rowCount?: number;
  autoResetPageIndex?: boolean;
  manualPagination?: boolean;
  userPaginationChange?: (value: PaginationState) => void;
  columnVisibility?: VisibilityState;
  page?: number;
  pageCount?: number;
  paginationData?: PaginationData;
  isLoading?: boolean;
}

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  ),
);
Table.displayName = 'Table';

const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
  ),
);
TableHeader.displayName = 'TableHeader';

const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  ),
);
TableBody.displayName = 'TableBody';

const TableFooter = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn('bg-muted/50 border-t font-medium last:[&>tr]:border-b-0', className)}
      {...props}
    />
  ),
);
TableFooter.displayName = 'TableFooter';

const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors',
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = 'TableRow';

const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'text-muted-foreground h-12 px-4 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = 'TableHead';

const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    />
  ),
);
TableCell.displayName = 'TableCell';

const TableCaption = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn('text-muted-foreground mt-4 text-sm', className)} {...props} />
  ),
);
TableCaption.displayName = 'TableCaption';

export const TableData = <TData, TValue>({
  columns,
  data,
  rowCount = 10,
  autoResetPageIndex = false,
  manualPagination = true,
  userPaginationChange,
  columnVisibility,
  page,
  paginationData,
  isLoading,
}: DataTableProps<TData, TValue>): JSX.Element => {
  const [pagination, setPagination] = useState({
    pageIndex: page ? page - 1 : 0,
    pageSize: rowCount,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination,
    rowCount,
    pageCount: paginationData ? paginationData.totalPages : Math.ceil(data.length / rowCount),
    autoResetPageIndex,
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const updatedPagination = (old: PaginationState): PaginationState =>
        functionalUpdate(updater, old);
      const updatedPaginationValues = updatedPagination(table.getState().pagination);

      setPagination(updatedPaginationValues);

      if (userPaginationChange) {
        userPaginationChange(updatedPaginationValues);
      }
    },
    state: {
      pagination: pagination,
      sorting: sorting,
      columnVisibility,
    },
  });

  const [record, setRecord] = useState({ startRecord: 1, endRecord: 10, total: 10 });
  const currentPage = table.getState().pagination.pageIndex + 1;

  useEffect(() => {
    if (page) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: page - 1,
      }));
    }

    if (paginationData) {
      const { page, pageSize, total } = paginationData;
      const startRecord = (page - 1) * pageSize + 1;
      const endRecord = Math.min(page * pageSize, total);

      setRecord({
        startRecord,
        endRecord,
        total,
      });
    }
  }, [page, paginationData]);

  return (
    <>
      <div className="border-y bg-white">
        <Table>
          <TableHeader className="bg-gray-50 font-medium">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-black">
                    {isLoading ? (
                      <Skeleton className="h-4 max-w-[250px] bg-gray-300" />
                    ) : header.isPlaceholder ? null : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: rowCount }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: columns.length }).map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 max-w-[250px] bg-gray-300" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="text-sm font-medium text-gray-500"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mr-2 flex items-center justify-between space-x-2 py-4">
        <div>
          <p className="text-sm text-gray-400">
            {manualPagination ? (
              <>
                Showing {record.startRecord} to {record.endRecord} of {record.total} entries
              </>
            ) : (
              <>
                {' '}
                Showing{' '}
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                  1}{' '}
                to{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  data.length,
                )}{' '}
                of {data.length} entries
              </>
            )}
          </p>
          <p className="text-sm text-gray-400"></p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || isLoading}
            child="Previous"
          />
          <span>{currentPage}</span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={
              (manualPagination ? record.endRecord === record.total : !table.getCanNextPage()) ||
              isLoading
            }
            child={'Next'}
          />
        </div>
      </div>
    </>
  );
};

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
