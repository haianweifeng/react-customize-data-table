import { useMemo, useCallback } from 'react';
import type { ColumnType, ColumnsType, RowSelectionType, ExpandableType } from '../interface1';
import { SELECTION_EXPAND_COLUMN_WIDTH } from '../utils/constant';
import { parseValue } from '../utils/util';

function useColumns<T>(
  originColumns: ColumnsType<T>,
  rowSelection?: RowSelectionType<T>,
  expandable?: ExpandableType<T>,
) {
  const existFixedInColumn = useCallback(
    (columns: ColumnsType<T>, fixed: 'left' | 'right'): boolean => {
      let exist: boolean;
      const lastColumn = columns[columns.length - 1];
      if ('children' in lastColumn && lastColumn?.children.length) {
        exist = existFixedInColumn(lastColumn.children, fixed);
      } else {
        exist = lastColumn.fixed === fixed;
      }
      return exist;
    },
    [],
  );

  const addFixedToColumn = useCallback(
    (columns: ColumnsType<T>, fixed: 'left' | 'right'): ColumnsType<T> => {
      return columns.map((c) => {
        if ('children' in c && c?.children.length) {
          return {
            ...c,
            fixed,
            children: addFixedToColumn(c.children, fixed),
          };
        }
        return { ...c, fixed };
      });
    },
    [],
  );

  const flatColumns = useCallback((columns: ColumnsType<T>) => {
    const flattenColumns: ColumnsType<T> = [];
    columns.map((column: any) => {
      if ('children' in column && column?.children.length) {
        flattenColumns.push(...flatColumns(column.children));
      } else {
        flattenColumns.push(column);
      }
    });
    return flattenColumns;
  }, []);

  const mergeColumns = useMemo(() => {
    let existExpand = false;
    let existSelection = false;
    const selectionColumn: ColumnType<T> = {};

    const mergeColumns: ColumnsType<T> = [];

    if (rowSelection) {
      selectionColumn.key = 'selection';
      selectionColumn.type = rowSelection.type || 'checkbox';
      selectionColumn.width = parseValue(rowSelection.columnWidth) || SELECTION_EXPAND_COLUMN_WIDTH;
      selectionColumn.title = rowSelection?.columnTitle || '';
    }

    originColumns.map((column) => {
      if (column?.type === 'checkbox' || column?.type === 'radio') {
        existSelection = true;
        mergeColumns.push({ ...column, ...selectionColumn });
      }
      if (column?.type === 'expand') {
        existExpand = typeof column?.render === 'function';
        if (expandable && (expandable?.expandedRowRender || typeof column?.render === 'function')) {
          mergeColumns.push({
            ...column,
            key: 'expand',
            title: expandable.columnTitle || '',
            width: expandable?.columnWidth || SELECTION_EXPAND_COLUMN_WIDTH,
          });
        }
      }
      mergeColumns.push(column);
    });
    if (!existExpand && expandable && expandable?.expandedRowRender) {
      mergeColumns.unshift({
        type: 'expand',
        key: 'expand',
        width: parseValue(expandable?.columnWidth) || SELECTION_EXPAND_COLUMN_WIDTH,
        title: expandable.columnTitle || '',
      });
    }
    if (!existSelection && rowSelection) {
      mergeColumns.unshift(selectionColumn);
    }
    return mergeColumns;
  }, [originColumns, rowSelection, expandable]);

  const fixedColumns = useMemo(() => {
    let leftIndex = -1;
    let rightIndex = -1;
    return mergeColumns.map((column, index: number) => {
      if ('children' in column && column?.children.length) {
        const isFixedLeft = column.fixed === 'left';
        const isFixedRight = column.fixed === 'right';

        if (isFixedLeft || !column.fixed) {
          let exist = false;
          if (!column.fixed) {
            exist = existFixedInColumn(column.children, 'left');
          }
          if (isFixedLeft || exist) {
            leftIndex = index;
            const children = addFixedToColumn(column.children, 'left');
            column.children = children;
            column.fixed = 'left';
          }
        }

        if (isFixedRight || !column.fixed) {
          let exist = false;
          if (!column.fixed) {
            exist = existFixedInColumn(column.children, 'right');
          }
          if (isFixedRight || exist) {
            if (rightIndex < 0) rightIndex = index;
            const children = addFixedToColumn(column.children, 'right');
            column.children = children;
            column.fixed = 'right';
          }
        }
      } else {
        if (column.fixed === 'left') leftIndex = index;
        if (column.fixed === 'right' && rightIndex < 0) rightIndex = index;
      }
      return column;
    });
  }, [mergeColumns, existFixedInColumn, addFixedToColumn]);

  const flattenColumns = useMemo(() => {
    return flatColumns(fixedColumns);
  }, [fixedColumns]);

  return [mergeColumns, fixedColumns, flattenColumns];
}
export default useColumns;
