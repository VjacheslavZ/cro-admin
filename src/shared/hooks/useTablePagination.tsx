import { useState, useMemo, useCallback } from 'react';
import { TablePagination } from '@mui/material';

interface UseTablePaginationOptions {
  defaultRowsPerPage?: number;
  rowsPerPageOptions?: number[];
}

export function useTablePagination<T>(items: T[] | undefined, options?: UseTablePaginationOptions) {
  const { defaultRowsPerPage = 20, rowsPerPageOptions = [10, 20, 50] } = options ?? {};
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const paginatedItems = useMemo(
    () => items?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) ?? [],
    [items, page, rowsPerPage],
  );

  const handlePageChange = useCallback((_: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }, []);

  const Pagination = useCallback(
    () => (
      <TablePagination
        component="div"
        count={items?.length ?? 0}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={rowsPerPageOptions}
      />
    ),
    [
      items?.length,
      page,
      rowsPerPage,
      handlePageChange,
      handleRowsPerPageChange,
      rowsPerPageOptions,
    ],
  );

  return { paginatedItems, Pagination };
}
