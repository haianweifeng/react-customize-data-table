import classnames from 'classnames';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Checkbox from '../Checkbox';
import type {
  ColumnType,
  Expandable,
  PrivateColumnType,
  RowSelection,
  TreeExpandable,
} from '../interface';
import Radio from '../Radio';
import '../style/index.less';
import Tooltip from '../Tooltip';
import {
  CLASS_CELL_FIXED_FIRST,
  CLASS_CELL_FIXED_FIRST_RIGHT,
  CLASS_CELL_FIXED_LAST,
  CLASS_CELL_FIXED_LAST_LEFT,
  CLASS_CELL_FIXED_LEFT,
  CLASS_CELL_FIXED_RIGHT,
  PREFIXCLS,
} from '../utils/constant';
import { getPropertyValueSum, omitColumnProps } from '../utils/util';

interface TdProps<T> {
  rowData: T;
  isTree: boolean;
  colSpan: number;
  rowSpan: number;
  colIndex: number;
  rowIndex: number;
  expanded: boolean;
  treeLevel: number;
  treeIndent: number;
  recordKey: React.Key;
  treeExpanded: boolean;
  ignoreRightBorder: boolean;
  checked: boolean | 'indeterminate';
  column: PrivateColumnType<T>;
  treeProps?: TreeExpandable<T>;
  expandable?: Expandable<T>;
  rowSelection?: RowSelection<T>;
  isFirstDefaultColumn: boolean;
  virtualized: boolean;
  offsetLeft: number;
  offsetRight: number;
  handleSelect: (
    isRadio: boolean,
    isChecked: boolean,
    record: T,
    recordKey: React.Key,
    selected: boolean,
    event: Event,
  ) => void;
  handleExpand: (expanded: boolean, record: T, recordKey: number | string) => void;
  handleTreeExpand: (treeExpanded: boolean, record: T, recordKey: number | string) => void;
  cellClassName?: ((column: ColumnType<T>, rowIndex: number, colIndex: number) => string) | string;
  cellStyle?:
    | ((column: ColumnType<T>, rowIndex: number, colIndex: number) => React.CSSProperties)
    | React.CSSProperties;
  onCellEvents?: (record: T, rowIndex: number) => object;
}

