import React, { useState, useEffect, useCallback } from 'react';
import { PrivateColumnsType, FilterState } from '../interface';

function useFilter<T extends { key?: React.Key; children?: T[] }>(
  mergeColumns: PrivateColumnsType<T>,
) {
  const generateFilterStates = useCallback((columns: PrivateColumnsType<T>) => {
    const filterStates: FilterState<T>[] = [];

    columns.forEach((column) => {
      if (column.filters || typeof column.filterMethod === 'function') {
        filterStates.push({
          key: column._columnKey,
          filteredValue: column?.filteredValue || column?.defaultFilteredValue || [],
          filterMethod: column?.filterMethod,
        });
      }
      if ('children' in column && column.children.length) {
        filterStates.push(...generateFilterStates(column.children));
      }
    });

    return filterStates;
  }, []);

  const [filterStates, setFilterStates] = useState<FilterState<T>[]>(() => {
    return generateFilterStates(mergeColumns);
  });

  const updateFilterStates = useCallback((newFilterStates: FilterState<T>[]) => {
    setFilterStates(newFilterStates);
  }, []);

  const getFilterData = useCallback(
    (data: T[]) => {
      if (!filterStates.length) return data;
      let records: T[] = [...data];
      filterStates.forEach((filterState) => {
        records = records.filter((r) => {
          let result = !filterState.filteredValue.length || !filterState?.filterMethod;
          for (let i = 0; i < filterState.filteredValue.length; i++) {
            if (typeof filterState?.filterMethod === 'function') {
              result = filterState.filterMethod(filterState.filteredValue[i], r);
              if (result) break;
            }
          }
          return result;
        });
      });
      return records;
    },
    [filterStates],
  );

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

  return [filterStates, updateFilterStates, getFilterData] as const;
}
export default useFilter;
