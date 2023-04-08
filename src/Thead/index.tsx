import React, { useMemo, useCallback } from 'react';
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
} from '../interface';
import Th from '../Th';
import type { ThProps } from '../Th';
import { omitColumnProps } from '../utils/util';
import {
  CLASS_CELL_FIXED_FIRST,
  CLASS_CELL_FIXED_LAST,
  CLASS_CELL_FIXED_LEFT,
  CLASS_CELL_FIXED_RIGHT,
  PREFIXCLS,
} from '../utils/constant';

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
  headerRowClassName?: (rowIndex: number) => string | string;
  headerRowStyle?: (rowIndex: number) => React.CSSProperties | React.CSSProperties;
  onSelectAll: (selected: boolean) => void;
  onSort: (col: PrivateColumnType<T> | PrivateColumnGroupType<T>, order: 'asc' | 'desc') => void;
  onFilterChange: (
    col: PrivateColumnType<T> | PrivateColumnGroupType<T>,
    filteredValue: React.Key[],
  ) => void;
  onMouseDown: (resizeInfo: ResizeInfo, col: PrivateColumnType<T>) => void;
  onHeaderRowEvents?: (rowIndex: number) => object;
  onHeaderCellEvents?: (column: ColumnType<T> | ColumnGroupType<T>, rowIndex: number) => object;
}

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
    headerRowStyle,
    headerRowClassName,
    onHeaderRowEvents,
    onHeaderCellEvents,
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
    (cols: PrivateColumnsType<T>, rowIndex = 0, trs: ThProps<T>[][]) => {
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

  const getCellsProps = useCallback(
    (
      column: PrivateColumnType<T> | PrivateColumnGroupType<T>,
      trs: ThProps<T>[][],
      rowIndex: number,
      colIndex: number,
    ) => {
      const totalRows = trs.length;
      const colClassName = column.className || '';
      const cellClassName =
        typeof headerCellClassName === 'function'
          ? headerCellClassName(omitColumnProps(column), rowIndex, colIndex)
          : headerCellClassName || '';

      const classes = {
        [CLASS_CELL_FIXED_LEFT]: column.fixed === 'left',
        [CLASS_CELL_FIXED_RIGHT]: column.fixed === 'right',
        [CLASS_CELL_FIXED_LAST]: !!column?._lastLeftFixed,
        [CLASS_CELL_FIXED_FIRST]: !!column?._firstRightFixed,
        [`${PREFIXCLS}-cell-ignore-right-border`]: column._ignoreRightBorder,
        [colClassName]: !!column.className,
        [cellClassName]: !!cellClassName,
      };

      const isSelectionExpand =
        'type' in column && column.type && ['expand', 'checkbox', 'radio'].includes(column.type);

      const cls = classnames({
        [`${PREFIXCLS}-cell-align-center`]: column.align === 'center',
        [`${PREFIXCLS}-cell-align-right`]: column.align === 'right',
        [`${PREFIXCLS}-selection-expand-column`]: isSelectionExpand,
        [`${PREFIXCLS}-cell-ellipsis`]: isSelectionExpand && !!column.ellipsis,
        ...classes,
      });

      const styles: React.CSSProperties =
        typeof headerCellStyle === 'function'
          ? headerCellStyle(omitColumnProps(column), rowIndex, colIndex) ?? {}
          : headerCellStyle || {};

      let baseProps: ThProps<T> = {
        column,
        locale,
        checked,
        bordered,
        style: styles,
        sorterStates,
        filterStates,
        onSort,
        onFilterChange,
        onMouseDown,
      } as ThProps<T>;
      if (isSelectionExpand) {
        baseProps = { ...baseProps, rowSpan: totalRows, className: cls };
        return trs[rowIndex].push(baseProps);
      }
      if ('children' in column && column?.children.length) {
        baseProps = {
          ...baseProps,
          rowSpan: 1,
          className: classnames({
            [`${PREFIXCLS}-cell-align-center`]: true,
            ...classes,
          }),
        };
        trs[rowIndex].push(baseProps);
        column.children.forEach((col, i) => {
          getCellsProps(col, trs, rowIndex + 1, i);
        });
      } else {
        baseProps = { ...baseProps, rowSpan: totalRows - rowIndex, className: cls };
        trs[rowIndex].push(baseProps);
      }
    },
    [
      locale,
      checked,
      bordered,
      sorterStates,
      filterStates,
      onSort,
      onFilterChange,
      onMouseDown,
      headerCellStyle,
      headerCellClassName,
    ],
  );

  const headerTrs = useMemo(() => {
    const trs: ThProps<T>[][] = [];
    computeTrs(columns, 0, trs);
    const headerColumns = parseHeaderColumns(columns);
    headerColumns.forEach((column, i) => getCellsProps(column, trs, 0, i));
    return trs;
  }, [columns, computeTrs, parseHeaderColumns, getCellsProps]);

  return (
    <thead>
      {headerTrs.map((cellsProps, i) => {
        const rowClassName =
          typeof headerRowClassName === 'function'
            ? headerRowClassName(i)
            : headerRowClassName || '';

        const styles: React.CSSProperties =
          typeof headerRowStyle === 'function' ? headerRowStyle(i) ?? {} : headerRowStyle || {};

        const rowEvents = typeof onHeaderRowEvents === 'function' ? onHeaderRowEvents(i) ?? {} : {};

        return (
          <tr key={i} className={rowClassName} style={styles} {...rowEvents}>
            {cellsProps.map((cellProps) => {
              return (
                <Th
                  {...cellProps}
                  rowIndex={i}
                  key={cellProps.column._columnKey}
                  onHeaderCellEvents={onHeaderCellEvents}
                  onSelectAll={(selected: boolean, event: any) => {
                    onSelectAll(selected);
                    if (typeof (rowEvents as any)?.onClick === 'function') {
                      (rowEvents as any)?.onClick(event);
                    }
                  }}
                />
              );
            })}
          </tr>
        );
      })}
    </thead>
  );
}
export default Thead;
