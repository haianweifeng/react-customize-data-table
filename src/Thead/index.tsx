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
} from '../interface';
import Checkbox from '../Checkbox';
import Sorter from '../Sorter';
import Filter from '../Filter';
import { getParent } from '../utils/util';

interface TheadProps<T> {
  bordered: boolean;
  scrollLeft: number;
  offsetRight: number;
  sorterState: SorterStateType<T>[];
  filterState: FilterStateType<T>[];
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

  const isColumnGroup = useCallback((col: ColumnsWithType<T> | ColumnsGroupWithType<T>) => {
    if (typeof (col as ColumnsGroupWithType<T>).children !== 'undefined') {
      return true;
    }
    return false;
  }, []);

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
        if (isColumnGroup(col)) {
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
    [isColumnGroup],
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

  const handleMouseDown = (
    event: any,
    col: ColumnsWithType<T> & {
      colSpan?: number;
      ignoreRightBorder?: boolean;
    },
    colIndex: number,
  ) => {
    const { target } = event;
    const resizingTh = getParent(target, 'th');
    if (resizingTh) {
      const resizingRect = resizingTh.getBoundingClientRect();
      const resizeInfo: ResizeInfoType = {
        startPosX: event.clientX,
        resizingRect,
      };
      delete col['colSpan'];
      delete col.ignoreRightBorder;
      onMouseDown && onMouseDown(resizeInfo, col, colIndex);
    }
  };

  const handleChange = useCallback(
    (selected: boolean) => {
      onSelectAll(selected);
    },
    [onSelectAll],
  );

  const handleSortChange = useCallback(
    (col: ColumnsWithType<T> & { colSpan: number }, order: 'asc' | 'desc') => {
      onSort(col, order);
    },
    [onSort],
  );

  const renderSelection = useCallback(
    (key: string, rowSpan: number, cls: string, styles: React.CSSProperties) => {
      return (
        <th key={key} rowSpan={rowSpan} className={cls} style={styles}>
          {rowSelection?.columnTitle ||
            (rowSelection?.type === 'radio' ? null : (
              <Checkbox checked={checked} onChange={handleChange} />
            ))}
        </th>
      );
    },
    [checked, rowSelection, handleChange],
  );

  const renderExpand = useCallback(
    (key: string, rowSpan: number, cls: string, styles: React.CSSProperties) => {
      return (
        <th key={key} rowSpan={rowSpan} className={cls} style={styles}>
          {expandable?.columnTitle || null}
        </th>
      );
    },
    [expandable],
  );

  const renderSorterContent = useCallback(
    (col: ColumnsWithType<T> & { colSpan: number; ignoreRightBorder: boolean }) => {
      const item = sorterState.find((s) => s.dataIndex === col.dataIndex);
      return (
        <Sorter
          activeAsc={item?.order === 'asc'}
          activeDesc={item?.order === 'desc'}
          renderSorter={renderSorter}
          onChange={(order) => {
            handleSortChange(col, order);
          }}
        />
      );
    },
    [sorterState, renderSorter, handleSortChange],
  );

  const renderFilterContent = useCallback(
    (col: ColumnsWithType<T> & { colSpan: number; ignoreRightBorder: boolean }) => {
      const curr = filterState.find((f) => f.dataIndex === col.dataIndex);
      return (
        <Filter
          filters={col.filters!}
          filterIcon={col.filterIcon}
          filterMultiple={col.filterMultiple !== false}
          filteredValue={curr?.filteredValue || []}
          filterSearch={col?.filterSearch}
          onReset={() => {
            onFilterChange(col, []);
          }}
          onChange={(checkedValue: string[]) => {
            onFilterChange(col, checkedValue);
          }}
        />
      );
    },
    [onFilterChange, filterState],
  );

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

      switch (col.type) {
        case 'checkbox':
        case 'radio':
          return trs[level].push(renderSelection(index, totalLevel, cls, styles));
        case 'expanded':
          return trs[level].push(renderExpand(index, totalLevel, cls, styles));
        default: {
          if (isColumnGroup(col)) {
            trs[level].push(
              <th
                key={index}
                colSpan={col.colSpan}
                className={classnames({
                  'cell-align-center': true,
                  ...classes,
                })}
                style={styles}
              >
                {col.title}
              </th>,
            );
            (col as any).children.forEach((c: any, i: number) => {
              renderTh(c, trs, level + 1, `${index}_${i}`);
            });
          } else {
            trs[level].push(
              <th
                colSpan={col.colSpan}
                rowSpan={totalLevel - level}
                key={index}
                className={cls}
                style={styles}
              >
                <div className="cell-header">
                  <span className="column-title">{col.title}</span>
                  {col.sorter || col.filters ? (
                    <div className="sorter-filter">
                      {col.sorter
                        ? renderSorterContent(
                            col as ColumnsWithType<T> & {
                              colSpan: number;
                              ignoreRightBorder: boolean;
                            },
                          )
                        : null}
                      {col.filters
                        ? renderFilterContent(
                            col as ColumnsWithType<T> & {
                              colSpan: number;
                              ignoreRightBorder: boolean;
                            },
                          )
                        : null}
                    </div>
                  ) : null}
                </div>
                {level === 0 &&
                bordered &&
                !('children' in col) &&
                !col.ignoreRightBorder &&
                col?.resizable ? (
                  <div
                    className="cell-header-resizable"
                    onMouseDown={(event) => {
                      handleMouseDown(event, col, Number(index));
                    }}
                  />
                ) : null}
              </th>,
            );
          }
        }
      }
    },
    [renderSelection, renderExpand, renderSorterContent, renderFilterContent, isColumnGroup],
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
