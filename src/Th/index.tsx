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
import { getColumnKey, getParent, getPropertyValueSum } from '../utils/util';
import Sorter from '../Sorter';
import Filter from '../Filter';
import {
  ColumnType,
  FilterState,
  PrivateColumnGroupType,
  PrivateColumnType,
  SortState,
} from '../interface1';

export interface ThProps<T> {
  defaultColumnKey: React.Key;
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
  sorterStates: SortState<T>[];
  renderSorter: (params: {
    activeAsc: boolean;
    activeDesc: boolean;
    triggerAsc: () => void;
    triggerDesc: () => void;
  }) => React.ReactNode;
  // todo 列的类型
  // onSort?: (col: ColumnsWithType<T> & { colSpan: number }, order: 'asc' | 'desc') => void;
  onSort?: (col: ColumnType<T>, order: 'asc' | 'desc', columnKey: React.Key) => void;
  filterStates: FilterState<T>[];
  // onFilterChange?: (col: ColumnsWithType<T> & { colSpan: number }, filteredValue: string[]) => void;
  onFilterChange?: (
    col: PrivateColumnType<T>,
    filteredValue: React.Key[],
    columnKey: React.Key,
  ) => void;
  onSelectAll?: (selected: boolean) => void;
  // onMouseDown?: (resizeInfo: ResizeInfoType, col: ColumnsWithType<T>, colIndex: number) => void;
  onMouseDown?: (resizeInfo: ResizeInfoType, col: PrivateColumnType<T>, colIndex: number) => void;
}

function Th<T>(props: ThProps<T>) {
  const {
    defaultColumnKey,
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
    sorterStates,
    renderSorter,
    filterStates,
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
      const columnKey = getColumnKey(col, defaultColumnKey);
      const item = sorterStates.find((s) => s.key === columnKey);

      return (
        <Sorter
          activeAsc={item?.order === 'asc'}
          activeDesc={item?.order === 'desc'}
          renderSorter={col.renderSorter}
          onChange={(order) => {
            onSort &&
              onSort(
                omit(col, ['_ignoreRightBorder', '_lastLeftFixed', '_firstRightFixed', '_width']),
                order,
                columnKey,
              );
          }}
        />
      );
    },
    [sorterStates, renderSorter, onSort],
  );

  // todo  colIndex 有可能是children curr 是否存在
  const renderFilterContent = useCallback(
    (col: PrivateColumnType<T>) => {
      const columnKey = getColumnKey(col, defaultColumnKey);
      const curr = filterStates.find((f) => f.key === columnKey);
      return (
        <Filter
          locale={locale}
          filters={col.filters!}
          filterIcon={col.filterIcon}
          filterMultiple={col.filterMultiple !== false}
          filteredValue={curr?.filteredValue || []}
          filterSearch={col?.filterSearch}
          onReset={() => {
            onFilterChange && onFilterChange(col, [], columnKey);
          }}
          onChange={(checkedValue: React.Key[]) => {
            onFilterChange && onFilterChange(col, checkedValue, columnKey);
          }}
        />
      );
    },
    [onFilterChange, filterStates],
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
          omit(column, ['_ignoreRightBorder', '_lastLeftFixed', '_firstRightFixed']),
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
        return (
          <th
            rowSpan={'children' in column && column?.children.length ? 1 : rowSpan}
            key={`${rowIndex}_${colIndex}`}
            colSpan={column.colSpan}
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
            !column._ignoreRightBorder &&
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
        // if ('children' in column && column?.children.length) {
        //   return (
        //     <th
        //       key={`${rowIndex}_${colIndex}`}
        //       colSpan={column.colSpan}
        //       className={className}
        //       style={style}
        //       ref={cellRef}
        //     >
        //       {showTooltip && isOverflow ? (
        //         renderTooltip(column.title)
        //       ) : !!column.ellipsis ? (
        //         <span className="cell-tooltip-content">{column.title}</span>
        //       ) : (
        //         column.title
        //       )}
        //     </th>
        //   );
        // } else {
        //   return (
        //     <th
        //       rowSpan={rowSpan}
        //       key={`${rowIndex}_${colIndex}`}
        //       colSpan={column.colSpan}
        //       className={className}
        //       style={style}
        //       ref={cellRef}
        //     >
        //       <div className="cell-header">
        //         <span
        //           ref={columnTitleRef}
        //           className={classnames({
        //             'column-title': true,
        //             'column-title-ellipsis': !!column.ellipsis,
        //           })}
        //         >
        //           {showTooltip && isOverflow ? (
        //             renderTooltip(column.title)
        //           ) : !!column.ellipsis ? (
        //             <span className="cell-tooltip-content">{column.title}</span>
        //           ) : (
        //             column.title
        //           )}
        //         </span>
        //         {column.sorter || column.filters ? (
        //           <div className="sorter-filter">
        //             {column.sorter ? renderSorterContent(column) : null}
        //             {column.filters ? renderFilterContent(column) : null}
        //           </div>
        //         ) : null}
        //       </div>
        //       {rowIndex === 0 &&
        //       bordered &&
        //       !('children' in column) &&
        //       !column.ignoreRightBorder &&
        //       column?.resizable ? (
        //         <div
        //           className="cell-header-resizable"
        //           onMouseDown={handleMouseDown}
        //           // onMouseDown={(event) => {
        //           //   handleMouseDown(event, column, colIndex);
        //           // }}
        //         />
        //       ) : null}
        //     </th>
        //   );
        // }
      }
    }
  };

  return renderContent();
}

export default Th;
