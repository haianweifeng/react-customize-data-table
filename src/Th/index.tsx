import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  ColumnsGroupWithType,
  ColumnsWithType,
  FilterStateType,
  ResizeInfoType,
  SorterStateType,
} from '../interface';
import omit from 'omit.js';
import classnames from 'classnames';
import Tooltip from '../Tooltip';
import Checkbox from '../Checkbox';
import { getParent, getPropertyValueSum } from '../utils/util';
import Sorter from '../Sorter';
import Filter from '../Filter';
import { ColumnType, PrivateColumnGroupType, PrivateColumnType } from '../interface1';

export interface ThProps<T> {
  colIndex: number;
  rowIndex: number;
  rowSpan: number;
  bordered: boolean;
  className: string;
  style: React.CSSProperties;
  checked: boolean | 'indeterminate';
  locale: Record<string, string>;
  column: PrivateColumnType<T> | PrivateColumnGroupType<T>;
  // column: (ColumnsWithType<T> | ColumnsGroupWithType<T>) & {
  //   colSpan: number;
  //   ignoreRightBorder: boolean;
  // };
  // scrollLeft: number;
  // offsetRight: number;
  sorterState: SorterStateType<T>[];
  renderSorter: (params: {
    activeAsc: boolean;
    activeDesc: boolean;
    triggerAsc: () => void;
    triggerDesc: () => void;
  }) => React.ReactNode;
  // todo 列的类型
  // onSort?: (col: ColumnsWithType<T> & { colSpan: number }, order: 'asc' | 'desc') => void;
  onSort?: (col: PrivateColumnType<T>, order: 'asc' | 'desc') => void;
  filterState: FilterStateType<T>[];
  // onFilterChange?: (col: ColumnsWithType<T> & { colSpan: number }, filteredValue: string[]) => void;
  onFilterChange?: (col: PrivateColumnType<T>, filteredValue: string[]) => void;
  onSelectAll?: (selected: boolean) => void;
  // onMouseDown?: (resizeInfo: ResizeInfoType, col: ColumnsWithType<T>, colIndex: number) => void;
  onMouseDown?: (resizeInfo: ResizeInfoType, col: PrivateColumnType<T>, colIndex: number) => void;
}

