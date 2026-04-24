import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  isLoading?: boolean;
}

export function DataTable<T>({ data, columns, pageSize = 10, isLoading }: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = data.slice(startIndex, startIndex + pageSize);

  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5;
    
    if (totalPages <= showMax + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              {columns.map((col, i) => (
                <TableHead key={i} className="font-bold text-xs uppercase tracking-wider h-11">{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground animate-pulse">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    Gathering records...
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center text-muted-foreground">
                  No records to display.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, i) => (
                <TableRow key={i} className="hover:bg-muted/20 transition-colors border-b last:border-0 h-14">
                  {columns.map((col, j) => (
                    <TableCell key={j} className="py-2">
                      {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-30"
          >
            Previous
          </Button>

          <div className="flex items-center space-x-1">
            {getPageNumbers().map((p, i) => (
              <React.Fragment key={i}>
                {p === '...' ? (
                  <span className="px-2 text-muted-foreground tracking-widest">...</span>
                ) : (
                  <Button
                    variant={currentPage === p ? "outline" : "ghost"}
                    size="sm"
                    className={`h-9 w-9 p-0 font-medium transition-all ${currentPage === p ? "border-primary/40 text-primary shadow-sm bg-primary/5" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setCurrentPage(p as number)}
                  >
                    {p}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="text-primary font-semibold hover:bg-primary/5 transition-colors disabled:opacity-30"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
