import { useState } from 'react';
import { ColumnsWithType } from '../interface';

function useFilter<T>(column: ColumnsWithType<T> & { colSpan: number }) {
  const [filteredValue, setFilteredValue] = useState<string[]>(() => {
    return column.filteredValue || column.defaultFilteredValue || [];
  });

  return { filteredValue, setFilteredValue };
}

export default useFilter;
