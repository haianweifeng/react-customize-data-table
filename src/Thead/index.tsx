import React, { useMemo, useCallback } from 'react';
import omit from 'omit.js';
import classnames from 'classnames';
import type {
  ColumnsWithType,
  ColumnsGroupWithType,
  // ExpandableType,
  // RowSelectionType,
  SorterStateType,
  FilterStateType,
  ResizeInfoType,
  // ColumnsType,
} from '../interface';
import type {
  ColumnsType,
  RowSelectionType,
  ExpandableType,
  ColumnType,
  ColumnGroupType,
  PrivateColumnType,
  PrivateColumnGroupType,
  PrivateColumnsType,
} from '../interface1';
import Th from '../Th';
import type { ThProps } from '../Th';

interface TheadProps<T> {
  bordered: boolean;
  // scrollLeft: number;
  // offsetRight: number;
  sorterState: SorterStateType<T>[];
  filterState: FilterStateType<T>[];
  locale: Record<string, string>;
  checked: boolean | 'indeterminate';
  expandable?: ExpandableType<T>;
  rowSelection?: RowSelectionType<T>;
  columns: PrivateColumnsType<T>;
  // columns: ColumnsType<T>;
  // columns: (ColumnsWithType<T> | ColumnsGroupWithType<T>)[];
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
  // todo
  onSort: (col: ColumnsWithType<T> & { colSpan: number }, order: 'asc' | 'desc') => void;
  renderSorter: (params: {
    activeAsc: boolean;
    activeDesc: boolean;
    triggerAsc: () => void;
    triggerDesc: () => void;
  }) => React.ReactNode;
  onFilterChange: (col: ColumnsWithType<T> & { colSpan: number }, filteredValue: string[]) => void;
  // onMouseDown: (resizeInfo: ResizeInfoType, col: ColumnsWithType<T>, colIndex: number) => void;
  onMouseDown: (resizeInfo: ResizeInfoType, col: PrivateColumnType<T>, colIndex: number) => void;
}

function Thead<T>(props: TheadProps<T>) {
  const {
    locale,
    bordered,
    checked,
    columns,
    sorterState,
    filterState,
    expandable,
    // scrollLeft,
    // offsetRight,
    rowSelection,
    renderSorter,
    onSelectAll,
    onSort,
    onFilterChange,
    onMouseDown,
    headerCellClassName,
    headerCellStyle,
  } = props;

  // todo 考虑是否需要把ignoreRightBorder 改成表格边框缺少右边框
  const parseHeaderColumns = useCallback(
    (cols: PrivateColumnsType<T>, parentCol?: PrivateColumnGroupType<T>, lastColumn?: boolean) => {
      const headerColumns: PrivateColumnsType<T> = [];

      cols.map((col, index: number) => {
        const isLastColumn = index === cols.length - 1;
        const ignoreRightBorder = !!(
          bordered &&
          isLastColumn &&
          (!parentCol || (parentCol && lastColumn))
        );
        if ('children' in col && col?.children.length) {
          const column: PrivateColumnGroupType<T> = {
            ...col,
            colSpan: 0,
            ignoreRightBorder,
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
          headerColumns.push({ ...col, colSpan: col?.colSpan || 1, ignoreRightBorder });
        }
      });

      return headerColumns;
    },
    [],
  );

  const computeTrs = useCallback(
    (cols: PrivateColumnsType<T>, level = 0, trs: React.ReactNode[][]) => {
      for (let i = 0; i < cols.length; i++) {
        const col = cols[i];
        if (!Array.isArray(trs[level])) {
          trs[level] = [];
        }
        if ('children' in col && col?.children.length) {
          computeTrs(col.children, level + 1, trs);
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

  const createTh = useCallback((thProps: ThProps<T>) => {
    return <Th {...thProps} key={`${thProps.rowIndex}_${thProps.colIndex}`} />;
  }, []);

  const renderTh = useCallback(
    (
      col: PrivateColumnType<T> | PrivateColumnGroupType<T>,
      trs: React.ReactNode[][],
      rowIndex: number,
      colIndex: number,
    ) => {
      const totalRows = trs.length;
      const colClassName = col.className || '';
      const cellClassName =
        typeof headerCellClassName === 'function'
          ? headerCellClassName(
              omit(col, ['ignoreRightBorder', 'lastLeftFixed', 'fistRightFixed']),
              rowIndex,
              colIndex,
            )
          : headerCellClassName || '';

      const classes = {
        'cell-fixed-left': col.fixed === 'left',
        'cell-fixed-right': col.fixed === 'right',
        'cell-is-last-fixedLeft': !!col.lastLeftFixed,
        'cell-is-first-fixedRight': !!col.fistRightFixed,
        'cell-ignore-right-border': col.ignoreRightBorder,
        [colClassName]: !!col.className,
        [cellClassName]: !!cellClassName,
      };

      const cls = classnames({
        'cell-align-center': col.align === 'center',
        'cell-align-right': col.align === 'right',
        'selection-expand-column': col?.type && col.type !== 'default',
        ...classes,
      });

      let styles: React.CSSProperties = {};
      if (typeof headerCellStyle === 'function') {
        styles = headerCellStyle(
          omit(col, ['ignoreRightBorder', 'lastLeftFixed', 'fistRightFixed']),
          rowIndex,
          colIndex,
        );
      }

      let baseProps: ThProps<T> = {
        column: col,
        colIndex,
        rowIndex,
        locale,
        checked,
        bordered,
        style: styles,
        sorterState,
        renderSorter,
        filterState,
      } as ThProps<T>;

      switch (col.type) {
        case 'checkbox':
        case 'radio':
        case 'expand':
          baseProps = Object.assign({}, baseProps, {
            rowSpan: totalRows,
            className: cls,
            onSelectAll: handleChange,
          });
          return trs[rowIndex].push(createTh(baseProps));
        default: {
          if ('children' in col && col?.children.length) {
            baseProps = Object.assign({}, baseProps, {
              rowSpan: 1,
              className: classnames({
                'cell-align-center': true,
                'cell-ellipsis': !!col.ellipsis,
                ...classes,
              }),
            });
            trs[rowIndex].push(createTh(baseProps));
            col.children.forEach((c, i) => {
              renderTh(c, trs, rowIndex + 1, i);
            });
          } else {
            baseProps = Object.assign({}, baseProps, {
              rowSpan: totalRows - rowIndex,
              className: cls,
              onSort,
              onFilterChange,
              onMouseDown,
            });
            trs[rowIndex].push(createTh(baseProps));
          }
        }
      }
    },
    [
      checked,
      bordered,
      sorterState,
      renderSorter,
      filterState,
      rowSelection,
      expandable,
      handleChange,
      createTh,
      onSort,
      onFilterChange,
      onMouseDown,
      headerCellClassName,
      headerCellStyle,
    ],
  );

  const headerTrs = useMemo(() => {
    const trs: React.ReactNode[][] = [];
    computeTrs(columns, 0, trs);
    const headerColumns = parseHeaderColumns(columns);
    headerColumns.forEach((col, i) => renderTh(col, trs, 0, i));
    return trs;
  }, [columns, computeTrs, parseHeaderColumns, renderTh]);

  return (
    <thead>
      {headerTrs.map((tr, i) => {
        return <tr key={i}>{tr}</tr>;
      })}
    </thead>
  );
}
export default Thead;
