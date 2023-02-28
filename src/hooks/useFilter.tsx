import React, { useState, useEffect, useCallback } from 'react';
import { PrivateColumnsType, FilterState } from '../interface1';
import { getColumnKey } from '../utils/util';

function useFilter<T extends { key?: React.Key; children?: T[] }>(
  mergeColumns: PrivateColumnsType<T>,
) {
  const generateFilterStates = useCallback(
    (columns: PrivateColumnsType<T>, columnIndex?: number) => {
      const filterStates: FilterState<T>[] = [];

      columns.forEach((column, index) => {
        if (column.filters || typeof column.filterMethod === 'function') {
          filterStates.push({
            key: getColumnKey(column, columnIndex ? `${columnIndex}_${index}` : index),
            filteredValue: column?.filteredValue || column?.defaultFilteredValue || [],
            filterMethod: column?.filterMethod,
          });
        }
        if ('children' in column && column.children.length) {
          filterStates.push(...generateFilterStates(column.children, index));
        }
      });

      return filterStates;
    },
    [],
  );

  const [filterStates, setFilterStates] = useState<FilterState<T>[]>(() => {
    return generateFilterStates(mergeColumns);
  });

  const updateFilterStates = useCallback((newFilterStates: FilterState<T>[]) => {
    setFilterStates(newFilterStates);
  }, []);

  useEffect(() => {
    const findExistControlledFilterValue = (columns: PrivateColumnsType<T>) => {
      for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        if ('filteredValue' in column) {
          return true;
        }
        if ('children' in column && column.children.length) {
          const result = findExistControlledFilterValue(column.children);
          if (result) return true;
        }
      }
      return false;
    };

    const existControlledFilterValue = findExistControlledFilterValue(mergeColumns);

    if (existControlledFilterValue) {
      const newFilterStates = generateFilterStates(mergeColumns);
      setFilterStates(newFilterStates);
    }
  }, [mergeColumns]);

  return [filterStates, updateFilterStates] as const;
}
export default useFilter;
