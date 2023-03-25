import React, { useState, useMemo, useCallback } from 'react';
import omit from 'omit.js';
import type {
  ColumnsType,
  RowSelection,
  Expandable,
  PrivateColumnGroupType,
  PrivateColumnType,
  PrivateColumnsType,
  ColumnGroupType,
} from '../interface1';
import { SELECTION_EXPAND_COLUMN_WIDTH } from '../utils/constant';
import { getColumnKey } from '../utils/util';
// todo 考虑如果是children的列不能再设置type
function useColumns<T>(
  originColumns: ColumnsType<T>,
  rowSelection?: RowSelection<T>,
  expandable?: Expandable<T>,
) {
  const existFixedInColumn = useCallback(
    (columns: PrivateColumnsType<T>, fixed: 'left' | 'right'): boolean => {
      let exist: boolean;
      const targetColumn = fixed === 'left' ? columns[columns.length - 1] : columns[0];
      if ('children' in targetColumn && targetColumn?.children.length) {
        if (targetColumn.fixed === fixed) {
          return true;
        } else {
          exist = existFixedInColumn(targetColumn.children, fixed);
        }
      } else {
        exist = targetColumn.fixed === fixed;
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

  const addLastLeftFixedPropForColumn = useCallback(
    (columns: PrivateColumnsType<T>): PrivateColumnsType<T> => {
      return columns.map((column, index) => {
        const isLastColumn = columns.length - 1 === index;
        if (isLastColumn && 'children' in column && column?.children.length) {
          return {
            ...column,
            _lastLeftFixed: true,
            children: addLastLeftFixedPropForColumn(column.children),
          };
        }
        return { ...column, _lastLeftFixed: isLastColumn };
      });
    },
    [],
  );

  const addFirstRightFixedPropsForColumn = useCallback(
    (columns: PrivateColumnsType<T>): PrivateColumnsType<T> => {
      return columns.map((column, index) => {
        const isFirstColumn = index === 0;
        if (isFirstColumn && 'children' in column && column?.children.length) {
          return {
            ...column,
            _firstRightFixed: true,
            children: addFirstRightFixedPropsForColumn(column.children),
          };
        }
        return { ...column, _firstRightFixed: isFirstColumn };
      });
    },
    [],
  );

  const addColumnKeyForColumn = useCallback((columns: ColumnsType<T>, pos?: number) => {
    const mergeColumns: PrivateColumnsType<T> = [];
    columns.map((column, index) => {
      if ('children' in column && column.children.length) {
        mergeColumns.push({
          ...column,
          _columnKey: getColumnKey(column, pos ? `${pos}_${index}` : index),
          children: addColumnKeyForColumn(column.children, index),
        });
      } else {
        mergeColumns.push({
          ...column,
          _columnKey: getColumnKey(column, pos ? `${pos}_${index}` : index),
        });
      }
    });
    return mergeColumns;
  }, []);

  const flatColumns = useCallback((columns: PrivateColumnsType<T>) => {
    const flattenColumns: PrivateColumnsType<T> = [];
    columns.map((column) => {
      if ('children' in column && column?.children.length) {
        flattenColumns.push(...flatColumns(column.children));
      } else {
        flattenColumns.push({ ...column });
      }
    });
    return flattenColumns;
  }, []);

  const getMergeColumns = useCallback(() => {
    let existExpand = false;
    let existSelection = false;

    const mergeColumns: PrivateColumnsType<T> = [];

    originColumns.map((column, index) => {
      if ('type' in column && (column?.type === 'checkbox' || column?.type === 'radio')) {
        existSelection = true;
        if ('children' in column) {
          console.error(
            "column.children is not allowed when column is 'checkbox' | 'radio' | 'expand'.",
          );
        }
        mergeColumns.push({
          key: 'SELECTION_COLUMN',
          ...omit(column as ColumnGroupType<T>, ['children']),
          _columnKey: getColumnKey(column, 'SELECTION_COLUMN'),
          title: rowSelection?.columnTitle || column.title || '',
          width: rowSelection?.columnWidth || SELECTION_EXPAND_COLUMN_WIDTH,
        });
        return;
      }
      if ('type' in column && column?.type === 'expand') {
        if (expandable && expandable?.expandedRowRender) {
          existExpand = true;
          if ('children' in column) {
            console.error(
              "column.children is not allowed when column is 'checkbox' | 'radio' | 'expand'.",
            );
          }
          mergeColumns.push({
            key: 'EXPAND_COLUMN',
            ...omit(column as ColumnGroupType<T>, ['children']),
            _columnKey: getColumnKey(column, 'EXPAND_COLUMN'),
            title: expandable?.columnTitle || column.title || '',
            width: expandable?.columnWidth || SELECTION_EXPAND_COLUMN_WIDTH,
          });
        }
        return;
      }
      const mergeColumn = { ...column, _columnKey: getColumnKey(column, index) };
      if ('children' in column && column.children.length) {
        (mergeColumn as PrivateColumnGroupType<T>).children = addColumnKeyForColumn(
          column.children,
          index,
        );
      }
      mergeColumns.push(mergeColumn);
    });

    if (!existExpand && expandable && expandable?.expandedRowRender) {
      mergeColumns.unshift({
        type: 'expand',
        key: 'EXPAND_COLUMN',
        _columnKey: 'EXPAND_COLUMN',
        title: expandable.columnTitle || '',
        width: expandable?.columnWidth || SELECTION_EXPAND_COLUMN_WIDTH,
      });
    }
    if (!existSelection && rowSelection) {
      mergeColumns.unshift({
        type: rowSelection.type || 'checkbox',
        key: 'SELECTION_COLUMN',
        _columnKey: 'SELECTION_COLUMN',
        title: rowSelection?.columnTitle || '',
        width: rowSelection.columnWidth || SELECTION_EXPAND_COLUMN_WIDTH,
      });
    }
    return mergeColumns;
    // eslint-disable-line react-hooks/exhaustive-deps
  }, [originColumns, addColumnKeyForColumn]);

  const initMergeColumns = useMemo(() => {
    return getMergeColumns();
  }, [getMergeColumns]);

  const [mergeColumns, setMergeColumns] = useState<PrivateColumnsType<T>>(initMergeColumns);

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
        if (index === leftIndex) {
          if ('children' in col && col?.children.length) {
            col.children = addLastLeftFixedPropForColumn(col.children);
          }
          col._lastLeftFixed = true;
        }
        if (index >= rightIndex && rightIndex > 0) col.fixed = 'right';
        if (index === rightIndex) {
          if ('children' in col && col?.children.length) {
            col.children = addFirstRightFixedPropsForColumn(col.children);
          }
          col._firstRightFixed = true;
        }
        return col;
      });
  }, [
    mergeColumns,
    existFixedInColumn,
    addFixedToColumn,
    addLastLeftFixedPropForColumn,
    addFirstRightFixedPropsForColumn,
  ]);

  const flattenColumns = useMemo(() => {
    return flatColumns(fixedColumns);
  }, [fixedColumns, flatColumns]);

  const updateMergeColumns = useCallback((columns: PrivateColumnsType<T>) => {
    setMergeColumns(columns);
  }, []);

  const addWidthForColumns = useCallback(
    (columnsWidth: Map<React.Key, number>, columns: PrivateColumnsType<T>) => {
      const widthColumns: PrivateColumnsType<T> = [];
      columns.map((column) => {
        if ('children' in column && column.children.length) {
          if (columnsWidth.get(column._columnKey)) {
            widthColumns.push({
              ...column,
              _width: columnsWidth.get(column._columnKey),
              children: addWidthForColumns(columnsWidth, column.children),
            });
          } else {
            widthColumns.push({
              ...column,
              children: addWidthForColumns(columnsWidth, column.children),
            });
          }
        } else if (columnsWidth.get(column._columnKey)) {
          widthColumns.push({ ...column, _width: columnsWidth.get(column._columnKey) });
        } else {
          widthColumns.push({ ...column });
        }
      });
      return widthColumns;
    },
    [],
  );

  return [
    mergeColumns,
    fixedColumns,
    flattenColumns,
    updateMergeColumns,
    initMergeColumns,
    flatColumns,
    addWidthForColumns,
  ] as const;
}
export default useColumns;
