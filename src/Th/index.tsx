import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  ColumnsGroupWithType,
  ColumnsWithType,
  FilterStateType,
  ResizeInfoType,
  SorterStateType,
} from '../interface';
import classnames from 'classnames';
import Tooltip from '../Tooltip';
import Checkbox from '../Checkbox';
import { getParent, getPropertyValueSum } from '../utils/util';
import Sorter from '../Sorter';
import Filter from '../Filter';

export interface ThProps<T> {
  index: string;
  checked: boolean | 'indeterminate';
  rowSpan: number;
  selectionTitle?: React.ReactNode;
  expandableTitle?: React.ReactNode;
  col: (ColumnsWithType<T> | ColumnsGroupWithType<T>) & {
    colSpan: number;
    ignoreRightBorder: boolean;
  };
  // scrollLeft: number;
  // offsetRight: number;
  className: string;
  style: React.CSSProperties;
  level: number;
  bordered: boolean;
  sorterState: SorterStateType<T>[];
  renderSorter: (params: {
    activeAsc: boolean;
    activeDesc: boolean;
    triggerAsc: () => void;
    triggerDesc: () => void;
  }) => React.ReactNode;
  onSort?: (col: ColumnsWithType<T> & { colSpan: number }, order: 'asc' | 'desc') => void;
  filterState: FilterStateType<T>[];
  onFilterChange?: (col: ColumnsWithType<T> & { colSpan: number }, filteredValue: string[]) => void;
  onSelectAll?: (selected: boolean) => void;
  onMouseDown?: (resizeInfo: ResizeInfoType, col: ColumnsWithType<T>, colIndex: number) => void;
}

function Th<T>(props: ThProps<T>) {
  const {
    col,
    index,
    checked,
    rowSpan,
    level,
    bordered,
    selectionTitle,
    expandableTitle,
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

  const showTooltip = typeof col?.ellipsis === 'object' && col.ellipsis?.tooltip;

  useEffect(() => {
    const cellEl = cellRef.current;
    const columnTitleEl = columnTitleRef.current;
    const targetEl = col.sorter || col.filters ? columnTitleEl : cellEl;
    if (targetEl && col.ellipsis) {
      const firstChild =
        col.sorter || col.filters ? columnTitleEl?.firstElementChild : cellEl?.firstElementChild;
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
  }, [col]);

  const handleChange = (selected: boolean) => {
    onSelectAll && onSelectAll(selected);
  };

  const renderTooltip = (content: React.ReactNode) => {
    if (typeof col.ellipsis === 'object') {
      const ellipsis = col.ellipsis;
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
      <th key={index} rowSpan={rowSpan} className={className} style={style} ref={cellRef}>
        {selectionTitle ? (
          showTooltip && isOverflow ? (
            renderTooltip(selectionTitle)
          ) : !!col.ellipsis ? (
            <span className="cell-tooltip-content">{selectionTitle}</span>
          ) : (
            selectionTitle
          )
        ) : col.type === 'radio' ? null : (
          <Checkbox checked={checked} onChange={handleChange} />
        )}
      </th>
    );
  };

  const renderExpand = () => {
    return (
      <th key={index} rowSpan={rowSpan} className={className} style={style} ref={cellRef}>
        {expandableTitle ? (
          showTooltip && isOverflow ? (
            renderTooltip(expandableTitle)
          ) : !!col.ellipsis ? (
            <span className="cell-tooltip-content">{expandableTitle}</span>
          ) : (
            expandableTitle
          )
        ) : null}
      </th>
    );
  };

  const renderSorterContent = useCallback(
    (col: ColumnsWithType<T> & { colSpan: number; ignoreRightBorder: boolean }) => {
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

  const renderContent = () => {
    switch (col.type) {
      case 'checkbox':
      case 'radio':
        return renderSelection();
      case 'expanded':
        return renderExpand();
      default: {
        if ('children' in col && col.children.length) {
          return (
            <th key={index} colSpan={col.colSpan} className={className} style={style} ref={cellRef}>
              {showTooltip && isOverflow ? (
                renderTooltip(col.title)
              ) : !!col.ellipsis ? (
                <span className="cell-tooltip-content">{col.title}</span>
              ) : (
                col.title
              )}
            </th>
          );
        } else {
          return (
            <th
              colSpan={col.colSpan}
              rowSpan={rowSpan}
              key={index}
              className={className}
              style={style}
              ref={cellRef}
            >
              <div className="cell-header">
                <span
                  ref={columnTitleRef}
                  className={classnames({
                    'column-title': true,
                    'column-title-ellipsis': !!col.ellipsis,
                  })}
                >
                  {showTooltip && isOverflow ? (
                    renderTooltip(col.title)
                  ) : !!col.ellipsis ? (
                    <span className="cell-tooltip-content">{col.title}</span>
                  ) : (
                    col.title
                  )}
                </span>
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
            </th>
          );
        }
      }
    }
  };

  return renderContent();
}

export default Th;
