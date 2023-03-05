import React, { useMemo, useCallback } from 'react';
import omit from 'omit.js';
import classnames from 'classnames';
import type {
  ResizeInfo,
  ColumnType,
  ColumnGroupType,
  PrivateColumnType,
  PrivateColumnsType,
  PrivateColumnGroupType,
  SortState,
  FilterState,
} from '../interface1';
import Th from '../Th';
import type { ThProps } from '../Th';
import { getColumnKey } from '../utils/util';

interface TheadProps<T> {
  bordered: boolean;
  sorterStates: SortState<T>[];
  filterStates: FilterState<T>[];
  locale: Record<string, string>;
  checked: boolean | 'indeterminate';
  columns: PrivateColumnsType<T>;
  headerCellClassName?: (
    column: ColumnType<T> | ColumnGroupType<T>,
    rowIndex: number,
    colIndex: number,
  ) => string | string;
  headerCellStyle?: (
    column: ColumnType<T> | ColumnGroupType<T>,
    rowIndex: number,
    colIndex: number,
  ) => React.CSSProperties | React.CSSProperties;
  onSelectAll: (selected: boolean) => void;
  onSort: (
    col: ColumnGroupType<T> | ColumnType<T>,
    order: 'asc' | 'desc',
    columnKey: React.Key,
  ) => void;
  onFilterChange: (
    col: PrivateColumnType<T> | PrivateColumnGroupType<T>,
    filteredValue: React.Key[],
    columnKey: React.Key,
  ) => void;
  onMouseDown: (resizeInfo: ResizeInfo, col: PrivateColumnType<T>, colIndex: number) => void;
}
// todo onHeaderRowEvents
function Thead<T>(props: TheadProps<T>) {
  const {
    locale,
    bordered,
    checked,
    columns,
    sorterStates,
    filterStates,
    onSelectAll,
    onSort,
    onFilterChange,
    onMouseDown,
    headerCellClassName,
    headerCellStyle,
  } = props;

  const parseHeaderColumns = useCallback(
    (cols: PrivateColumnsType<T>, parentCol?: PrivateColumnGroupType<T>, lastColumn?: boolean) => {
      const headerColumns: PrivateColumnsType<T> = [];

      cols.map((col, index: number) => {
        const isLastColumn = index === cols.length - 1;
        const _ignoreRightBorder = !!(
          bordered &&
          isLastColumn &&
          (!parentCol || (parentCol && lastColumn))
        );
        if ('children' in col && col?.children.length) {
          const column: PrivateColumnGroupType<T> = {
            ...col,
            colSpan: 0,
            _ignoreRightBorder,
          } as PrivateColumnGroupType<T>;
          column.children = parseHeaderColumns(col?.children, column, !parentCol && isLastColumn);
          if (parentCol && 'colSpan' in parentCol) {
            (parentCol.colSpan as number) += column.colSpan as number;
          }
          headerColumns.push(column);
        } else {
          if (parentCol && 'colSpan' in parentCol) {
            (parentCol.colSpan as number) += 1;
          }
          if (col?.colSpan === 0) return;
          headerColumns.push({ ...col, colSpan: col?.colSpan || 1, _ignoreRightBorder });
        }
      });

      return headerColumns;
    },
    [bordered],
  );

  const computeTrs = useCallback(
    (cols: PrivateColumnsType<T>, rowIndex = 0, trs: React.ReactNode[][]) => {
      for (let i = 0; i < cols.length; i++) {
        const col = cols[i];
        if (!Array.isArray(trs[rowIndex])) {
          trs[rowIndex] = [];
        }
        if ('children' in col && col?.children.length) {
          computeTrs(col.children, rowIndex + 1, trs);
        }
      }
    },
    [],
  );

  const handleChange = useCallback(
    (selected: boolean) => {
      onSelectAll(selected);
    },
    [onSelectAll],
  );

  const renderCell = useCallback((thProps: ThProps<T>) => {
    return <Th {...thProps} key={thProps.columnKey} />;
  }, []);

  const renderCells = useCallback(
    (
      column: PrivateColumnType<T> | PrivateColumnGroupType<T>,
      trs: React.ReactNode[][],
      rowIndex: number,
      colIndex: number,
      pos?: number,
    ) => {
      const totalRows = trs.length;
      const colClassName = column.className || '';
      const cellClassName =
        typeof headerCellClassName === 'function'
          ? headerCellClassName(
              omit(column, ['_ignoreRightBorder', '_lastLeftFixed', '_firstRightFixed', '_width']),
              rowIndex,
              colIndex,
            )
          : headerCellClassName || '';

      const classes = {
        'cell-fixed-left': column.fixed === 'left',
        'cell-fixed-right': column.fixed === 'right',
        'cell-is-last-fixedLeft': !!column._lastLeftFixed,
        'cell-is-first-fixedRight': !!column._firstRightFixed,
        'cell-ignore-right-border': column._ignoreRightBorder,
        [colClassName]: !!column.className,
        [cellClassName]: !!cellClassName,
      };

      const isSelectionExpand =
        'type' in column && column.type && ['expand', 'checkbox', 'radio'].includes(column.type);

      const cls = classnames({
        'cell-align-center': column.align === 'center',
        'cell-align-right': column.align === 'right',
        'selection-expand-column': isSelectionExpand,
        ...classes,
      });

      let styles: React.CSSProperties = {};
      if (typeof headerCellStyle === 'function') {
        styles = headerCellStyle(
          omit(column, ['_ignoreRightBorder', '_lastLeftFixed', '_firstRightFixed', '_width']),
          rowIndex,
          colIndex,
        );
      }

      let baseProps: ThProps<T> = {
        column,
        colIndex,
        rowIndex,
        locale,
        checked,
        bordered,
        style: styles,
        sorterStates,
        filterStates,
        onSort,
        onFilterChange,
        columnKey: getColumnKey(column, pos ? `${pos}_${colIndex}` : colIndex),
      } as ThProps<T>;

      if (isSelectionExpand) {
        baseProps = { ...baseProps, rowSpan: totalRows, className: cls, onSelectAll: handleChange };
        return trs[rowIndex].push(renderCell(baseProps));
      } else {
        if ('children' in column && column?.children.length) {
          baseProps = {
            ...baseProps,
            rowSpan: 1,
            className: classnames({
              'cell-align-center': true,
              'cell-ellipsis': !!column.ellipsis,
              ...classes,
            }),
          };
          trs[rowIndex].push(renderCell(baseProps));
          column.children.forEach((col, i) => {
            renderCells(col, trs, rowIndex + 1, i, colIndex);
          });
        } else {
          baseProps = { ...baseProps, rowSpan: totalRows - rowIndex, className: cls, onMouseDown };
          trs[rowIndex].push(renderCell(baseProps));
        }
      }

      // switch (column.type) {
      //   case 'checkbox':
      //   case 'radio':
      //   case 'expand':
      //     baseProps = Object.assign({}, baseProps, {
      //       rowSpan: totalRows,
      //       className: cls,
      //       onSelectAll: handleChange,
      //     });
      //     return trs[rowIndex].push(createTh(baseProps));
      //   default: {
      //     if ('children' in column && column?.children.length) {
      //       baseProps = Object.assign({}, baseProps, {
      //         rowSpan: 1,
      //         className: classnames({
      //           'cell-align-center': true,
      //           'cell-ellipsis': !!column.ellipsis,
      //           ...classes,
      //         }),
      //       });
      //       trs[rowIndex].push(createTh(baseProps));
      //       column.children.forEach((c, i) => {
      //         renderCells(c, trs, rowIndex + 1, i, colIndex);
      //       });
      //     } else {
      //       baseProps = Object.assign({}, baseProps, {
      //         rowSpan: totalRows - rowIndex,
      //         className: cls,
      //         onSort,
      //         onFilterChange,
      //         onMouseDown,
      //       });
      //       trs[rowIndex].push(createTh(baseProps));
      //     }
      //   }
      // }
    },
    [
      checked,
      bordered,
      sorterStates,
      filterStates,
      renderCell,
      onSort,
      onFilterChange,
      onMouseDown,
      handleChange,
      headerCellStyle,
      headerCellClassName,
    ],
  );

  const headerTrs = useMemo(() => {
    const trs: React.ReactNode[][] = [];
    computeTrs(columns, 0, trs);
    const headerColumns = parseHeaderColumns(columns);
    headerColumns.forEach((column, i) => renderCells(column, trs, 0, i));
    return trs;
  }, [columns, computeTrs, parseHeaderColumns, renderCells]);

  return (
    <thead>
      {headerTrs.map((cells, i) => {
        return <tr key={i}>{cells}</tr>;
      })}
    </thead>
  );
}
export default Thead;