function Th<T>(props: ThProps<T>) {
  const {
    column,
    colIndex,
    rowIndex,
    rowSpan,
    locale,
    checked,
    bordered,
    // scrollLeft,
    // offsetRight,
    style = {},
    className = '',
    sorterState,
    renderSorter,
    filterState,
    onSort,
    onFilterChange,
    onSelectAll,
    onMouseDown,
  } = props;

  const cellRef = useRef<HTMLTableCellElement>(null);

  const columnTitleRef = useRef<HTMLElement>(null);

  const [isOverflow, setIsOverflow] = useState<boolean>(false);

  const showTooltip = typeof column?.ellipsis === 'object' && column.ellipsis?.tooltip;

  useEffect(() => {
    const cellEl = cellRef.current;
    const columnTitleEl = columnTitleRef.current;
    const targetEl = column.sorter || column.filters ? columnTitleEl : cellEl;
    if (targetEl && column.ellipsis) {
      const firstChild =
        column.sorter || column.filters
          ? columnTitleEl?.firstElementChild
          : cellEl?.firstElementChild;
      if (firstChild) {
        const values = getPropertyValueSum(targetEl, [
          'padding-left',
          'padding-right',
          'border-left-width',
          'border-right-width',
        ]);
        const range = document.createRange();
        range.setStart(firstChild, 0);
        range.setEnd(firstChild, firstChild.childNodes.length);

        const { width: targetWidth } = targetEl.getBoundingClientRect();
        const { width: rangeWidth } = range.getBoundingClientRect();
        const realWidth = targetWidth - values;
        setIsOverflow(rangeWidth > realWidth);
      }
    }
  }, [column]);

  const handleChange = (selected: boolean) => {
    onSelectAll && onSelectAll(selected);
  };

  const renderTooltip = (content: React.ReactNode) => {
    if (typeof column.ellipsis === 'object') {
      const ellipsis = column.ellipsis;
      const triggerEl = <span className="cell-tooltip-content">{content}</span>;
      if (ellipsis.renderTooltip) {
        return ellipsis.renderTooltip(triggerEl, content);
      }
      return (
        <Tooltip tip={content} theme={ellipsis?.tooltipTheme}>
          {triggerEl}
        </Tooltip>
      );
    }
  };

  const renderSelection = () => {
    return (
      <th key={`${rowIndex}_${colIndex}`} rowSpan={rowSpan} className={className} style={style}>
        {column.title ||
          (column.type === 'radio' ? null : <Checkbox checked={checked} onChange={handleChange} />)}
      </th>
    );
  };

  const renderExpand = () => {
    return (
      <th key={`${rowIndex}_${colIndex}`} rowSpan={rowSpan} className={className} style={style}>
        {column.title || null}
      </th>
    );
  };

  // todo dataIndex?
  const renderSorterContent = useCallback(
    (col: PrivateColumnType<T>) => {
      const item = sorterState.find((s) => s.dataIndex === col.dataIndex);

      return (
        <Sorter
          activeAsc={item?.order === 'asc'}
          activeDesc={item?.order === 'desc'}
          renderSorter={renderSorter}
          onChange={(order) => {
            onSort && onSort(col, order);
          }}
        />
      );
    },
    [sorterState, renderSorter, onSort],
  );

  // todo  dataIndex
  const renderFilterContent = useCallback(
    (col: PrivateColumnType<T>) => {
      const curr = filterState.find((f) => f.dataIndex === col.dataIndex);
      return (
        <Filter
          locale={locale}
          filters={col.filters!}
          filterIcon={col.filterIcon}
          filterMultiple={col.filterMultiple !== false}
          filteredValue={curr?.filteredValue || []}
          filterSearch={col?.filterSearch}
          onReset={() => {
            onFilterChange && onFilterChange(col, []);
          }}
          onChange={(checkedValue: string[]) => {
            onFilterChange && onFilterChange(col, checkedValue);
          }}
        />
      );
    },
    [onFilterChange, filterState],
  );

  // const handleMouseDown = (
  //   event: any,
  //   col: PrivateColumnType<T>,
  //   colIndex: number,
  // ) => {
  //   const { target } = event;
  //   const resizingTh = getParent(target, 'th');
  //   if (resizingTh) {
  //     const resizingRect = resizingTh.getBoundingClientRect();
  //     const resizeInfo: ResizeInfoType = {
  //       startPosX: event.clientX,
  //       resizingRect,
  //     };
  //     delete col['colSpan'];
  //     delete col.ignoreRightBorder;
  //     onMouseDown && onMouseDown(resizeInfo, col, colIndex);
  //   }
  // };

  const handleMouseDown = (event: any) => {
    const { target } = event;
    const resizingTh = getParent(target, 'th');
    if (resizingTh) {
      const resizingRect = resizingTh.getBoundingClientRect();
      const resizeInfo: ResizeInfoType = {
        startPosX: event.clientX,
        resizingRect,
      };
      onMouseDown &&
        onMouseDown(
          resizeInfo,
          omit(column, ['ignoreRightBorder', 'lastLeftFixed', 'fistRightFixed']),
          colIndex,
        );
    }
  };

  // todo 多级表头也需要配置排序 过滤
  const renderContent = () => {
    switch (column.type) {
      case 'checkbox':
      case 'radio':
        return renderSelection();
      case 'expand':
        return renderExpand();
      default: {
        if ('children' in column && column?.children.length) {
          return (
            <th
              key={`${rowIndex}_${colIndex}`}
              colSpan={column.colSpan}
              className={className}
              style={style}
              ref={cellRef}
            >
              {showTooltip && isOverflow ? (
                renderTooltip(column.title)
              ) : !!column.ellipsis ? (
                <span className="cell-tooltip-content">{column.title}</span>
              ) : (
                column.title
              )}
            </th>
          );
        } else {
          return (
            <th
              rowSpan={rowSpan}
              colSpan={column.colSpan}
              key={`${rowIndex}_${colIndex}`}
              className={className}
              style={style}
              ref={cellRef}
            >
              <div className="cell-header">
                <span
                  ref={columnTitleRef}
                  className={classnames({
                    'column-title': true,
                    'column-title-ellipsis': !!column.ellipsis,
                  })}
                >
                  {showTooltip && isOverflow ? (
                    renderTooltip(column.title)
                  ) : !!column.ellipsis ? (
                    <span className="cell-tooltip-content">{column.title}</span>
                  ) : (
                    column.title
                  )}
                </span>
                {column.sorter || column.filters ? (
                  <div className="sorter-filter">
                    {column.sorter ? renderSorterContent(column) : null}
                    {column.filters ? renderFilterContent(column) : null}
                  </div>
                ) : null}
              </div>
              {rowIndex === 0 &&
              bordered &&
              !('children' in column) &&
              !column.ignoreRightBorder &&
              column?.resizable ? (
                <div
                  className="cell-header-resizable"
                  onMouseDown={handleMouseDown}
                  // onMouseDown={(event) => {
                  //   handleMouseDown(event, column, colIndex);
                  // }}
                />
              ) : null}
            </th>
          );
        }
      }
    }
  };

  return renderContent();
}

export default Th;
