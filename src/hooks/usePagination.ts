import { useState, useEffect, useCallback } from 'react';
import type { PaginationProps } from '../index';

function usePagination(pagination?: PaginationProps) {
  const [currentPage, setCurrentPage] = useState<number>(() => {
    return pagination?.current || pagination?.defaultCurrent || 1;
  });

  const [pageSize, setPageSize] = useState<number>(() => {
    return pagination?.pageSize || pagination?.defaultPageSize || 10;
  });

  const updateCurrentPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePaginationChange = useCallback(
    (current: number, size: number) => {
      if (pagination && !('current' in pagination)) {
        setCurrentPage(current);
      }
      if (pagination && !('pageSize' in pagination)) {
        setPageSize(size);
      }
      if (typeof pagination?.onChange === 'function') {
        pagination.onChange(current, size);
      }
    },
    [pagination],
  );

  useEffect(() => {
    if (pagination && 'current' in pagination) {
      setCurrentPage(pagination?.current || 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination?.current]);

  useEffect(() => {
    if (pagination && 'pageSize' in pagination) {
      setPageSize(pagination?.pageSize || 10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination?.pageSize]);

  return [currentPage, pageSize, updateCurrentPage, handlePaginationChange] as const;
}
export default usePagination;
