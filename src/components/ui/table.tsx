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
  useMemo,
  useState,
} from 'react';
import { IPagination } from '@/types/shared.interface';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type PaginationData = Omit<IPagination<unknown>, 'rows'>;
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  rowCount?: number;
  autoResetPageIndex?: boolean;
  manualPagination?: boolean;
  userPaginationChange?: (value: PaginationState) => void;
  columnVisibility?: VisibilityState;
  page?: number;
  paginationData?: PaginationData;
  isLoading?: boolean;
  pageSizeOptions?: number[];
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

const getPageNumbers = (currentPage: number, totalPages: number): (number | '...')[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [1];

  if (currentPage > 3) {
    pages.push('...');
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push('...');
  }

  pages.push(totalPages);

  return pages;
};

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
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
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
  const currentPage = table.getState().pagination.pageIndex + 1;

  useEffect(() => {
    if (page) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: page - 1,
      }));
    }
  }, [page]);

  const record = useMemo(() => {
    if (!paginationData) {
      return { startRecord: 1, endRecord: data.length, total: data.length };
    }
    const { page: serverPage, total } = paginationData;
    const startRecord = (serverPage - 1) * pagination.pageSize + 1;
    const endRecord = Math.min(startRecord + data.length - 1, total);
    return { startRecord, endRecord, total };
  }, [paginationData, data, pagination.pageSize]);

  const renderHeaderCell = (
    header: ReturnType<typeof table.getFlatHeaders>[number],
  ): JSX.Element | null => {
    if (isLoading) {
      return <Skeleton className="h-4 max-w-62.5 bg-gray-300" />;
    }
    if (header.isPlaceholder) {
      return null;
    }
    return flexRender(header.column.columnDef.header, header.getContext()) as JSX.Element;
  };

  const renderTableBody = (): JSX.Element | JSX.Element[] => {
    if (isLoading) {
      return Array.from({ length: rowCount }).map((value, rowIndex) => (
        <TableRow key={`${rowIndex}-${value}`}>
          {Array.from({ length: columns.length }).map((value, colIndex) => (
            <TableCell key={`${colIndex}-${value}`}>
              <Skeleton className="h-4 max-w-62.5 bg-gray-300" />
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    if (table.getRowModel().rows?.length) {
      return table.getRowModel().rows.map((row) => (
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
      ));
    }

    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          No results.
        </TableCell>
      </TableRow>
    );
  };

  return (
    <>
      <div className="border-y bg-white">
        <Table>
          <TableHeader className="bg-gray-50 font-medium">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-black">
                    {renderHeaderCell(header)}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>{renderTableBody()}</TableBody>
        </Table>
      </div>
      <div className="mr-2 flex flex-wrap items-center justify-between gap-2 py-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-400">
            {manualPagination ? (
              <>
                Showing {record.startRecord} to {record.endRecord} of {record.total} entries
              </>
            ) : (
              <>
                Showing{' '}
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}{' '}
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
          <div className="flex items-center gap-2">
            <span className="text-sm whitespace-nowrap text-gray-400">Rows per page</span>
            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(value) => {
                table.setPagination({ pageIndex: 0, pageSize: Number(value) });
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || isLoading}
            child="Previous"
          />
          {getPageNumbers(currentPage, table.getPageCount()).map((pageNum, idx) =>
            pageNum === '...' ? (
              <span key={`ellipsis-${idx}-${pageNum}`} className="px-2 text-sm text-gray-400">
                ...
              </span>
            ) : (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => table.setPageIndex(pageNum - 1)}
                disabled={isLoading}
                child={String(pageNum)}
                className="min-w-8"
              />
            ),
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={
              (manualPagination ? record.endRecord === record.total : !table.getCanNextPage()) ||
              isLoading
            }
            child="Next"
          />
        </div>
      </div>
    </>
  );
};

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
