import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import type {
  PrivateColumnGroupType,
  PrivateColumnsType,
  PrivateColumnType,
  Sorter,
  SorterResult,
  SortState,
} from '../interface';
import { omitColumnProps } from '../utils/util';

function useSorter<T extends { key?: React.Key; children?: T[] }>(
  mergeColumns: PrivateColumnsType<T>,
  onSort?: (sortResult: SorterResult<T>) => void,
) {
  const generateSortStates = useCallback((columns: PrivateColumnsType<T>) => {
    const sortStates: SortState<T>[] = [];

    columns.forEach((column) => {
      if ('sorter' in column && (column?.defaultSortOrder || column?.sortOrder)) {
        const sorterState = {
          key: column._columnKey,
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
        sortStates.push(...generateSortStates(column.children));
      }
    });
    return sortStates;
  }, []);

  const [sorterStates, setSorterStates] = useState<SortState<T>[]>(() => {
    return generateSortStates(mergeColumns);
  });

  const handleSortChange = useCallback(
    (column: PrivateColumnType<T> | PrivateColumnGroupType<T>, order: 'asc' | 'desc') => {
      const index = sorterStates.findIndex((sorterState) => sorterState.key === column._columnKey);
      const isCancel = index >= 0 && sorterStates[index].order === order;

      if (isCancel) {
        const filterResult = sorterStates.filter(
          (sorterState) => sorterState.key !== column._columnKey,
        );
        if (!('sortOrder' in column)) {
          setSorterStates(filterResult);
        }
        onSort &&
          onSort({
            column: omitColumnProps(column),
            order: null,
            field: 'dataIndex' in column ? column.dataIndex : undefined,
          });
        return;
      }
      if (typeof column?.sorter === 'object') {
        if (index >= 0) {
          const copyList = [...sorterStates];
          const item = sorterStates[index];
          item.order = order;
          copyList.splice(index, 1, item);
          if (!('sortOrder' in column)) {
            setSorterStates(copyList);
          }
        } else {
          const newSorterStates =
            sorterStates.length === 1 && sorterStates[0]?.weight === undefined
              ? []
              : [...sorterStates];
          newSorterStates.push({
            order,
            key: column._columnKey,
            sorter: (column.sorter as Sorter<T>).compare,
            weight: (column.sorter as Sorter<T>).weight,
          });
          if (!('sortOrder' in column)) {
            setSorterStates(newSorterStates);
          }
        }
      } else if (typeof column?.sorter === 'function') {
        if (!('sortOrder' in column)) {
          setSorterStates([
            {
              key: column._columnKey,
              order,
              sorter: column.sorter as (rowA: T, rowB: T) => number,
            },
          ]);
        }
      }
      onSort &&
        onSort({
          column: omitColumnProps(column),
          order,
          field: 'dataIndex' in column ? column.dataIndex : undefined,
        });
    },
    [sorterStates, onSort],
  );

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
  }, [mergeColumns, generateSortStates]);

  return [sorterStates, getSortData, handleSortChange] as const;
}
export default useSorter;
