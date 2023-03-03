import React, { useState, useEffect, useCallback } from 'react';
import { getColumnKey } from '../utils/util';
import { PrivateColumnsType, Sorter, SortState } from '../interface1';

function useSorter<T extends { key?: React.Key; children?: T[] }>(
  mergeColumns: PrivateColumnsType<T>,
) {
  const generateSortStates = useCallback((columns: PrivateColumnsType<T>, columnIndex?: number) => {
    const sortStates: SortState<T>[] = [];

    columns.forEach((column, index) => {
      if ('sorter' in column) {
        const sorterState = {
          key: getColumnKey(column, columnIndex ? `${columnIndex}_${index}` : index),
          order: column.sortOrder || column.defaultSortOrder || null,
        } as SortState<T>;
        if (typeof column.sorter === 'object') {
          sorterState.sorter = (column.sorter as Sorter<T>).compare;
          sorterState.weight = (column.sorter as Sorter<T>).weight;
        } else {
          sorterState.sorter = column.sorter as (rowA: T, rowB: T) => number;
        }
        sortStates.push(sorterState);
      }
      if ('children' in column && column.children.length) {
        sortStates.push(...generateSortStates(column.children, index));
      }
    });
    return sortStates;
  }, []);

  const [sorterStates, setSorterStates] = useState<SortState<T>[]>(() => {
    return generateSortStates(mergeColumns);
  });

  const updateSorterStates = useCallback((newSorterStates: SortState<T>[]) => {
    setSorterStates(newSorterStates);
  }, []);

  const getSortData = useCallback(
    (data: T[]) => {
      let records: T[] = [...data];
      if (!sorterStates.length) return records;
      sorterStates
        .sort((a, b) => {
          const a1 = (a.weight || 0).toString();
          const b1 = (b.weight || 0).toString();
          return a1.localeCompare(b1);
        })
        .forEach((sorterState) => {
          records.sort((a, b) => {
            const compareResult = sorterState.sorter(a, b);
            if (compareResult !== 0) {
              return sorterState.order === 'asc' ? compareResult : -compareResult;
            }
            return compareResult;
          });
        });
      records = records.map((record) => {
        if (record.children && record.children.length) {
          return {
            ...record,
            children: getSortData(record.children),
          };
        }
        return record;
      });
      return records;
    },
    [sorterStates],
  );

  useEffect(() => {
    const findExistControlledSortOrder = (columns: PrivateColumnsType<T>) => {
      for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        if ('sortOrder' in column) {
          return true;
        }
        if ('children' in column && column.children.length) {
          const result = findExistControlledSortOrder(column.children);
          if (result) return true;
        }
      }
      return false;
    };

    const existControlledSortOrder = findExistControlledSortOrder(mergeColumns);

    if (existControlledSortOrder) {
      const newSorterStates = generateSortStates(mergeColumns);
      setSorterStates(newSorterStates);
    }
  }, [mergeColumns]);

  return [sorterStates, updateSorterStates, getSortData] as const;
}
export default useSorter;
