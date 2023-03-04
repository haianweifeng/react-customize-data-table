import { useState, useEffect, useMemo, useCallback } from 'react';
import omit from 'omit.js';
import type {
  ColumnType,
  ColumnsType,
  RowSelectionType,
  Expandable,
  PrivateColumnGroupType,
  PrivateColumnType,
  PrivateColumnsType,
} from '../interface1';
import { SELECTION_EXPAND_COLUMN_WIDTH } from '../utils/constant';
// todo 考虑过滤值发生变化后导致列变化 但是目前没有更新列
// todo 考虑如果是children的列不能再设置type
function useColumns<T>(
  originColumns: ColumnsType<T>,
  rowSelection?: RowSelectionType<T>,
  expandable?: Expandable<T>,
) {
  // todo 待测试如果是其中一层children 设置了fixed
  const existFixedInColumn = useCallback(
    (columns: PrivateColumnsType<T>, fixed: 'left' | 'right'): boolean => {
      let exist: boolean;
      const lastColumn = columns[columns.length - 1];
      if ('children' in lastColumn && lastColumn?.children.length) {
        if (lastColumn.fixed === fixed) {
          return true;
        } else {
          exist = existFixedInColumn(lastColumn.children, fixed);
        }
      } else {
        exist = lastColumn.fixed === fixed;
      }
      return exist;
    },
    [],
  );

  const addFixedToColumn = useCallback(
    (columns: PrivateColumnsType<T>, fixed: 'left' | 'right'): PrivateColumnsType<T> => {
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

  const flatColumns = useCallback((columns: PrivateColumnsType<T>) => {
    const flattenColumns: PrivateColumnsType<T> = [];
    columns.map((column) => {
      if ('children' in column && column?.children.length) {
        flattenColumns.push(...flatColumns(column.children));
      } else {
        flattenColumns.push(column);
      }
    });
    return flattenColumns;
  }, []);
  // todo 考虑expand checkbox radio 的render
  const getMergeColumns = useCallback(() => {
    console.log('gegeg');
    let existExpand = false;
    let existSelection = false;
    const selectionColumn: ColumnType<T> = {};

    const mergeColumns: PrivateColumnsType<T> = [];

    if (rowSelection) {
      selectionColumn.key = 'selection';
      selectionColumn.type = rowSelection.type || 'checkbox';
      selectionColumn.width =
        parseInt(`${rowSelection.columnWidth}`, 10) || SELECTION_EXPAND_COLUMN_WIDTH;
      selectionColumn.title = rowSelection?.columnTitle || '';
    }

    originColumns.map((column) => {
      if (column?.type === 'checkbox' || column?.type === 'radio') {
        existSelection = true;
        mergeColumns.push({ ...column, ...omit(selectionColumn, ['type']) });
      }
      if (column?.type === 'expand') {
        existExpand = typeof column?.render === 'function';
        if (expandable && (expandable?.expandedRowRender || typeof column?.render === 'function')) {
          mergeColumns.push({
            ...column,
            key: 'expand',
            title: expandable.columnTitle || '',
            width: parseInt(`${expandable?.columnWidth}`, 10) || SELECTION_EXPAND_COLUMN_WIDTH,
          });
        }
      } else {
        mergeColumns.push({ ...column, type: 'default' });
      }
    });

    if (!existExpand && expandable && expandable?.expandedRowRender) {
      mergeColumns.unshift({
        type: 'expand',
        key: 'expand',
        width: parseInt(`${expandable?.columnWidth}`, 10) || SELECTION_EXPAND_COLUMN_WIDTH,
        title: expandable.columnTitle || '',
      });
    }
    if (!existSelection && rowSelection) {
      mergeColumns.unshift(selectionColumn);
    }
    return mergeColumns;
    // eslint-disable-line react-hooks/exhaustive-deps
  }, [originColumns]);

  const initMergeColumns = useMemo(() => {
    return getMergeColumns();
  }, [getMergeColumns]);

  const [mergeColumns, setMergeColumns] = useState<PrivateColumnsType<T>>(initMergeColumns);

  // useEffect(() => {
  //   setMergeColumns(initMergeColumns);
  // }, [initMergeColumns]);

  const fixedColumns = useMemo(() => {
    let leftIndex = -1;
    let rightIndex = -1;
    return mergeColumns
      .map((column, index: number) => {
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
      })
      .map((column, index) => {
        const col: PrivateColumnType<T> | PrivateColumnGroupType<T> = { ...column };
        if (index <= leftIndex) col.fixed = 'left';
        if (index === leftIndex) col._lastLeftFixed = true;
        if (index >= rightIndex && rightIndex > 0) col.fixed = 'right';
        if (index === rightIndex) col._firstRightFixed = true;
        return col;
      });
  }, [mergeColumns, existFixedInColumn, addFixedToColumn]);
  // 如果是表头分级 只会计算第一层的宽度
  const flattenColumns = useMemo(() => {
    return flatColumns(fixedColumns);
  }, [fixedColumns, flatColumns]);

  const updateMergeColumns = useCallback((columns: PrivateColumnsType<T>) => {
    setMergeColumns(columns);
  }, []);

  return [
    mergeColumns,
    fixedColumns,
    flattenColumns,
    updateMergeColumns,
    initMergeColumns,
  ] as const;
}
export default useColumns;