function Td<T extends { key?: number | string; children?: T[] }>(props: TdProps<T>) {
  const {
    isTree,
    rowData,
    rowSpan,
    colSpan,
    colIndex,
    rowIndex,
    column,
    checked,
    expanded,
    expandable,
    treeProps,
    rowSelection,
    recordKey,
    treeLevel,
    treeIndent,
    treeExpanded,
    handleExpand,
    handleSelect,
    handleTreeExpand,
    ignoreRightBorder,
    isFirstDefaultColumn,
    cellClassName,
    cellStyle,
    onCellEvents,
    virtualized,
    offsetLeft,
    offsetRight,
  } = props;

  const cellRef = useRef<HTMLTableCellElement>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  const [isOverflow, setIsOverflow] = useState<boolean>(false);

  const hasChildren = useMemo(() => {
    return rowData?.children && rowData.children.length > 0;
  }, [rowData]);

  const isTreeColumn =
    ((treeProps?.treeColumnsName && treeProps.treeColumnsName === column?.title) ||
      (isFirstDefaultColumn && !treeProps?.treeColumnsName)) &&
    isTree;

  const isSelectionExpand =
    'type' in column && column.type && ['expand', 'radio', 'checkbox'].includes(column.type);

  useEffect(() => {
    const cellEl = cellRef.current;
    const contentEl = contentRef.current;
    const targetEl = isTreeColumn ? contentEl : cellEl;
    if (targetEl && column?.ellipsis && !isSelectionExpand) {
      const firstChild = isTreeColumn ? contentEl?.firstElementChild : cellEl?.firstElementChild;
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
  }, [isTreeColumn, column, isSelectionExpand]);

  const align = column?.align || 'left';

  const classes: Record<string, boolean> = {
    [`${PREFIXCLS}-cell-ellipsis`]: !!column?.ellipsis && !isSelectionExpand && !isTreeColumn,
    [CLASS_CELL_FIXED_LEFT]: column?.fixed === 'left',
    [CLASS_CELL_FIXED_RIGHT]: column?.fixed === 'right',
    [CLASS_CELL_FIXED_LAST]: !!column?._lastLeftFixed,
    [CLASS_CELL_FIXED_FIRST]: !!column?._firstRightFixed,
    [`${PREFIXCLS}-cell-align-${align}`]: !!align,
    [`${PREFIXCLS}-selection-expand-column`]: !!isSelectionExpand,
    [`${PREFIXCLS}-cell-ignore-right-border`]: ignoreRightBorder,
    [CLASS_CELL_FIXED_LAST_LEFT]: !!column?._lastLeftFixed && virtualized && offsetLeft > 0,
    [CLASS_CELL_FIXED_FIRST_RIGHT]: !!column?._firstRightFixed && virtualized && offsetRight > 0,
    [column?.className ?? '']: !!column?.className,
  };

  if (cellClassName) {
    const cls =
      typeof cellClassName === 'function'
        ? cellClassName(omitColumnProps(column), rowIndex, colIndex)
        : cellClassName;
    classes[cls] = !!cls;
  }

  const cls = classnames(classes);

  const styles: React.CSSProperties = useMemo(() => {
    const style: React.CSSProperties =
      typeof cellStyle === 'function'
        ? cellStyle(omitColumnProps(column), rowIndex, colIndex) ?? {}
        : cellStyle || {};
    if (virtualized) {
      if (column?.fixed === 'left' && offsetLeft) {
        style.transform = `translateX(${offsetLeft}px)`;
      }
      if (column?.fixed === 'right' && offsetRight) {
        style.transform = `translateX(-${offsetRight}px)`;
      }
    }
    return style;
  }, [cellStyle, column, rowIndex, colIndex, virtualized, offsetLeft, offsetRight]);

  const cellEvents = useMemo(() => {
    return typeof onCellEvents === 'function' ? onCellEvents(rowData, rowIndex) : {};
  }, [onCellEvents, rowData, rowIndex]);

  const ellipsis = column.ellipsis;

  const showTooltip = typeof ellipsis === 'object' && ellipsis?.tooltip;

  const renderTooltip = (content: React.ReactNode) => {
    if (typeof ellipsis === 'object') {
      const triggerEl = <span className={`${PREFIXCLS}-cell-tooltip-content`}>{content}</span>;
      if (ellipsis?.renderTooltip) {
        return ellipsis.renderTooltip(triggerEl, content);
      }
      return (
        <Tooltip tip={content} theme={ellipsis?.tooltipTheme}>
          {triggerEl}
        </Tooltip>
      );
    }
  };

  const renderContent = (content: React.ReactNode) => {
    return showTooltip && isOverflow ? (
      renderTooltip(content)
    ) : !!column?.ellipsis ? (
      <span className={`${PREFIXCLS}-cell-tooltip-content`}>{content}</span>
    ) : (
      content
    );
  };

  const renderSelectionCell = (columnType: 'radio' | 'checkbox') => {
    const checkboxProps =
      typeof rowSelection?.getCheckboxProps === 'function'
        ? rowSelection.getCheckboxProps(rowData)
        : {};
    const isRadio = columnType === 'radio';
    const defaultContent = isRadio ? (
      <Radio
        {...checkboxProps}
        checked={checked}
        onChange={(selected: boolean, event: Event) => {
          handleSelect(isRadio, checked === true, rowData, recordKey, selected, event);
          event.stopPropagation();
        }}
      />
    ) : (
      <Checkbox
        {...checkboxProps}
        checked={checked}
        onChange={(selected: boolean, event: Event) => {
          handleSelect(isRadio, checked === true, rowData, recordKey, selected, event);
          event.stopPropagation();
        }}
      />
    );

    return (
      <td colSpan={colSpan} rowSpan={rowSpan} className={cls} style={styles} {...cellEvents}>
        {rowSelection?.renderCell
          ? rowSelection?.renderCell(!!checked, rowData, rowIndex, defaultContent)
          : defaultContent}
      </td>
    );
  };

  const renderExpandCell = () => {
    if (expandable?.rowExpandable && !expandable?.rowExpandable(rowData)) {
      return (
        <td colSpan={colSpan} rowSpan={rowSpan} className={cls} style={styles} {...cellEvents} />
      );
    }
    const expandIcon = (
      <span
        className={classnames({
          [`${PREFIXCLS}-expand-icon`]: true,
          [`${PREFIXCLS}-expand-icon-divider`]: expanded,
        })}
        onClick={(event) => {
          handleExpand(!expanded, rowData, recordKey);
          event.stopPropagation();
        }}
      />
    );

    return (
      <td colSpan={colSpan} rowSpan={rowSpan} className={cls} style={styles} {...cellEvents}>
        {expandable?.expandIcon
          ? expandable.expandIcon(rowData, expanded, expandable?.onExpand)
          : expandIcon}
      </td>
    );
  };

  const renderCell = () => {
    if ('type' in column && column.type && ['expand', 'radio', 'checkbox'].includes(column.type)) {
      if (column.type === 'radio' || column.type === 'checkbox') {
        return renderSelectionCell(column.type);
      } else if (column.type === 'expand') {
        return renderExpandCell();
      }
    }

    let content: React.ReactNode;
    if (typeof column?.render === 'function') {
      content = column.render(
        column?.dataIndex ? rowData[column.dataIndex as keyof T] : rowData,
        rowData,
        rowIndex,
      );
    } else {
      content = rowData[column?.dataIndex as keyof T] as React.ReactNode;
    }

    if (hasChildren && isTreeColumn) {
      const defaultTreeIcon = (
        <span
          onClick={(event: React.MouseEvent) => {
            handleTreeExpand(!treeExpanded, rowData, recordKey);
            event.stopPropagation();
          }}
          className={classnames({
            [`${PREFIXCLS}-expand-icon`]: true,
            [`${PREFIXCLS}-icon-tree`]: true,
            [`${PREFIXCLS}-expand-icon-divider`]: treeExpanded,
          })}
        />
      );
      const treeIcon =
        typeof treeProps?.expandIcon === 'function'
          ? treeProps.expandIcon(rowData, treeExpanded, treeProps?.onExpand)
          : defaultTreeIcon;
      return (
        <td
          colSpan={colSpan}
          rowSpan={rowSpan}
          className={cls}
          style={styles}
          ref={cellRef}
          {...cellEvents}
        >
          <div
            style={{ marginLeft: treeLevel * treeIndent }}
            className={`${PREFIXCLS}-cell-tree-container`}
          >
            {treeIcon}
            <span ref={contentRef} className={`${PREFIXCLS}-cell-content-ellipsis`}>
              {renderContent(content)}
            </span>
          </div>
        </td>
      );
    }

    if (isTreeColumn) {
      return (
        <td
          colSpan={colSpan}
          rowSpan={rowSpan}
          className={cls}
          style={styles}
          ref={cellRef}
          {...cellEvents}
        >
          <div
            style={{
              marginLeft: treeLevel * treeIndent,
              paddingLeft: treeLevel > 0 || (isTree && treeLevel === 0) ? 25 : 0,
            }}
            ref={contentRef}
            className={`${PREFIXCLS}-cell-content-ellipsis`}
          >
            {renderContent(content)}
          </div>
        </td>
      );
    }
    return (
      <td
        colSpan={colSpan}
        rowSpan={rowSpan}
        className={cls}
        style={styles}
        ref={cellRef}
        {...cellEvents}
      >
        {renderContent(content)}
      </td>
    );
  };

  return renderCell();
}
export default Td;
