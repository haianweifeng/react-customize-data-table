import React, { useRef, useState, useEffect, useCallback } from 'react';
import classnames from 'classnames';
import Tooltip from '../Tooltip';
import Checkbox from '../Checkbox';
import Sorter from '../Sorter';
import Filter from '../Filter';
import { getParent, getPropertyValueSum } from '../utils/util';
import {
  ResizeInfo,
  SortState,
  FilterState,
  PrivateColumnType,
  PrivateColumnGroupType,
} from '../interface1';

export interface ThProps<T> {
  rowSpan: number;
  bordered: boolean;
  className: string;
  style: React.CSSProperties;
  locale: Record<string, string>;
  checked: boolean | 'indeterminate';
  column: PrivateColumnType<T> | PrivateColumnGroupType<T>;
  sorterStates: SortState<T>[];
  filterStates: FilterState<T>[];
  onSort?: (col: PrivateColumnType<T> | PrivateColumnGroupType<T>, order: 'asc' | 'desc') => void;
  onFilterChange?: (
    col: PrivateColumnType<T> | PrivateColumnGroupType<T>,
    filteredValue: React.Key[],
  ) => void;
  onSelectAll?: (selected: boolean) => void;
  onMouseDown?: (resizeInfo: ResizeInfo, col: PrivateColumnType<T>) => void;
}

function Th<T>(props: ThProps<T>) {
  const {
    column,
    rowSpan,
    locale,
    checked,
    bordered,
    style = {},
    className = '',
    sorterStates,
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
    if (targetEl && column.ellipsis && column.title) {
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

  const handleMouseDown = (event: any) => {
    const { target } = event;
    const resizingTh = getParent(target, 'th');
    if (resizingTh) {
      const resizingRect = resizingTh.getBoundingClientRect();
      const resizeInfo: ResizeInfo = {
        startPosX: event.clientX,
        resizingRect,
      };
      onMouseDown && onMouseDown(resizeInfo, column);
    }
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

  const renderResizeContent = () => {
    return bordered &&
      !('children' in column) &&
      !column._ignoreRightBorder &&
      column?.resizable ? (
      <div className="cell-header-resizable" onMouseDown={handleMouseDown} />
    ) : null;
  };

  const renderTitle = () => {
    return showTooltip && isOverflow ? (
      renderTooltip(column.title)
    ) : !!column.ellipsis ? (
      <span className="cell-tooltip-content">{column.title}</span>
    ) : (
      column.title
    );
  };

  const renderSelection = (columnType: 'checkbox' | 'radio') => {
    return (
      <th
        ref={cellRef}
        key={column._columnKey}
        rowSpan={rowSpan}
        className={className}
        style={style}
      >
        {column.title ? (
          renderTitle()
        ) : columnType === 'radio' ? null : (
          <Checkbox checked={checked} onChange={handleChange} />
        )}
        {renderResizeContent()}
      </th>
    );
  };

  const renderExpand = () => {
    return (
      <th
        ref={cellRef}
        key={column._columnKey}
        rowSpan={rowSpan}
        className={className}
        style={style}
      >
        {column.title ? renderTitle() : null}
        {renderResizeContent()}
      </th>
    );
  };

  const renderSorterContent = useCallback(() => {
    const item = sorterStates.find((s) => s.key === column._columnKey);

    return (
      <Sorter
        activeAsc={item?.order === 'asc'}
        activeDesc={item?.order === 'desc'}
        renderSorter={column.renderSorter}
        onChange={(order) => {
          onSort && onSort(column, order);
        }}
      />
    );
  }, [sorterStates, onSort, column]);

  const renderFilterContent = useCallback(() => {
    const curr = filterStates.find((f) => f.key === column._columnKey);
    return (
      <Filter
        locale={locale}
        filters={column.filters!}
        filterIcon={column.filterIcon}
        filterMultiple={column.filterMultiple !== false}
        filterSearch={column?.filterSearch}
        filteredValue={curr?.filteredValue || []}
        onReset={() => {
          onFilterChange && onFilterChange(column, []);
        }}
        onChange={(checkedValue: React.Key[]) => {
          onFilterChange && onFilterChange(column, checkedValue);
        }}
      />
    );
  }, [column, locale, onFilterChange, filterStates]);

  const renderContent = () => {
    if ('type' in column && column.type && ['expand', 'checkbox', 'radio'].includes(column.type)) {
      switch (column.type) {
        case 'checkbox':
        case 'radio':
          return renderSelection(column.type);
        case 'expand':
          return renderExpand();
      }
    }
    return (
      <th
        ref={cellRef}
        key={column._columnKey}
        style={style}
        className={className}
        colSpan={column.colSpan}
        rowSpan={'children' in column && column?.children.length ? 1 : rowSpan}
      >
        <div className="cell-header">
          <span
            ref={columnTitleRef}
            className={classnames({
              'column-title': true,
              'column-title-ellipsis': !!column.ellipsis,
            })}
          >
            {renderTitle()}
          </span>
          {column.sorter || column.filters ? (
            <div className="sorter-filter">
              {column.sorter ? renderSorterContent() : null}
              {column.filters ? renderFilterContent() : null}
            </div>
          ) : null}
        </div>
        {renderResizeContent()}
      </th>
    );
  };

  return renderContent();
}

export default Th;
