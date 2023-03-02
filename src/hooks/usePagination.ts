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

  const updatePageSize = useCallback((size: number) => {
    setPageSize(size);
  }, []);

  useEffect(() => {
    if (pagination && 'current' in pagination) {
      setCurrentPage(pagination?.current || 1);
    }
  }, [pagination]);

  useEffect(() => {
    if (pagination && 'pageSize' in pagination) {
      setPageSize(pagination?.pageSize || 10);
    }
  }, [pagination]);

  return [currentPage, pageSize, updateCurrentPage, updatePageSize] as const;
}
export default usePagination;
