import React, { useRef, useEffect, useState } from 'react';
import classnames from 'classnames';
import type { Expandable, PrivateColumnType, RowSelection, TreeExpandable } from '../interface1';
import Tooltip from '../Tooltip';
import { getPropertyValueSum } from '../utils/util';
import '../style/index.less';
import Radio from '../Radio';
import Checkbox from '../Checkbox';

interface TdProps<T> {
  rowData: T;
  isTree: boolean;
  colSpan: number;
  rowSpan: number;
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
}

function Td<T extends { key?: number | string; children?: T[] }>(props: TdProps<T>) {
  // const {
  //   colSpan,
  //   rowSpan,
  //   align,
  //   className = '',
  //   fixed,
  //   _lastLeftFixed,
  //   _firstRightFixed,
  //   content,
  //   type,
  //   scrollLeft,
  //   offsetRight,
  //   ignoreRightBorder,
  //   ellipsis,
  // } = props;

  const {
    isTree,
    rowData,
    rowSpan,
    colSpan,
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
  } = props;
  // todo className style 还没有修改

  const cellRef = useRef<HTMLTableCellElement>(null);

  const [isOverflow, setIsOverflow] = useState<boolean>(false);

  // todo 依赖项content 是不是换成col col 中包含width
  useEffect(() => {
    const cellEl = cellRef.current;
    if (cellEl && column?.ellipsis && column?.title) {
      const firstChild = cellEl.firstElementChild;
      if (firstChild) {
        const values = getPropertyValueSum(cellEl, [
          'padding-left',
          'padding-right',
          'border-left-width',
          'border-right-width',
        ]);
        const range = document.createRange();
        range.setStart(firstChild, 0);
        range.setEnd(firstChild, firstChild.childNodes.length);
        const { width: rangeWidth } = range.getBoundingClientRect();
        const { width: cellWidth } = cellEl.getBoundingClientRect();
        const realWidth = cellWidth - values;
        setIsOverflow(rangeWidth > realWidth);
      }
    }
  }, [column]);

  // todo 默认不知道是不是left
  const align = column?.align || 'left';

  const fixedLeft = column?.fixed === 'left';
  const fixedRight = column?.fixed === 'right';

  const isSelectionExpand =
    'type' in column && column.type && ['expand', 'radio', 'checkbox'].includes(column.type);

  const cls = classnames({
    'cell-ellipsis': !!column?.ellipsis,
    'cell-fixed-left': fixedLeft,
    'cell-fixed-right': fixedRight,
    'cell-is-last-fixedLeft': !!column?._lastLeftFixed,
    'cell-is-first-fixedRight': !!column?._firstRightFixed,
    [`cell-align-${align}`]: !!align,
    'selection-expand-column': isSelectionExpand,
    'cell-ignore-right-border': ignoreRightBorder,
    [column?.className ?? '']: !!column?.className,
  });
  const styles: any = {};

  const ellipsis = column.ellipsis;

  const showTooltip = typeof ellipsis === 'object' && ellipsis?.tooltip;

  const renderTooltip = (content: React.ReactNode) => {
    if (typeof ellipsis === 'object') {
      const triggerEl = <span className="cell-tooltip-content">{content}</span>;
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
      <span className="cell-tooltip-content">{content}</span>
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
          // handleSelect(isRadio, checked == true, rowData, rowIndex, recordKey, selected, event);
          event.stopPropagation();
        }}
      />
    ) : (
      <Checkbox
        {...checkboxProps}
        checked={checked}
        onChange={(selected: boolean, event: Event) => {
          handleSelect(isRadio, checked === true, rowData, recordKey, selected, event);
          // handleSelect(isRadio, checked == true, rowData, rowIndex, recordKey, selected, event);
          event.stopPropagation();
        }}
      />
    );
    // todo 待测试如果直接返回defaultContent 能不能触发内容handleSelect 函数
    // todo 考虑column.render 待测试
    return (
      <td colSpan={colSpan} rowSpan={rowSpan} className={cls} style={styles}>
        {rowSelection?.renderCell
          ? rowSelection?.renderCell(!!checked, rowData, rowIndex, defaultContent)
          : column?.render
          ? column.render(rowData, rowData, rowIndex)
          : defaultContent}
      </td>
    );
  };

  const renderExpandCell = () => {
    if (expandable?.rowExpandable && !expandable?.rowExpandable(rowData)) {
      return <td colSpan={colSpan} rowSpan={rowSpan} className={cls} style={styles} />;
    }
    const expandIcon = (
      <span
        className={classnames({
          'expand-icon': true,
          'expand-icon-divider': expanded,
        })}
        onClick={(event) => {
          handleExpand(!expanded, rowData, recordKey);
          event.stopPropagation();
        }}
      />
    );

    return (
      <td colSpan={colSpan} rowSpan={rowSpan} className={cls} style={styles}>
        {expandable?.expandIcon
          ? expandable.expandIcon(rowData, expanded, expandable?.onExpand)
          : expandIcon}
      </td>
    );
  };

  const renderCell = () => {
    if ('type' in column && column.type && ['expand', 'radio', 'checkbox'].includes(column.type)) {
      switch (column.type) {
        case 'radio':
        case 'checkbox':
          return renderSelectionCell(column.type);
        case 'expand':
          return renderExpandCell();
      }
    }
    const isTreeColumn =
      ((treeProps?.treeColumnsName && treeProps.treeColumnsName === column.title) ||
        (isFirstDefaultColumn && !treeProps?.treeColumnsName)) &&
      isTree;

    const hasChildren = rowData?.children && rowData.children.length > 0;
    // todo 考虑 属性中的ellipsis
    let content: React.ReactNode;
    if (typeof column?.render === 'function') {
      // todo bug 如果没有这个字段怎么办
      content = column.render(
        column?.dataIndex ? rowData[column.dataIndex as keyof T] : rowData,
        rowData,
        rowIndex,
      );
      // content = render(rowData[dataIndex as keyof T] as string, rowData, rowIndex);
    } else {
      content = rowData[column?.dataIndex as keyof T] as React.ReactNode;
    }

    if (hasChildren && isTreeColumn) {
      const defaultTreeIcon = (
        <span
          onClick={() => {
            handleTreeExpand(!treeExpanded, rowData, recordKey);
          }}
          className={classnames({
            'expand-icon': true,
            'icon-tree': true,
            'expand-icon-divider': treeExpanded,
          })}
        />
      );
      const treeIcon =
        typeof treeProps?.expandIcon === 'function'
          ? treeProps.expandIcon(rowData, treeExpanded, treeProps?.onExpand)
          : defaultTreeIcon;
      return (
        <td colSpan={colSpan} rowSpan={rowSpan} className={cls} style={styles}>
          <span style={{ marginLeft: treeLevel * treeIndent }}>
            {treeIcon}
            {content}
          </span>
        </td>
      );
    }

    if (isTreeColumn) {
      return (
        <td colSpan={colSpan} rowSpan={rowSpan} className={cls} style={styles}>
          <span
            style={{
              marginLeft: treeLevel * treeIndent,
              paddingLeft: treeLevel > 0 || (isTree && treeLevel === 0) ? 25 : 0,
            }}
          >
            {content}
          </span>
        </td>
      );
    }
    return (
      <td colSpan={colSpan} rowSpan={rowSpan} className={cls} style={styles} ref={cellRef}>
        {renderContent(content)}
      </td>
    );
  };

  return renderCell();

  // return (
  //   <td colSpan={colSpan} rowSpan={rowSpan} className={cls} style={styles} ref={cellRef}>
  //     {showTooltip && isOverflow ? (
  //       renderTooltip()
  //     ) : !!ellipsis ? (
  //       <span className="cell-tooltip-content">{cellContent}</span>
  //     ) : (
  //       cellContent
  //     )}
  //   </td>
  // );
}
export default Td;
