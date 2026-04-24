import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

export function DataTable<T>({ data, columns, page, totalPages, onPageChange, isLoading }: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {columns.map((col, i) => (
                <TableHead key={i} className="font-semibold">{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex justify-center items-center text-muted-foreground">Gathering records...</div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  No records to display.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => (
                <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                  {columns.map((col, j) => (
                    <TableCell key={j} className="py-3">
                      {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {page && totalPages !== undefined && totalPages > 1 && (
        <div className="flex items-center justify-end space-x-4 pt-2">
          <div className="text-sm font-medium text-muted-foreground">Page {page} of {totalPages}</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onPageChange?.(page - 1)} disabled={page <= 1} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onPageChange?.(page + 1)} disabled={page >= totalPages} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
