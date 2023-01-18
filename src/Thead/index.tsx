import React, { useMemo, useCallback } from 'react';
import classnames from 'classnames';
import type {
  ColumnsWithType,
  ColumnsGroupWithType,
  ExpandableType,
  RowSelectionType,
  SorterStateType,
  FilterStateType,
  ResizeInfoType,
  LocalType,
} from '../interface';
import Th from '../Th';
import type { ThProps } from '../Th';

interface TheadProps<T> {
  bordered: boolean;
  scrollLeft: number;
  offsetRight: number;
  sorterState: SorterStateType<T>[];
  filterState: FilterStateType<T>[];
  locale: LocalType;
  checked: boolean | 'indeterminate';
  expandable?: ExpandableType<T>;
  rowSelection?: RowSelectionType<T>;
  columns: (ColumnsWithType<T> | ColumnsGroupWithType<T>)[];
  onSelectAll: (selected: boolean) => void;
  onSort: (col: ColumnsWithType<T> & { colSpan: number }, order: 'asc' | 'desc') => void;
  renderSorter: (params: {
    activeAsc: boolean;
    activeDesc: boolean;
    triggerAsc: () => void;
    triggerDesc: () => void;
  }) => React.ReactNode;
  onFilterChange: (col: ColumnsWithType<T> & { colSpan: number }, filteredValue: string[]) => void;
  onMouseDown: (resizeInfo: ResizeInfoType, col: ColumnsWithType<T>, colIndex: number) => void;
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
    scrollLeft,
    offsetRight,
    rowSelection,
    renderSorter,
    onSelectAll,
    onSort,
    onFilterChange,
    onMouseDown,
  } = props;

  const getFormatColumns = useCallback(
    (
      cols: (ColumnsWithType<T> | ColumnsGroupWithType<T>)[],
      target?: (ColumnsWithType<T> | ColumnsGroupWithType<T>) & { colSpan: number },
      lastColumn?: boolean,
    ) => {
      const formatColumns: ((ColumnsWithType<T> | ColumnsGroupWithType<T>) & {
        colSpan: number;
        ignoreRightBorder: boolean;
      })[] = [];

      cols.map((col, index: number) => {
        const isLastColumn = index === cols.length - 1;
        if ('children' in col && col?.children.length) {
          const obj = {
            ...col,
            colSpan: 0,
            ignoreRightBorder: !!(bordered && isLastColumn && (!target || (target && lastColumn))),
          };
          (obj as any).children = getFormatColumns(
            (col as any).children,
            obj,
            !target && isLastColumn,
          );
          if (target) {
            target.colSpan += obj.colSpan;
          }
          formatColumns.push(obj);
        } else {
          if (target) {
            target.colSpan += 1;
          }
          if (col?.headerColSpan === 0) return;
          formatColumns.push({
            colSpan: col?.headerColSpan || 1,
            ...col,
            ignoreRightBorder: !!(bordered && isLastColumn && (!target || (target && lastColumn))),
          });
        }
      });

      return formatColumns;
    },
    [],
  );

  const computeTrs = useCallback((cols: any, level = 0, trs: React.ReactNode[][]) => {
    for (let i = 0; i < cols.length; i++) {
      const col = cols[i];
      if (!Array.isArray(trs[level])) {
        trs[level] = [];
      }
      if (col?.children && col.children.length) {
        computeTrs(col.children, level + 1, trs);
      }
    }
  }, []);

  const handleChange = useCallback(
    (selected: boolean) => {
      onSelectAll(selected);
    },
    [onSelectAll],
  );

  const createTh = useCallback((thProps: ThProps<T>) => {
    return <Th {...thProps} key={thProps.index} />;
  }, []);

  const renderTh = useCallback(
    (
      col: (ColumnsWithType<T> | ColumnsGroupWithType<T>) & {
        colSpan: number;
        ignoreRightBorder: boolean;
      },
      trs: React.ReactNode[][],
      level: number,
      index: string,
    ) => {
      const totalLevel = trs.length;
      const colClassName = col.className || '';

      const classes = {
        'cell-fixed-left': col.fixed === 'left',
        'cell-fixed-right': col.fixed === 'right',
        'cell-fixed-last-left': !!col.lastLeftFixed && !!scrollLeft,
        'cell-fixed-first-right': !!col.fistRightFixed && !!offsetRight,
        'cell-ignore-right-border': col.ignoreRightBorder,
        [colClassName]: !!col.className,
      };

      const cls = classnames({
        'cell-align-center': col.align === 'center',
        'cell-align-right': col.align === 'right',
        'selection-expand-column':
          col.type === 'checkbox' || col.type === 'radio' || col.type === 'expanded',
        ...classes,
      });

      const styles: React.CSSProperties = {};
      if (col.fixed === 'left') styles.transform = `translate(${scrollLeft}px, 0px)`;
      if (col.fixed === 'right') styles.transform = `translate(-${offsetRight}px, 0px)`;

      let baseProps: ThProps<T> = {
        col,
        index,
        level,
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
        case 'expanded':
          baseProps = Object.assign({}, baseProps, {
            rowSpan: totalLevel,
            selectionTitle: rowSelection?.columnTitle,
            expandableTitle: expandable?.columnTitle,
            className: cls,
            onSelectAll: handleChange,
          });
          return trs[level].push(createTh(baseProps));
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
            trs[level].push(createTh(baseProps));
            (col as any).children.forEach((c: any, i: number) => {
              renderTh(c, trs, level + 1, `${index}_${i}`);
            });
          } else {
            baseProps = Object.assign({}, baseProps, {
              rowSpan: totalLevel - level,
              className: cls,
              onSort,
              onFilterChange,
              onMouseDown,
            });
            trs[level].push(createTh(baseProps));
          }
        }
      }
    },
    [
      scrollLeft,
      offsetRight,
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
    ],
  );

  const headerTrs = useMemo(() => {
    const trs: React.ReactNode[][] = [];
    computeTrs(columns, 0, trs);
    const formatColumns = getFormatColumns(columns);
    formatColumns.forEach((col, i: number) => renderTh(col, trs, 0, `${i}`));
    return trs;
  }, [columns, computeTrs, getFormatColumns, renderTh]);

  return (
    <thead>
      {headerTrs.map((tr, i) => {
        return <tr key={i}>{tr}</tr>;
      })}
    </thead>
  );
}
export default Thead;
